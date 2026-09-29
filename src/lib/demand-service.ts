import type {Payload} from 'payload';
import {canReadDemand,aggregateDemand,DemandError,DEMAND_SOURCE_LIMIT,type DemandLine,type DemandQuery} from './demand-report.ts';

/** Reads immutable submission snapshots only; no current product join or contact fields. */
export async function readDemandReport(payload:Payload,actor:unknown,filters:DemandQuery){
  if(!canReadDemand(actor))throw new DemandError('Owner or sales access is required.',403);
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await client.query("SET LOCAL statement_timeout='8s'; SET LOCAL lock_timeout='2s'; SET LOCAL idle_in_transaction_session_timeout='15s'");
    const stored=await client.query('SELECT id,role FROM staff WHERE id=$1',[actor.id]);
    if(!canReadDemand({...stored.rows[0],collection:'staff'}))throw new DemandError('Owner or sales access is required.',403);
    // Bounds are Cairo calendar days, not fixed 24-hour UTC intervals. The source
    // cap is checked before aggregation so no truncated result appears complete.
    const result=await client.query<DemandLine>(`SELECT e.id AS "enquiryId",i.product_id AS "productId",i.model,i.range,i.quantity::double precision AS quantity,
      CASE WHEN e.source='demo' THEN 'demo'
        WHEN e.verification_status='test-verified' THEN 'test'
        WHEN e.verification_status='verified' AND e.verified_at IS NOT NULL THEN 'verified'
        ELSE 'unverified' END AS cohort
      FROM enquiries e JOIN enquiries_items i ON i._parent_id=e.id
      WHERE e.created_at >= ($1::date::timestamp AT TIME ZONE 'Africa/Cairo')
        AND e.created_at < (($2::date + 1)::timestamp AT TIME ZONE 'Africa/Cairo')
      ORDER BY e.id,i._order LIMIT $3`,[filters.start,filters.end,DEMAND_SOURCE_LIMIT+1]);
    const report=aggregateDemand(result.rows,filters);
    await client.query('COMMIT');return report;
  }catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
