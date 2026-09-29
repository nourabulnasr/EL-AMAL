import {createHash} from 'node:crypto';
import type {Payload} from 'payload';
import {hasRole} from './access.ts';
import {openAttachment,sealAttachment,sanitizePhoto} from './enquiry-attachments.ts';
export class AttachmentError extends Error{}
export async function saveEnquiryPhoto(payload:Payload,input:{reference:string;uploadId:string;filename:string;contentType:string;bytes:Buffer},secret:string){
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(input.uploadId))throw new AttachmentError('Invalid upload');
  const filename=input.filename.replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g,'').trim().slice(0,100)||'Technical photo';
  const photo=await sanitizePhoto(input.bytes,input.contentType);
  const hash=createHash('sha256').update(photo.bytes).digest('hex');
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN');
    // Serialize quota/count checks and inserts across replicas, not process memory.
    await client.query('SELECT pg_advisory_xact_lock(20260929,4)');
    const enquiry=(await client.query("SELECT id FROM enquiries WHERE reference=$1 AND source='cms' AND verification_status='verified' AND verified_at IS NOT NULL FOR UPDATE",[input.reference])).rows[0];
    if(!enquiry)throw new AttachmentError('Enquiry unavailable');
    const old=(await client.query('SELECT reference,content_hash,filename,content_type FROM enquiry_attachments WHERE upload_id=$1',[input.uploadId])).rows[0];
    if(old){
      if(old.reference!==input.reference||old.content_hash!==hash||old.filename!==filename||old.content_type!==photo.contentType)throw new AttachmentError('Upload changed; choose the photo again');
      await client.query('COMMIT');return {saved:true,repeated:true};
    }
    const count=(await client.query('SELECT count(*)::int AS total FROM enquiry_attachments WHERE enquiry_id=$1',[enquiry.id])).rows[0].total;
    if(count>=3)throw new AttachmentError('Up to three photos per enquiry');
    const total=Number((await client.query('SELECT COALESCE(sum(byte_count),0) AS total FROM enquiry_attachments')).rows[0].total);
    if(total+photo.bytes.length>64*1024*1024)throw new AttachmentError('Photo storage is temporarily full');
    const sealed=sealAttachment(photo.bytes,secret,`${input.reference}:${input.uploadId}`);
    await client.query(`INSERT INTO enquiry_attachments(upload_id,enquiry_id,reference,filename,content_type,byte_count,content_hash,sealed_data,expires_at,created_at,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+interval '30 days',now(),now())`,[input.uploadId,enquiry.id,input.reference,filename,photo.contentType,photo.bytes.length,hash,sealed]);
    await client.query('COMMIT');return {saved:true,repeated:false};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export async function readEnquiryPhoto(payload:Payload,id:number,user:unknown,secret:string){
  if(!user||typeof user!=='object'||!('collection' in user)||user.collection!=='staff'||!hasRole(user,['owner','sales']))return null;
  if(!Number.isSafeInteger(id)||id<1)return null;
  const row=(await payload.db.pool.query(`SELECT a.* FROM enquiry_attachments a JOIN enquiries e ON e.id=a.enquiry_id
    WHERE a.id=$1 AND a.expires_at>now() AND e.source='cms' AND e.verification_status='verified' AND e.verified_at IS NOT NULL`,[id])).rows[0];
  if(!row)return null;
  return {bytes:openAttachment(row.sealed_data,secret,`${row.reference}:${row.upload_id}`),contentType:row.content_type as string};
}
// Called only by the explicitly enabled retention worker; bounded and skips locked rows.
export async function removeExpiredPhotos(payload:Payload){
  const result=await payload.db.pool.query("DELETE FROM enquiry_attachments WHERE id IN (SELECT id FROM enquiry_attachments WHERE expires_at<=now() ORDER BY id LIMIT 50 FOR UPDATE SKIP LOCKED) AND expires_at<=now()");
  return result.rowCount??0;
}
