import {randomUUID} from 'node:crypto';
import type {Payload} from 'payload';
import type {PoolClient} from 'pg';
import {canUseInventory,canPerformInventory,parseInventoryCommand,inventoryFingerprint,assertStockChange,InventoryError,type InventoryActor,type InventoryCommand} from './inventory.ts';

type Client=PoolClient;
type Balance={onHand:number;reserved:number;blocked:number;available:number;ledgerReserved:number;expiredPending:number;consistent:boolean};
type Reservation={id:number;reference:string;quantity:number;remainingQuantity:number;dispatchedQuantity:number;releasedQuantity:number;expiredQuantity:number;expiresAt:string;status:'held'|'expired'|'release'|'dispatch'|'expire';enquiryReference:string;skuSnapshot:unknown};
type Movement={id:number;kind:string;onHandDelta:number;reservedDelta:number;blockedDelta:number;confirmedQuantity:number|null;actorId:number|null;actorRole:string;reason:string;createdAt:string};
type Freshness={status:'policy-unset'|'policy-invalid'|'unconfirmed'|'fresh'|'stale';confirmedAt:string|null;thresholdHours:number|null};
type Sku={id:number;skuCode:string;active:boolean;configuration:unknown;model:string};
export type InventoryView={role:string;skus:Sku[];enquiries:{id:number;reference:string;items:{id:string;model:string;quantity:number;range:string|null}[]}[];balance:Balance|null;freshness:Freshness|null;reservations:Reservation[];movements:Movement[]};

async function transaction<T>(payload:Payload,work:(client:Client)=>Promise<T>){
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout='8s'; SET LOCAL lock_timeout='3s'; SET LOCAL idle_in_transaction_session_timeout='15s'");
    const result=await work(client);await client.query('COMMIT');return result;
  }catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
async function verifyActor(client:Client,actor:unknown,kind?:InventoryCommand['kind']){
  if(!canUseInventory(actor))throw new InventoryError('Authorized staff sign-in required',403);
  const stored=await client.query('SELECT id,role FROM staff WHERE id=$1 FOR SHARE',[actor.id]);
  const user={...stored.rows[0],collection:'staff'};
  if(!canUseInventory(user)||(kind&&!canPerformInventory(user,kind)))throw new InventoryError('Your staff role cannot perform this action',403);
  return user;
}
async function lockSku(client:Client,skuId:number){await client.query('SELECT pg_advisory_xact_lock(18042,$1)',[skuId]);}
// Original quantities provide an independent check against the immutable initial
// hold movement. Only consumption events reduce the remaining allocation.
const reservationTotals=`SELECT r.*,
  r.quantity+COALESCE(sum(m.reserved_delta) FILTER (WHERE m.kind IN ('dispatch','release','expire')),0) AS remaining_quantity,
  COALESCE(-sum(m.on_hand_delta) FILTER (WHERE m.kind='dispatch'),0) AS dispatched_quantity,
  COALESCE(-sum(m.reserved_delta) FILTER (WHERE m.kind='release'),0) AS released_quantity,
  COALESCE(-sum(m.reserved_delta) FILTER (WHERE m.kind='expire'),0) AS expired_quantity,
  COALESCE(max(m.reserved_delta) FILTER (WHERE m.kind='hold'),0) AS initial_quantity,
  count(m.id) FILTER (WHERE m.kind='hold') AS initial_count,
  count(m.id) FILTER (WHERE m.sku_id<>r.sku_id) AS mismatched_skus,
  COALESCE(bool_or(m.close_key IS NOT NULL),false) AS closed
  FROM inventory_reservations r LEFT JOIN inventory_movements m ON m.reservation_id=r.id
  WHERE r.sku_id=$1 GROUP BY r.id`;
