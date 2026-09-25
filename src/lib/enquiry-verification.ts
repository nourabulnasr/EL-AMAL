import {createHash,randomBytes} from 'node:crypto';
import type {Payload} from 'payload';
export function tokenDigest(token:unknown){
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return null;
 return createHash('sha256').update(token).digest('hex');
}
// Trusted issuance only. Never return customer verification tokens to public intake.
export async function issueVerification(payload:Payload,reference:string,source:'demo'|'cms'){
 const token=randomBytes(32).toString('hex');
 const result=await payload.db.pool.query(`INSERT INTO enquiry_verifications (enquiry_id,token_hash,expires_at,created_at,updated_at)
 SELECT id,$1,now()+interval '1 hour',now(),now() FROM enquiries WHERE reference=$2 AND source=$3 AND verification_status='unverified'
 AND NOT EXISTS (SELECT 1 FROM verification_emails q WHERE q.enquiry_id=enquiries.id)
 ON CONFLICT (enquiry_id) DO UPDATE SET token_hash=EXCLUDED.token_hash,expires_at=EXCLUDED.expires_at,updated_at=now()
 WHERE enquiry_verifications.consumed_at IS NULL RETURNING id`,[tokenDigest(token),reference,source]);
 return result.rowCount?token:null;
}
export async function confirmVerification(payload:Payload,token:unknown){
 const digest=tokenDigest(token);if(!digest)return null;
 // One atomic statement consumes the token and records confirmation. GET never calls it.
 const result=await payload.db.pool.query(`WITH consumed AS (
 UPDATE enquiry_verifications SET consumed_at=now(),updated_at=now()
 WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>now() RETURNING enquiry_id
 ) UPDATE enquiries e SET verification_status=CASE WHEN e.source='demo' THEN 'test-verified'::enum_enquiries_verification_status ELSE 'verified'::enum_enquiries_verification_status END,
 verified_at=now(),updated_at=now() FROM consumed WHERE e.id=consumed.enquiry_id AND e.verification_status='unverified' RETURNING e.reference,e.source`,[digest]);
 const row=result.rows[0];return row?{reference:row.reference as string,mode:row.source==='demo'?'test' as const:'customer' as const}:null;
}
