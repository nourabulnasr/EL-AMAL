import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {isolatedPayload} from './lib/isolated-payload.ts';
import {executeInventory,readInventory,expireInventoryHolds} from '../src/lib/inventory-service.ts';
import {InventoryError} from '../src/lib/inventory.ts';
import type {Staff} from '../src/payload-types.ts';

const {payload,close}=await isolatedPayload('inventory_test');
const suffix=`inventory-check-${randomUUID()}`;
const created:{collection:'staff'|'categories'|'products'|'skus'|'enquiries';id:number}[]=[];
const users={} as Record<'owner'|'sales'|'warehouse'|'catalogue-editor',Staff&{collection:'staff'}>;
const skuIds:number[]=[];let enquiryId=0;let lineId='';
const forbidden=(error:unknown)=>error instanceof Error&&'status' in error&&error.status===403;
const conflict=(error:unknown)=>error instanceof InventoryError&&error.status===409;
const originalFreshness=process.env.INVENTORY_FRESHNESS_HOURS;
delete process.env.INVENTORY_FRESHNESS_HOURS;
try{
  for(const role of ['owner','sales','warehouse','catalogue-editor'] as const){
    const doc=await payload.create({collection:'staff',overrideAccess:true,data:{email:`${role}-${suffix}@example.invalid`,password:randomBytes(32).toString('hex'),role}});
    created.push({collection:'staff',id:doc.id});users[role]={...doc,collection:'staff'};
  }
  const category=await payload.create({collection:'categories',overrideAccess:true,data:{key:suffix,name:{en:'Inventory regression fixture',ar:'اختبار المخزون'},description:{en:'Disposable development fixture',ar:'اختبار تطوير مؤقت'}}});created.push({collection:'categories',id:category.id});
  const product=await payload.create({collection:'products',overrideAccess:true,draft:true,data:{externalId:suffix,model:suffix,category:category.id,name:{en:'Inventory fixture',ar:'اختبار'},description:{en:'Not a real instrument',ar:'اختبار مؤقت'},sourceRef:'Automated isolated inventory regression',_status:'draft'}});created.push({collection:'products',id:product.id});
  for(let i=0;i<2;i++){
    const sku=await payload.create({collection:'skus',overrideAccess:true,data:{skuCode:`${suffix}-${i}`,product:product.id,configuration:{fixture:true,variant:i},active:true}});created.push({collection:'skus',id:sku.id});skuIds.push(sku.id);
  }
  const enquiry=await payload.create({collection:'enquiries',overrideAccess:true,data:{reference:suffix,requestKey:randomUUID(),fingerprint:'fixture-only',locale:'en',source:'cms',name:'Temporary tester',email:'inventory@example.invalid',company:'Disposable fixture',items:[{productId:`cms-${product.id}`,model:suffix,nameEn:'Fixture',nameAr:'اختبار',quantity:5}],verificationStatus:'verified',verifiedAt:new Date().toISOString(),deliveryStatus:'not-configured',status:'reviewing'}});
  created.push({collection:'enquiries',id:enquiry.id});enquiryId=enquiry.id;lineId=enquiry.items![0].id!;
  const command=(kind:string,extra:Record<string,unknown>={})=>({kind,requestKey:randomUUID(),skuId:skuIds[0],reason:'Automated disposable regression',...extra});
  const read=()=>readInventory(payload,users.owner,new URL(`https://example.invalid/api/staff/inventory?skuId=${skuIds[0]}`));
  assert.equal((await read()).balance?.onHand,0,'Catalogue/SKU creation must not invent a balance');
  const receipt=command('receipt',{quantity:5});
  const receipts=await Promise.all([executeInventory(payload,users.warehouse,receipt),executeInventory(payload,users.warehouse,receipt)]);
  assert.equal(receipts.filter(x=>x.repeated).length,1);assert.equal((await read()).balance?.onHand,5);
  await assert.rejects(executeInventory(payload,users.warehouse,{...receipt,quantity:6}),conflict);
  await assert.rejects(executeInventory(payload,users.owner,receipt),conflict,'Another actor cannot reuse an accepted key');
  const hold=()=>command('hold',{quantity:4,enquiryId,enquiryLineId:lineId,expiresAt:new Date(Date.now()+3600000).toISOString()});
  const holds=await Promise.allSettled([executeInventory(payload,users.sales,hold()),executeInventory(payload,users.sales,hold())]);
  assert.equal(holds.filter(x=>x.status==='fulfilled').length,1,'Concurrent holds cannot oversell');
  assert.equal((await read()).balance?.available,1);
  await assert.rejects(executeInventory(payload,users.warehouse,command('adjustment',{quantity:-2})),conflict);
  await executeInventory(payload,users.owner,command('receipt',{skuId:skuIds[1],quantity:8}));
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),skuId:skuIds[1],quantity:2}),conflict,'Different SKUs cannot over-allocate one enquiry line');
  let state=await read();const held=state.reservations.find(r=>r.status==='held')!;
  const partial=command('dispatch',{reservationId:held.id,quantity:2});
  const partialResults=await Promise.all([executeInventory(payload,users.warehouse,partial),executeInventory(payload,users.warehouse,partial)]);
  assert.equal(partialResults.filter(x=>x.repeated).length,1);
  state=await read();assert.equal(state.balance?.onHand,3);assert.equal(state.balance?.reserved,2,'Partial dispatch preserves unconsumed allocation');
  await assert.rejects(executeInventory(payload,users.warehouse,command('dispatch',{reservationId:held.id,quantity:3})),conflict);
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),skuId:skuIds[1],quantity:2}),conflict,'Dispatched and remaining held units both count against the line');
  const dispatch=command('dispatch',{reservationId:held.id});
  const dispatched=await Promise.all([executeInventory(payload,users.warehouse,dispatch),executeInventory(payload,users.warehouse,dispatch)]);
  assert.equal(dispatched.filter(x=>x.repeated).length,1);state=await read();assert.equal(state.balance?.onHand,1);assert.equal(state.balance?.reserved,0);
  await assert.rejects(executeInventory(payload,users.sales,command('release',{reservationId:held.id})),conflict);
  const lastHold=await executeInventory(payload,users.sales,{...hold(),quantity:1});
  const release=command('release',{reservationId:lastHold.reservationId});await executeInventory(payload,users.sales,release);await executeInventory(payload,users.sales,release);
  assert.equal((await read()).balance?.available,1);
  const crossSku=await Promise.allSettled([
    executeInventory(payload,users.sales,{...hold(),quantity:1}),
    executeInventory(payload,users.sales,{...hold(),skuId:skuIds[1],quantity:1}),
  ]);
  assert.equal(crossSku.filter(result=>result.status==='fulfilled').length,1,'Concurrent allocation across SKUs cannot exceed the remaining requested unit');
  for(let index=0;index<crossSku.length;index++){
    const result=crossSku[index];if(result.status==='fulfilled')await executeInventory(payload,users.sales,command('release',{skuId:skuIds[index],reservationId:result.value.reservationId}));
  }
  // Make only this disposable fixture due. Never modify production records or the clock.
  const toExpire=await executeInventory(payload,users.sales,{...hold(),quantity:1});
  await payload.db.pool.query("UPDATE inventory_reservations SET expires_at=now()-interval '1 second' WHERE id=$1 AND enquiry_id=$2",[toExpire.reservationId,enquiryId]);
  assert.equal((await read()).balance?.available,1,'Expiry frees availability even before a worker runs');
  await assert.rejects(executeInventory(payload,users.warehouse,command('dispatch',{reservationId:toExpire.reservationId})),conflict);
  await Promise.all([expireInventoryHolds(payload,{deadlineAt:Date.now()+15000,maxItems:10}),expireInventoryHolds(payload,{deadlineAt:Date.now()+15000,maxItems:10})]);
  const expired=await payload.db.pool.query("SELECT * FROM inventory_movements WHERE reservation_id=$1 AND kind='expire'",[toExpire.reservationId]);assert.equal(expired.rowCount,1);
  await executeInventory(payload,users.owner,command('reconcile'));state=await read();assert.equal(state.balance?.consistent,true);assert.equal(state.balance?.expiredPending,0);
  // Simulate a privileged maintenance error on one exact fixture event, then restore it.
  await payload.db.pool.query("UPDATE inventory_movements SET reserved_delta=reserved_delta+1 WHERE sku_id=$1 AND kind='hold' AND reservation_id=$2",[skuIds[0],held.id]);
  assert.equal((await read()).balance?.consistent,false);
  await assert.rejects(executeInventory(payload,users.owner,command('receipt',{quantity:1})),conflict,'Drift blocks new changes instead of silently correcting stock');
  await payload.db.pool.query("UPDATE inventory_movements SET reserved_delta=reserved_delta-1 WHERE sku_id=$1 AND kind='hold' AND reservation_id=$2",[skuIds[0],held.id]);
  await payload.db.pool.query("UPDATE enquiries SET verification_status='test-verified' WHERE id=$1",[enquiryId]);
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),quantity:1}),conflict);
  await payload.db.pool.query("UPDATE enquiries SET verification_status='verified' WHERE id=$1",[enquiryId]);
  // Quantities below belong solely to this explicitly synthetic isolated fixture.
  await payload.db.pool.query('UPDATE enquiries_items SET quantity=20 WHERE _parent_id=$1 AND id=$2',[enquiryId,lineId]);
  await executeInventory(payload,users.warehouse,command('receipt',{quantity:10}));
  const mixed=await executeInventory(payload,users.sales,{...hold(),quantity:6});
  await executeInventory(payload,users.warehouse,command('dispatch',{reservationId:mixed.reservationId,quantity:2}));
  const partialRelease=command('release',{reservationId:mixed.reservationId,quantity:1});
  await executeInventory(payload,users.sales,partialRelease);
  assert.equal((await executeInventory(payload,users.sales,partialRelease)).repeated,true);
  state=await read();assert.equal(state.balance?.onHand,9);assert.equal(state.balance?.reserved,3);
  const mixedRow=state.reservations.find(r=>r.id===mixed.reservationId)!;
  assert.equal(mixedRow.quantity,6);assert.equal(mixedRow.remainingQuantity,3);assert.equal(mixedRow.dispatchedQuantity,2);assert.equal(mixedRow.releasedQuantity,1);
  const block=command('block',{quantity:2});
  await executeInventory(payload,users.warehouse,block);
  assert.equal((await executeInventory(payload,users.warehouse,block)).repeated,true);
  state=await read();assert.equal(state.balance?.blocked,2);assert.equal(state.balance?.available,4);
  await assert.rejects(executeInventory(payload,users.warehouse,command('block',{quantity:5})),conflict,'Blocked stock cannot consume protected holds');
  await assert.rejects(executeInventory(payload,users.warehouse,command('adjustment',{quantity:-5})),conflict,'Adjustments protect both holds and blocked stock');
  await assert.rejects(executeInventory(payload,users.warehouse,command('unblock',{quantity:3})),conflict);
  await executeInventory(payload,users.warehouse,command('unblock',{quantity:1}));
  await payload.db.pool.query("UPDATE inventory_reservations SET expires_at=now()-interval '1 second' WHERE id=$1 AND enquiry_id=$2",[mixed.reservationId,enquiryId]);
  state=await read();assert.equal(state.balance?.available,8);assert.equal(state.balance?.expiredPending,3);
  const remaining=await executeInventory(payload,users.sales,{...hold(),quantity:8});
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),skuId:skuIds[1],quantity:7}),conflict,'Shipped units remain allocated after partially shipped hold expires');
  const remainderExpiry=await payload.db.pool.query("SELECT reserved_delta FROM inventory_movements WHERE reservation_id=$1 AND kind='expire'",[mixed.reservationId]);
  assert.equal(Number(remainderExpiry.rows[0].reserved_delta),-3,'Expiry releases only the unconsumed remainder');
  await executeInventory(payload,users.sales,command('release',{reservationId:remaining.reservationId}));
  const blockedRace=await Promise.allSettled([
    executeInventory(payload,users.sales,{...hold(),quantity:8}),
    executeInventory(payload,users.warehouse,command('block',{quantity:8})),
  ]);
  assert.equal(blockedRace.filter(result=>result.status==='fulfilled').length,1,'Allocation and blocking contend for the same available units');
  const winner=blockedRace[0];
  if(winner.status==='fulfilled')await executeInventory(payload,users.sales,command('release',{reservationId:winner.value.reservationId}));
  else await executeInventory(payload,users.warehouse,command('unblock',{quantity:8}));
  process.env.INVENTORY_FRESHNESS_HOURS='2'; // A test policy, never a production default.
  assert.equal((await read()).freshness?.status,'unconfirmed');
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),quantity:1}),conflict,'Configured freshness requires an explicit physical count');
  await assert.rejects(executeInventory(payload,users.warehouse,command('confirm',{quantity:10})),conflict,'A count mismatch cannot silently alter the ledger');
  const confirmation=await executeInventory(payload,users.warehouse,command('confirm',{quantity:9}));
  assert.equal((await read()).freshness?.status,'fresh');
  const freshHold=await executeInventory(payload,users.sales,{...hold(),quantity:1});
  await executeInventory(payload,users.sales,command('release',{reservationId:freshHold.reservationId}));
  await payload.db.pool.query("UPDATE inventory_movements SET created_at=now()-interval '3 hours' WHERE id=$1",[confirmation.movementId]);
  assert.equal((await read()).freshness?.status,'stale');
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),quantity:1}),conflict);
  process.env.INVENTORY_FRESHNESS_HOURS='invalid';
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),quantity:1}),error=>error instanceof InventoryError&&error.status===503);
  delete process.env.INVENTORY_FRESHNESS_HOURS;
  assert.equal((await read()).freshness?.status,'policy-unset');
  await payload.update({collection:'skus',id:skuIds[0],overrideAccess:true,data:{active:false}});
  await assert.rejects(executeInventory(payload,users.sales,{...hold(),quantity:1}),conflict);
  for(const role of ['sales','warehouse','catalogue-editor'] as const){
    const disallowed=role==='warehouse'?hold():command('receipt',{quantity:1});
    await assert.rejects(executeInventory(payload,users[role],disallowed),forbidden);
  }
  for(const collection of ['inventory-movements','inventory-reservations'] as const){
    await assert.rejects(payload.find({collection,overrideAccess:false}),forbidden);
    await assert.rejects(payload.find({collection,overrideAccess:false,user:users['catalogue-editor']}),forbidden);
    const rows=await payload.find({collection,overrideAccess:false,user:users.owner,depth:0,where:{sku:{equals:skuIds[0]}}});assert.ok(rows.totalDocs>0);
    for(const role of ['owner','sales','warehouse'] as const){
      await assert.rejects(payload.create({collection,overrideAccess:false,user:users[role],data:{}} as never),forbidden);
      await assert.rejects(payload.update({collection,id:rows.docs[0].id,overrideAccess:false,user:users[role],data:{reason:'tamper'}}),forbidden);
      await assert.rejects(payload.delete({collection,id:rows.docs[0].id,overrideAccess:false,user:users[role]}),forbidden);
    }
    await assert.rejects(payload.update({collection,id:rows.docs[0].id,overrideAccess:true,data:{reason:'tamper'}}),/append-only/);
  }
  console.log('Inventory regression succeeded: empty opening balance, concurrent retries and oversell prevention, full/partial dispatch and release, expired remainder accounting, shipped enquiry caps, blocked balances and allocation/block races, protected adjustments, physical count/freshness gates, audit reconciliation, inactive/test-verified rejection, staff and public permissions.');
}finally{
  if(originalFreshness===undefined)delete process.env.INVENTORY_FRESHNESS_HOURS;else process.env.INVENTORY_FRESHNESS_HOURS=originalFreshness;
  try{
    // Append-only production APIs have no deletion flow. Cleanup uses exact fixture IDs.
    if(skuIds.length){
      await payload.db.pool.query('DELETE FROM inventory_movements WHERE sku_id=ANY($1::int[])',[skuIds]);
      await payload.db.pool.query('DELETE FROM inventory_reservations WHERE sku_id=ANY($1::int[])',[skuIds]);
    }
    for(const item of created.reverse())await payload.delete({...item,overrideAccess:true});
    if(skuIds.length)assert.equal((await payload.db.pool.query('SELECT count(*) FROM inventory_movements WHERE sku_id=ANY($1::int[])',[skuIds])).rows[0].count,'0');
    assert.equal(Object.keys(payload.db.sessions??{}).length,0);
  }finally{
    await close();
  }
}
console.log('Exact inventory fixture records and isolated schema removed.');
process.exit(0);