async function balanceFor(client:Client,skuId:number):Promise<Balance>{
  const result=await client.query(`WITH reservation_totals AS (${reservationTotals}) SELECT
    COALESCE((SELECT sum(on_hand_delta) FROM inventory_movements WHERE sku_id=$1),0)::bigint AS on_hand,
    COALESCE((SELECT sum(blocked_delta) FROM inventory_movements WHERE sku_id=$1),0)::bigint AS blocked,
    COALESCE((SELECT sum(reserved_delta) FROM inventory_movements WHERE sku_id=$1),0)::bigint AS ledger_reserved,
    COALESCE(sum(r.remaining_quantity) FILTER (WHERE NOT r.closed AND r.expires_at>statement_timestamp()),0)::bigint AS reserved,
    COALESCE(sum(r.remaining_quantity) FILTER (WHERE NOT r.closed AND r.expires_at<=statement_timestamp()),0)::bigint AS expired_pending,
    COALESCE(sum(r.remaining_quantity),0)::bigint AS open_total,
    COALESCE(bool_and(r.initial_count=1 AND r.initial_quantity=r.quantity AND r.mismatched_skus=0
      AND r.remaining_quantity BETWEEN 0 AND r.quantity AND r.closed=(r.remaining_quantity=0)),true) AS reservations_consistent
    FROM reservation_totals r`,[skuId]);
  const row=result.rows[0];const onHand=Number(row.on_hand),reserved=Number(row.reserved),blocked=Number(row.blocked),ledgerReserved=Number(row.ledger_reserved),expiredPending=Number(row.expired_pending);
  return {onHand,reserved,blocked,available:onHand-reserved-blocked,ledgerReserved,expiredPending,
    consistent:[onHand,reserved,blocked,ledgerReserved,expiredPending].every(Number.isSafeInteger)&&onHand<=999999999&&onHand>=reserved+blocked&&onHand>=0&&reserved>=0&&blocked>=0&&ledgerReserved===Number(row.open_total)&&row.reservations_consistent};
}
async function freshnessFor(client:Client,skuId:number):Promise<Freshness>{
  const result=await client.query(`SELECT statement_timestamp() AS checked_at,
    (SELECT created_at FROM inventory_movements WHERE sku_id=$1 AND kind='confirm' ORDER BY created_at DESC,id DESC LIMIT 1) AS confirmed_at`,[skuId]);
  const row=result.rows[0];const confirmedAt=row.confirmed_at?new Date(row.confirmed_at).toISOString():null;
  const setting=process.env.INVENTORY_FRESHNESS_HOURS?.trim();
  if(!setting)return {status:'policy-unset',confirmedAt,thresholdHours:null};
  const hours=Number(setting);
  if(!/^\d+$/.test(setting)||!Number.isSafeInteger(hours)||hours<1||hours>8760)return {status:'policy-invalid',confirmedAt,thresholdHours:null};
  if(!confirmedAt)return {status:'unconfirmed',confirmedAt,thresholdHours:hours};
  const age=new Date(row.checked_at).getTime()-Date.parse(confirmedAt);
  return {status:age>=0&&age<hours*3600000?'fresh':'stale',confirmedAt,thresholdHours:hours};
}
async function expireDue(client:Client,skuId:number,limit:number){
  const due=await client.query(`WITH reservation_totals AS (${reservationTotals})
    SELECT r.id,r.remaining_quantity FROM reservation_totals r WHERE NOT r.closed AND r.expires_at<=statement_timestamp()
    ORDER BY r.expires_at,r.id LIMIT $2`,[skuId,limit]);
  for(const row of due.rows)await client.query(`INSERT INTO inventory_movements
    (request_key,fingerprint,kind,sku_id,reservation_id,close_key,on_hand_delta,reserved_delta,actor_id,actor_role,reason,created_at,updated_at)
    VALUES ($1,$1,'expire',$2,$3,$4,0,$5,NULL,'system','Hold expiry reached; availability released automatically',statement_timestamp(),statement_timestamp())`,
    [`expiry-${row.id}`,skuId,row.id,`closed-${row.id}`,-Number(row.remaining_quantity)]);
  return due.rowCount??0;
}
function assertReconciled(balance:Balance){if(!balance.consistent)throw new InventoryError('Inventory reconciliation failed. Ask the owner to investigate the audit ledger before changing stock.',409);}

