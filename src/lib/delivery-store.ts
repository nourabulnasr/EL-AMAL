import {randomUUID} from 'node:crypto';
import type {Payload} from 'payload';
import type {BatchResult} from './delivery-operations.ts';

export async function claimDeliveryLease(payload:Payload,key='delivery'){
 const lease=randomUUID();
 const result=await payload.db.pool.query(`INSERT INTO delivery_operations
  (key,lease_token,lease_expires_at,last_started_at,created_at,updated_at)
  VALUES($1,$2,now()+interval '2 minutes',now(),now(),now())
  ON CONFLICT(key) DO UPDATE SET lease_token=EXCLUDED.lease_token,
  lease_expires_at=EXCLUDED.lease_expires_at,last_started_at=now(),updated_at=now()
  WHERE delivery_operations.lease_expires_at IS NULL OR delivery_operations.lease_expires_at<=now()
  RETURNING id`,[key,lease]);
 return result.rowCount?lease:null;
}

export async function completeDeliveryLease(payload:Payload,key:string,lease:string,result:BatchResult|{outcome:'error';processed:number;failures:number}){
 const updated=await payload.db.pool.query(`UPDATE delivery_operations SET
  lease_token=NULL,lease_expires_at=NULL,last_completed_at=now(),
  last_success_at=CASE WHEN $3='complete' THEN now() ELSE last_success_at END,
  last_outcome=$3,processed=$4,failures=$5,updated_at=now(),
  verification_pending=(SELECT count(*) FROM verification_emails WHERE status IN ('pending','processing')),
  notification_pending=(SELECT count(*) FROM notifications WHERE source='cms' AND status IN ('pending','processing')),
  oldest_pending_at=(SELECT min(created_at) FROM (
   SELECT created_at FROM verification_emails WHERE status IN ('pending','processing')
   UNION ALL SELECT created_at FROM notifications WHERE source='cms' AND status IN ('pending','processing')
  ) pending)
  WHERE key=$1 AND lease_token=$2 AND lease_expires_at>now()`,[key,lease,result.outcome,result.processed,result.failures]);
 return !!updated.rowCount;
}

/** Per-table row caps; SKIP LOCKED preserves in-flight sends and concurrent renewals. */
export async function maintainVerificationEmails(payload:Payload){
 const result=await payload.db.pool.query(`WITH candidates AS (
  SELECT q.id FROM verification_emails q JOIN enquiries e ON e.id=q.enquiry_id
  WHERE (q.status='pending' OR (q.status='processing' AND q.lease_expires_at<=now()))
  AND (q.expires_at<=now() OR e.source<>'cms' OR e.verification_status<>'unverified' OR q.attempts>=5)
  ORDER BY q.expires_at,q.id LIMIT 100 FOR UPDATE OF q SKIP LOCKED
 ) UPDATE verification_emails q SET
  status=CASE WHEN q.attempts>=5 THEN 'failed'::enum_verification_emails_status ELSE 'cancelled'::enum_verification_emails_status END,
  sealed_message=NULL,lease_token=NULL,lease_expires_at=NULL,
  last_error='Confirmation completed, expired or retry limit reached',updated_at=now()
  FROM candidates c WHERE q.id=c.id
  AND (q.status='pending' OR (q.status='processing' AND q.lease_expires_at<=now()))`);
 return result.rowCount??0;
}

export async function maintainNotifications(payload:Payload){
 const result=await payload.db.pool.query(`WITH candidates AS (
  SELECT id FROM notifications WHERE source='cms'
  AND (status='pending' OR (status='processing' AND lease_expires_at<=now()))
  AND (created_at<=now()-interval '23 hours' OR attempts>=5)
  ORDER BY created_at,id LIMIT 100 FOR UPDATE SKIP LOCKED
 ) UPDATE notifications n SET status='failed',lease_token=NULL,lease_expires_at=NULL,
  last_error='Retry limit or window expired; reconcile with provider before resending',updated_at=now()
  FROM candidates c WHERE n.id=c.id
  AND (n.status='pending' OR (n.status='processing' AND n.lease_expires_at<=now()))`);
 return result.rowCount??0;
}

export async function maintainDeliveryData(payload:Payload){
 const verification=await maintainVerificationEmails(payload);
 const notification=await maintainNotifications(payload);
 const envelopes=await payload.db.pool.query(`WITH candidates AS (
  SELECT id FROM verification_emails WHERE status IN ('sent','failed','cancelled') AND sealed_message IS NOT NULL
  AND (lease_expires_at IS NULL OR lease_expires_at<=now()) ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED
 ) UPDATE verification_emails q SET sealed_message=NULL,updated_at=now() FROM candidates c
  WHERE q.id=c.id AND q.status IN ('sent','failed','cancelled')
  AND (q.lease_expires_at IS NULL OR q.lease_expires_at<=now())`);
 // Preserve the row for issuance limits and confirmation evidence. Expired hashes
 // become unique non-digests, so cleanup cannot accidentally resurrect a token.
 const hashes=await payload.db.pool.query(`WITH candidates AS (
  SELECT v.id FROM enquiry_verifications v WHERE v.expires_at<=now() AND v.token_hash NOT LIKE 'expired:%'
  AND NOT EXISTS(SELECT 1 FROM verification_emails q WHERE q.enquiry_id=v.enquiry_id AND q.status='processing' AND q.lease_expires_at>now())
  ORDER BY v.expires_at,v.id LIMIT 100 FOR UPDATE OF v SKIP LOCKED
 ) UPDATE enquiry_verifications v SET token_hash='expired:'||v.id,updated_at=now()
  FROM candidates c WHERE v.id=c.id AND v.expires_at<=now()`);
 const rates=await payload.db.pool.query(`DELETE FROM request_limits WHERE window_ends_at<now()-interval '1 day'
  AND id IN (SELECT id FROM request_limits WHERE window_ends_at<now()-interval '1 day'
  ORDER BY window_ends_at,id LIMIT 100 FOR UPDATE SKIP LOCKED)`);
 return {verification,notification,envelopes:envelopes.rowCount??0,hashes:hashes.rowCount??0,rates:rates.rowCount??0};
}
