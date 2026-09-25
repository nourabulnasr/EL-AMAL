import {randomBytes,randomUUID} from 'node:crypto';
import type {Payload,PayloadRequest} from 'payload';
import {tokenDigest} from './enquiry-verification.ts';
import {sealMessage,verificationMessage,validateVerificationSettings,type VerificationSettings} from './verification-message.ts';

function envelope(settings:VerificationSettings,email:string,locale:'en'|'ar'){
 const token=randomBytes(32).toString('hex'),deliveryKey=`verification-${randomUUID()}`;
 return {tokenHash:tokenDigest(token)!,deliveryKey,sealedMessage:sealMessage(verificationMessage(settings,email,locale,token),settings.secret,deliveryKey)};
}
// Must run in the enquiry's existing transaction. No customer token is returned.
export async function enqueueInitialVerification(payload:Payload,record:{id:number;reference:string;email:string;locale:'en'|'ar';source:'demo'|'cms'},settings:VerificationSettings,req:Partial<PayloadRequest>){
 if(record.source!=='cms')return;
 if(!req.transactionID)throw new Error('Verification enqueue requires a transaction');
 const data=envelope(settings,record.email,record.locale),now=Date.now(),expiresAt=new Date(now+3600000).toISOString();
 await payload.create({collection:'enquiry-verifications',overrideAccess:true,req,data:{enquiry:record.id,tokenHash:data.tokenHash,expiresAt}});
 await payload.create({collection:'verification-emails',overrideAccess:true,req,data:{
  enquiry:record.id,reference:record.reference,deliveryKey:data.deliveryKey,sealedMessage:data.sealedMessage,
  status:'pending',attempts:0,nextAttemptAt:new Date(now).toISOString(),expiresAt,
  issueCount:1,lastIssuedAt:new Date(now).toISOString(),issuanceWindowEndsAt:new Date(now+86400000).toISOString(),
 }});
}

// Trusted service only: no anonymous endpoint. Caller must authorize the enquiry.
// Resend replaces a queued generation, never edits a message being sent under a live lease.
export async function resendVerification(payload:Payload,reference:string,settings:VerificationSettings){
 validateVerificationSettings(settings);
 const client=await payload.db.pool.connect();
 try{
  await client.query('BEGIN');
  // Match confirmation's lock order: verification first, then outbox. Serializes resends.
  const found=await client.query(`SELECT v.id,v.consumed_at,e.id AS enquiry_id,e.email,e.locale,e.verification_status
   FROM enquiry_verifications v JOIN enquiries e ON e.id=v.enquiry_id
   WHERE e.reference=$1 AND e.source='cms' FOR UPDATE OF v`,[reference]);
  const record=found.rows[0];
  if(!record||record.consumed_at||record.verification_status!=='unverified'){await client.query('ROLLBACK');return {outcome:'unavailable' as const};}
  const queued=await client.query(`SELECT *,last_issued_at>now()-interval '1 minute' AS cooling,
   issuance_window_ends_at>now() AS window_active,
   status='processing' AND lease_expires_at>now() AS in_flight
   FROM verification_emails WHERE enquiry_id=$1 FOR UPDATE`,[record.enquiry_id]);
  const row=queued.rows[0];
  if(!row){await client.query('ROLLBACK');return {outcome:'unavailable' as const};}
  if(row.in_flight||row.cooling){await client.query('ROLLBACK');return {outcome:'cooldown' as const};}
  if(row.window_active&&row.issue_count>=3){await client.query('ROLLBACK');return {outcome:'limited' as const};}
  const data=envelope(settings,record.email,record.locale);
  await client.query(`UPDATE enquiry_verifications SET token_hash=$1,expires_at=now()+interval '1 hour',updated_at=now() WHERE id=$2`,[data.tokenHash,record.id]);
  await client.query(`UPDATE verification_emails SET delivery_key=$1,sealed_message=$2,status='pending',attempts=0,
   next_attempt_at=now(),expires_at=now()+interval '1 hour',lease_token=NULL,lease_expires_at=NULL,sent_at=NULL,
   provider_message_id=NULL,last_error=NULL,last_issued_at=now(),issue_count=$3,
   issuance_window_ends_at=CASE WHEN issuance_window_ends_at>now() THEN issuance_window_ends_at ELSE now()+interval '24 hours' END,
   updated_at=now() WHERE id=$4`,[data.deliveryKey,data.sealedMessage,row.window_active?Number(row.issue_count)+1:1,row.id]);
  await client.query('COMMIT');return {outcome:'queued' as const};
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