// Only this service writes the private stock tables. One PostgreSQL connection owns every
// lock, read and write through COMMIT; no process-local lock can protect multiple instances.
export async function executeInventory(payload:Payload,actor:unknown,raw:unknown){
  const command=parseInventoryCommand(raw);
  if(!canUseInventory(actor)||!canPerformInventory(actor,command.kind))throw new InventoryError('Your staff role cannot perform this action',403);
  return transaction(payload,async client=>{
    const user=await verifyActor(client,actor,command.kind);
    const fingerprint=inventoryFingerprint(command,user.id);
    await client.query('SELECT pg_advisory_xact_lock(18041,hashtext($1))',[command.requestKey]);
    const previous=await client.query('SELECT id,fingerprint,reservation_id FROM inventory_movements WHERE request_key=$1',[command.requestKey]);
    if(previous.rows[0]){
      if(previous.rows[0].fingerprint!==fingerprint)throw new InventoryError('This request key was already used for different details or a different staff member',409);
      return {movementId:Number(previous.rows[0].id),reservationId:previous.rows[0].reservation_id as number|null,repeated:true};
    }
    await lockSku(client,command.skuId);
    const skuResult=await client.query('SELECT s.id,s.sku_code,s.product_id,s.configuration,s.active,p.model FROM skus s JOIN products p ON p.id=s.product_id WHERE s.id=$1 FOR SHARE OF s',[command.skuId]);
    const sku=skuResult.rows[0];if(!sku)throw new InventoryError('SKU not found',404);
    if(['receipt','hold'].includes(command.kind)&&!sku.active)throw new InventoryError('Activate and review this exact SKU before receiving stock or creating a hold',409);
    assertReconciled(await balanceFor(client,command.skuId));
    await expireDue(client,command.skuId,100);
    const balance=await balanceFor(client,command.skuId);assertReconciled(balance);
    let onHandDelta=0,reservedDelta=0,blockedDelta=0,confirmedQuantity:number|null=null,reservationId:number|null=null,closeKey:string|null=null;
    if(command.kind==='receipt'||command.kind==='adjustment'){
      onHandDelta=command.quantity!;assertStockChange(balance.onHand,balance.reserved,onHandDelta,balance.blocked);
    }else if(command.kind==='block'||command.kind==='unblock'){
      blockedDelta=command.kind==='block'?command.quantity!:-command.quantity!;
      if(balance.blocked+blockedDelta<0||blockedDelta>balance.available)throw new InventoryError('This action exceeds available or blocked stock',409);
    }else if(command.kind==='confirm'){
      if(command.quantity!==balance.onHand)throw new InventoryError('The physical count does not match the ledger. Investigate and record a documented adjustment before confirming.',409);
      confirmedQuantity=command.quantity;
    }else if(command.kind==='hold'){
      const freshness=await freshnessFor(client,command.skuId);
      if(freshness.status==='policy-invalid')throw new InventoryError('Stock freshness policy is invalid. Ask the owner to correct the configuration before creating a hold.',503);
      if(freshness.status==='stale'||freshness.status==='unconfirmed')throw new InventoryError('The owner or warehouse must confirm a current physical count before creating this hold.',409);
      // A separate enquiry lock prevents two SKUs over-allocating the same requested line.
      await client.query('SELECT pg_advisory_xact_lock(18043,$1)',[command.enquiryId]);
      const enquiry=await client.query(`SELECT e.id FROM enquiries e WHERE e.id=$1 AND e.source='cms' AND e.verification_status='verified'
        AND e.verified_at IS NOT NULL AND e.status<>'closed' FOR SHARE`,[command.enquiryId]);
      if(!enquiry.rowCount)throw new InventoryError('A verified, open customer enquiry is required',409);
      const requested=await client.query('SELECT product_id,model,quantity FROM enquiries_items WHERE _parent_id=$1 AND id=$2',[command.enquiryId,command.enquiryLineId]);
      const line=requested.rows[0];
      if(!line||(line.product_id!==`cms-${sku.product_id}`&&!(line.product_id==='customer-specified'&&line.model.toLowerCase()===String(sku.model).toLowerCase())))throw new InventoryError('This SKU does not match the selected enquiry line. Review its product and configuration first.',409);
      const allocation=await client.query(`SELECT COALESCE(sum(consumed.dispatched+
        CASE WHEN r.expires_at>statement_timestamp() AND NOT consumed.closed THEN r.quantity+consumed.change ELSE 0 END),0)::bigint AS quantity
        FROM inventory_reservations r CROSS JOIN LATERAL (
          SELECT COALESCE(-sum(m.on_hand_delta) FILTER (WHERE m.kind='dispatch'),0) AS dispatched,
            COALESCE(sum(m.reserved_delta) FILTER (WHERE m.kind IN ('dispatch','release','expire')),0) AS change,
            COALESCE(bool_or(m.close_key IS NOT NULL),false) AS closed
          FROM inventory_movements m WHERE m.reservation_id=r.id
        ) consumed WHERE r.enquiry_id=$1 AND r.enquiry_line_id=$2`,[command.enquiryId,command.enquiryLineId]);
      if(Number(allocation.rows[0].quantity)+command.quantity!>Number(line.quantity))throw new InventoryError('Held and dispatched quantities would exceed this enquiry line',409);
      const expiry=await client.query("SELECT $1::timestamptz>statement_timestamp() AND $1::timestamptz<=statement_timestamp()+interval '30 days' AS valid",[command.expiresAt]);
      if(!expiry.rows[0].valid)throw new InventoryError('Choose a future hold expiry within 30 days');
      if(command.quantity!>balance.available)throw new InventoryError('Insufficient available stock',409);
      const reservation=await client.query(`INSERT INTO inventory_reservations
        (reference,sku_id,enquiry_id,enquiry_line_id,quantity,expires_at,actor_id,reason,sku_snapshot,created_at,updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,statement_timestamp(),statement_timestamp()) RETURNING id`,
        [`HOLD-${randomUUID()}`,command.skuId,command.enquiryId,command.enquiryLineId,command.quantity,command.expiresAt,user.id,command.reason,JSON.stringify({skuCode:sku.sku_code,productId:sku.product_id,model:sku.model,configuration:sku.configuration})]);
      reservationId=Number(reservation.rows[0].id);reservedDelta=command.quantity!;
    }else if(command.kind==='release'||command.kind==='dispatch'){
      const reservation=await client.query(`WITH reservation_totals AS (${reservationTotals})
        SELECT r.id,r.remaining_quantity,r.expires_at>statement_timestamp() AS live FROM reservation_totals r WHERE r.id=$2 AND NOT r.closed`,[command.skuId,command.reservationId]);
      const held=reservation.rows[0];if(!held||!held.live)throw new InventoryError('This reservation is already released, dispatched or expired',409);
      const remaining=Number(held.remaining_quantity),quantity=command.quantity??remaining;
      if(quantity>remaining)throw new InventoryError('This quantity exceeds the remaining held units',409);
      reservationId=Number(held.id);closeKey=quantity===remaining?`closed-${held.id}`:null;reservedDelta=-quantity;
      if(command.kind==='dispatch'){onHandDelta=-quantity;assertStockChange(balance.onHand,balance.reserved+reservedDelta,onHandDelta,balance.blocked);}
    }
    const result=await client.query(`INSERT INTO inventory_movements
      (request_key,fingerprint,kind,sku_id,reservation_id,close_key,on_hand_delta,reserved_delta,blocked_delta,confirmed_quantity,actor_id,actor_role,reason,created_at,updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,statement_timestamp(),statement_timestamp()) RETURNING id`,
      [command.requestKey,fingerprint,command.kind,command.skuId,reservationId,closeKey,onHandDelta,reservedDelta,blockedDelta,confirmedQuantity,user.id,user.role,command.reason]);
    assertReconciled(await balanceFor(client,command.skuId));
    return {movementId:Number(result.rows[0].id),reservationId,repeated:false};
  });
}

