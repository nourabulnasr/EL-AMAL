import {randomUUID} from 'node:crypto';
import type {Payload} from 'payload';
export type NotificationTransport={send:(message:{to:string;subject:string;text:string;idempotencyKey:string})=>Promise<{id:string}>};
export function retryDelay(attempt:number){return Math.min(3600,60*2**Math.max(0,attempt-1));}
// No transport is configured by default. A protected caller supplies the transport.
// Transport implementations must deduplicate on idempotencyKey, including after an ambiguous timeout.
export async function deliverNextNotification(payload:Payload,transport?:NotificationTransport){
 if(!transport)return {outcome:'disabled' as const};
 const pool=payload.db.pool;
 await pool.query("UPDATE notifications SET status='failed', lease_token=NULL, lease_expires_at=NULL, last_error='Retry limit reached', updated_at=now() WHERE source='cms' AND status='processing' AND lease_expires_at<=now() AND attempts>=5");
 // Provider deduplication expires after 24 hours. Never retry across that boundary.
 // Use queue creation as a conservative lower bound on the first possible send.
 await pool.query("UPDATE notifications SET status='failed', lease_token=NULL, lease_expires_at=NULL, last_error='Retry window expired; reconcile with provider before resending', updated_at=now() WHERE source='cms' AND created_at<=now()-interval '23 hours' AND (status='pending' OR (status='processing' AND lease_expires_at<=now()))");
 const lease=randomUUID();
 const claimed=await pool.query(`UPDATE notifications SET status='processing', attempts=attempts+1, lease_token=$1,
 lease_expires_at=now()+interval '5 minutes', updated_at=now() WHERE id=(
 SELECT id FROM notifications WHERE source='cms' AND attempts<5 AND created_at>now()-interval '23 hours' AND
 ((status='pending' AND next_attempt_at<=now()) OR (status='processing' AND lease_expires_at<=now()))
 ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING id,reference,recipient,delivery_key,attempts`,[lease]);
 const row=claimed.rows[0];if(!row)return {outcome:'empty' as const};
 try{
   // No customer contact details, notes or attachments are copied into notification content.
   const sent=await transport.send({to:row.recipient,subject:`EL AMAL enquiry ${row.reference}`,text:`Enquiry ${row.reference} is available in the EL AMAL admin inbox. Sign in to review its details.`,idempotencyKey:row.delivery_key});
   if(typeof sent.id!=='string'||!sent.id||sent.id.length>200)throw new Error('Invalid delivery receipt');
   const result=await pool.query("UPDATE notifications SET status='sent',sent_at=now(),provider_message_id=$1,last_error=NULL,lease_token=NULL,lease_expires_at=NULL,updated_at=now() WHERE id=$2 AND lease_token=$3 AND status='processing'",[sent.id,row.id,lease]);
   return {outcome:result.rowCount?'sent' as const:'stale' as const};
 }catch{
   const result=await pool.query(`UPDATE notifications SET status=$1,next_attempt_at=now()+($2*interval '1 second'),last_error='Delivery failed; details withheld',lease_token=NULL,lease_expires_at=NULL,updated_at=now() WHERE id=$3 AND lease_token=$4 AND status='processing'`,[row.attempts>=5?'failed':'pending',retryDelay(row.attempts),row.id,lease]);
   return {outcome:result.rowCount?(row.attempts>=5?'failed' as const:'retry' as const):'stale' as const};
 }
}
