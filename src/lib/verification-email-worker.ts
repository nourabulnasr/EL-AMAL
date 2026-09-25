import {randomUUID} from 'node:crypto';
import type {Payload} from 'payload';
import {openMessage} from './verification-message.ts';
import {retryDelay,type NotificationTransport} from './notification-worker.ts';

export async function deliverNextVerification(payload:Payload,secret:string,transport?:NotificationTransport){
 if(!transport||secret.length<32)return {outcome:'disabled' as const};
 const pool=payload.db.pool;
 // Never disturb an active lease. Terminal envelopes are erased; receipts/status remain.
 await pool.query(`UPDATE verification_emails q SET status='cancelled',sealed_message=NULL,lease_token=NULL,
  lease_expires_at=NULL,last_error='Confirmation completed or link expired',updated_at=now()
  FROM enquiries e WHERE e.id=q.enquiry_id AND
  (q.status='pending' OR (q.status='processing' AND q.lease_expires_at<=now())) AND
  (q.expires_at<=now() OR e.source<>'cms' OR e.verification_status<>'unverified')`);
 await pool.query(`UPDATE verification_emails SET status='failed',sealed_message=NULL,lease_token=NULL,
  lease_expires_at=NULL,last_error='Retry limit reached',updated_at=now()
  WHERE status='processing' AND lease_expires_at<=now() AND attempts>=5`);
 const lease=randomUUID();
 const claimed=await pool.query(`UPDATE verification_emails SET status='processing',attempts=attempts+1,
  lease_token=$1,lease_expires_at=now()+interval '5 minutes',updated_at=now() WHERE id=(
  SELECT q.id FROM verification_emails q JOIN enquiries e ON e.id=q.enquiry_id
  WHERE e.source='cms' AND e.verification_status='unverified' AND q.expires_at>now()+interval '30 seconds' AND q.attempts<5 AND
  ((q.status='pending' AND q.next_attempt_at<=now()) OR (q.status='processing' AND q.lease_expires_at<=now()))
  ORDER BY q.created_at,q.id FOR UPDATE OF q SKIP LOCKED LIMIT 1)
  RETURNING id,delivery_key,sealed_message,attempts`,[lease]);
 const row=claimed.rows[0];if(!row)return {outcome:'empty' as const};
 try{
  const message=openMessage(row.sealed_message,secret,row.delivery_key);
  const sent=await transport.send({...message,idempotencyKey:row.delivery_key});
  if(typeof sent.id!=='string'||!sent.id||sent.id.length>200)throw new Error('Invalid receipt');
  const result=await pool.query(`UPDATE verification_emails SET status='sent',sealed_message=NULL,sent_at=now(),
   provider_message_id=$1,last_error=NULL,lease_token=NULL,lease_expires_at=NULL,updated_at=now()
   WHERE id=$2 AND status='processing' AND lease_token=$3`,[sent.id,row.id,lease]);
  return {outcome:result.rowCount?'sent' as const:'stale' as const};
 }catch{
  const failed=row.attempts>=5;
  const result=await pool.query(`UPDATE verification_emails SET status=$1,next_attempt_at=now()+($2*interval '1 second'),
   sealed_message=CASE WHEN $3 THEN NULL ELSE sealed_message END,last_error='Delivery failed; details withheld',
   lease_token=NULL,lease_expires_at=NULL,updated_at=now() WHERE id=$4 AND status='processing' AND lease_token=$5`,
   [failed?'failed':'pending',retryDelay(row.attempts),failed,row.id,lease]);
  return {outcome:result.rowCount?(failed?'failed' as const:'retry' as const):'stale' as const};
 }
}