// The worker supplies its existing authenticated scheduler boundary. This helper has no
// public route. Availability excludes expired holds immediately, even when a worker is late.
export async function expireInventoryHolds(payload:Payload,options:{deadlineAt:number;maxItems:number}){
  const limit=Math.min(100,Math.max(0,Math.floor(options.maxItems)));let expired=0;
  if(!Number.isFinite(options.deadlineAt)||!Number.isFinite(limit)||limit<1||Date.now()>=options.deadlineAt)return {expired};
  const candidates=await payload.db.pool.query(`SELECT DISTINCT r.sku_id FROM inventory_reservations r
    WHERE r.expires_at<=statement_timestamp() AND NOT EXISTS (SELECT 1 FROM inventory_movements m WHERE m.reservation_id=r.id AND m.close_key IS NOT NULL)
    ORDER BY r.sku_id LIMIT $1`,[limit]);
  for(const row of candidates.rows){
    if(expired>=limit||Date.now()>=options.deadlineAt-500)break;
    expired+=await transaction(payload,async client=>{
      // Skip a busy SKU so a scheduler run stays bounded and cannot delay staff work.
      const lock=await client.query('SELECT pg_try_advisory_xact_lock(18042,$1) AS acquired',[row.sku_id]);
      if(!lock.rows[0].acquired)return 0;
      assertReconciled(await balanceFor(client,row.sku_id));
      return expireDue(client,row.sku_id,limit-expired);
    });
  }
  return {expired};
}

