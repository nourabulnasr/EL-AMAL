export class QueueCapacityError extends Error {}
type Query=(text:string)=>Promise<{rows:Record<string,unknown>[]}>
/** Must execute inside the SAME transaction as queue creation/rotation. */
export async function assertQueueCapacity(query:Query){
 // One global admission lock; no second pool connection is held while enqueueing.
 // READ COMMITTED sees the prior admission's commit in the following statement.
 await query('SELECT pg_advisory_xact_lock(741924,29)');
 const result=await query(`SELECT
  (SELECT count(*) FROM (SELECT 1 FROM verification_emails WHERE status IN ('pending','processing') LIMIT 100) q) AS verification,
  (SELECT count(*) FROM (SELECT 1 FROM notifications WHERE source='cms' AND status IN ('pending','processing') LIMIT 100) q) AS notification`);
 const row=result.rows[0];
 const verification=Number(row?.verification),notification=Number(row?.notification);
 if(!Number.isFinite(verification)||!Number.isFinite(notification)||verification>=100||notification>=100)throw new QueueCapacityError('Delivery capacity unavailable');
}