export async function readInventory(payload:Payload,actor:unknown,url:URL):Promise<InventoryView>{
  if(!canUseInventory(actor))throw new InventoryError('Authorized staff sign-in required',403);
  return transaction(payload,async client=>{
    const user=await verifyActor(client,actor);
    const skuId=Number(url.searchParams.get('skuId'));
    const skuSearch=(url.searchParams.get('skuSearch')||'').slice(0,120);
    const enquirySearch=(url.searchParams.get('enquirySearch')||'').slice(0,120);
    // Escape LIKE metacharacters: staff searches are literal, bounded and parameterized.
    const pattern=(term:string)=>`%${term.replace(/[\\%_]/g,'\\$&')}%`;
    const skus=await client.query(`SELECT s.id,s.sku_code AS "skuCode",s.active,s.configuration,p.model FROM skus s JOIN products p ON p.id=s.product_id
      WHERE (s.sku_code ILIKE $1 OR p.model ILIKE $1 OR s.id=$2) ORDER BY (s.id=$2) DESC,s.sku_code LIMIT 100`,[pattern(skuSearch),Number.isSafeInteger(skuId)&&skuId>0?skuId:0]);
    const enquiries=user.role==='warehouse'?{rows:[]}:await client.query(`SELECT e.id,e.reference,
      (SELECT json_agg(json_build_object('id',i.id,'model',i.model,'quantity',i.quantity,'range',i.range) ORDER BY i._order) FROM enquiries_items i WHERE i._parent_id=e.id) AS items
      FROM enquiries e WHERE e.source='cms' AND e.request_kind='products' AND e.verification_status='verified' AND e.verified_at IS NOT NULL AND e.status<>'closed' AND e.reference ILIKE $1
      ORDER BY e.created_at DESC LIMIT 100`,[pattern(enquirySearch)]);
    const view:InventoryView={role:user.role,skus:skus.rows,enquiries:enquiries.rows,balance:null,freshness:null,reservations:[],movements:[]};
    if(!Number.isSafeInteger(skuId)||skuId<1)return view;
    await lockSku(client,skuId);
    const exists=await client.query('SELECT id FROM skus WHERE id=$1',[skuId]);if(!exists.rowCount)throw new InventoryError('SKU not found',404);
    view.balance=await balanceFor(client,skuId);
    view.freshness=await freshnessFor(client,skuId);
    const reservations=await client.query(`WITH reservation_totals AS (${reservationTotals})
      SELECT r.id,r.reference,r.quantity::int AS quantity,r.expires_at AS "expiresAt",r.sku_snapshot AS "skuSnapshot",e.reference AS "enquiryReference",
      (CASE WHEN r.expires_at>statement_timestamp() AND NOT r.closed THEN r.remaining_quantity ELSE 0 END)::int AS "remainingQuantity",
      r.dispatched_quantity::int AS "dispatchedQuantity",r.released_quantity::int AS "releasedQuantity",
      (r.expired_quantity+CASE WHEN NOT r.closed AND r.expires_at<=statement_timestamp() THEN r.remaining_quantity ELSE 0 END)::int AS "expiredQuantity",
      COALESCE(m.kind::text,CASE WHEN r.expires_at<=statement_timestamp() THEN 'expired' ELSE 'held' END) AS status FROM reservation_totals r
      LEFT JOIN inventory_movements m ON m.reservation_id=r.id AND m.close_key IS NOT NULL LEFT JOIN enquiries e ON e.id=r.enquiry_id
      WHERE r.sku_id=$1 ORDER BY (m.id IS NULL AND r.expires_at>statement_timestamp()) DESC,r.created_at DESC,r.id DESC LIMIT 100`,[skuId]);
    const movements=await client.query(`SELECT id,kind,on_hand_delta::int AS "onHandDelta",reserved_delta::int AS "reservedDelta",blocked_delta::int AS "blockedDelta",confirmed_quantity::int AS "confirmedQuantity",actor_id AS "actorId",actor_role AS "actorRole",reason,created_at AS "createdAt"
      FROM inventory_movements WHERE sku_id=$1 ORDER BY created_at DESC,id DESC LIMIT 100`,[skuId]);
    view.reservations=reservations.rows;view.movements=movements.rows;return view;
  });
}
