import {createHash} from 'node:crypto';
import type {Payload} from 'payload';
import {hasRole} from './access.ts';
import {attachmentLimit,openAttachment,sealAttachment,sanitizePhoto,validateQuotationFile} from './enquiry-attachments.ts';
import {assertQueueCapacity} from './queue-capacity.ts';
import {quotationChunkSize} from './quotation-upload-limits.ts';
export class AttachmentError extends Error{}
type Upload={reference:string;uploadId:string;filename:string;contentType:string;bytes:Buffer};
export async function saveEnquiryPhoto(payload:Payload,input:Upload,secret:string){return saveAttachment(payload,input,secret,false);}
export async function saveQuotationFile(payload:Payload,input:Upload,secret:string){return saveAttachment(payload,input,secret,true);}
async function saveAttachment(payload:Payload,input:Upload,secret:string,quotation:boolean){
  if(input.bytes.length>attachmentLimit)throw new AttachmentError('Use the segmented quotation upload for larger files');
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(input.uploadId))throw new AttachmentError('Invalid upload');
  const filename=input.filename.replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g,'').trim().slice(0,100)||'Technical photo';
  const photo=quotation?await validateQuotationFile(input.bytes,input.contentType,input.filename):await sanitizePhoto(input.bytes,input.contentType);
  const hash=createHash('sha256').update(photo.bytes).digest('hex');
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN');
    // Serialize quota/count checks and inserts across replicas, not process memory.
    await client.query('SELECT pg_advisory_xact_lock(20260929,4)');
    const enquiry=(await client.query("SELECT id,request_kind,quotation_submitted_at FROM enquiries WHERE reference=$1 AND source='cms' AND verification_status='verified' AND verified_at IS NOT NULL FOR UPDATE",[input.reference])).rows[0];
    if(!enquiry||enquiry.request_kind!==(quotation?'quotation':'products'))throw new AttachmentError('Enquiry unavailable');
    const old=(await client.query('SELECT reference,content_hash,filename,content_type FROM enquiry_attachments WHERE upload_id=$1',[input.uploadId])).rows[0];
    if(old){
      if(old.reference!==input.reference||old.content_hash!==hash||old.filename!==filename||old.content_type!==photo.contentType)throw new AttachmentError('Upload changed; choose the photo again');
      await client.query('COMMIT');return {saved:true,repeated:true};
    }
    if(quotation&&enquiry.quotation_submitted_at)throw new AttachmentError('Quotation already submitted');
    if((await client.query('SELECT 1 FROM quotation_upload_sessions WHERE upload_id=$1',[input.uploadId])).rowCount)throw new AttachmentError('Upload already in progress');
    const count=Number((await client.query('SELECT (SELECT count(*) FROM enquiry_attachments WHERE enquiry_id=$1)+(SELECT count(*) FROM quotation_upload_sessions WHERE enquiry_id=$1 AND completed_at IS NULL AND expires_at>now()) AS total',[enquiry.id])).rows[0].total);
    if(count>=3)throw new AttachmentError(quotation?'Up to three files per quotation':'Up to three photos per enquiry');
    const total=Number((await client.query('SELECT (SELECT COALESCE(sum(byte_count),0) FROM enquiry_attachments)+(SELECT COALESCE(sum(byte_count),0) FROM quotation_upload_sessions WHERE completed_at IS NULL AND expires_at>now()) AS total')).rows[0].total);
    if(total+photo.bytes.length>64*1024*1024)throw new AttachmentError('File storage is temporarily full');
    const sealed=sealAttachment(photo.bytes,secret,`${input.reference}:${input.uploadId}`);
    await client.query(`INSERT INTO enquiry_attachments(upload_id,enquiry_id,reference,filename,content_type,byte_count,content_hash,sealed_data,expires_at,created_at,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+interval '30 days',now(),now())`,[input.uploadId,enquiry.id,input.reference,filename,photo.contentType,photo.bytes.length,hash,sealed]);
    await client.query('COMMIT');return {saved:true,repeated:false};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export async function readEnquiryFile(payload:Payload,id:number,user:unknown,secret:string,allowUnscanned=false,metadataOnly=false){
  if(!user||typeof user!=='object'||!('collection' in user)||user.collection!=='staff'||!hasRole(user,['owner','sales']))return null;
  if(!Number.isSafeInteger(id)||id<1)return null;
  const columns=metadataOnly?'a.reference,a.upload_id,a.content_type,a.byte_count,a.content_hash,a.filename':'a.*';
  const row=(await payload.db.pool.query(`SELECT ${columns} FROM enquiry_attachments a JOIN enquiries e ON e.id=a.enquiry_id
    WHERE a.id=$1 AND a.expires_at>now() AND e.source='cms' AND e.verification_status='verified' AND e.verified_at IS NOT NULL`,[id])).rows[0];
  if(!row)return null;
  const unscanned=!['image/jpeg','image/png'].includes(row.content_type);
  let bytes:Buffer|null=null;
  if(!metadataOnly&&(!unscanned||allowUnscanned)){
    if(row.sealed_data==='chunks-v1'){
      const parts:Buffer[]=[];
      for(let index=0;index<Math.ceil(Number(row.byte_count)/quotationChunkSize);index++){
        const part=(await payload.db.pool.query('SELECT * FROM enquiry_attachment_parts WHERE attachment_id=$1 AND part_index=$2',[id,index])).rows[0];
        if(!part)throw new AttachmentError('File unavailable');parts.push(openAttachment(part.sealed_data,secret,`${row.reference}:${row.upload_id}:chunk:${index}`));
      }
      bytes=Buffer.concat(parts);
    }else bytes=openAttachment(row.sealed_data,secret,`${row.reference}:${row.upload_id}`);
    if(bytes.length!==Number(row.byte_count)||createHash('sha256').update(bytes).digest('hex')!==row.content_hash)throw new AttachmentError('File unavailable');
  }
  return {bytes,contentType:row.content_type as string,unscanned,byteCount:Number(row.byte_count),sha256:row.content_hash as string,filename:row.filename as string};
}
export async function readEnquiryFilePart(payload:Payload,id:number,user:unknown,secret:string,allowUnscanned:boolean,index:number){
  const file=await readEnquiryFile(payload,id,user,secret,false,true);
  if(!file||!Number.isSafeInteger(index)||index<0||index>=Math.ceil(file.byteCount/quotationChunkSize)||file.unscanned&&!allowUnscanned)return null;
  const row=(await payload.db.pool.query(`SELECT a.reference,a.upload_id,a.sealed_data='chunks-v1' AS chunked,p.sealed_data,p.byte_count FROM enquiry_attachments a LEFT JOIN enquiry_attachment_parts p ON p.attachment_id=a.id AND p.part_index=$2 WHERE a.id=$1 AND a.expires_at>now()`,[id,index])).rows[0];
  if(!row)return null;
  let bytes:Buffer;
  if(row.chunked){
    if(!row.sealed_data)return null;
    bytes=openAttachment(row.sealed_data,secret,`${row.reference}:${row.upload_id}:chunk:${index}`);
    if(bytes.length!==row.byte_count)return null;
  }else{
    const legacy=await readEnquiryFile(payload,id,user,secret,allowUnscanned);
    if(!legacy?.bytes)return null;bytes=legacy.bytes.subarray(index*quotationChunkSize,(index+1)*quotationChunkSize);
  }
  if(bytes.length!==Math.min(quotationChunkSize,file.byteCount-index*quotationChunkSize))return null;
  return {...file,bytes};
}
export async function readEnquiryPhoto(payload:Payload,id:number,user:unknown,secret:string){
  const result=await readEnquiryFile(payload,id,user,secret);
  return result?.bytes?{bytes:result.bytes,contentType:result.contentType}:null;
}

export async function quotationUploadStatus(payload:Payload,reference:string){
  const enquiry=(await payload.db.pool.query("SELECT id,quotation_submitted_at FROM enquiries WHERE reference=$1 AND request_kind='quotation' AND source='cms' AND verification_status='verified' AND verified_at IS NOT NULL",[reference])).rows[0];
  if(!enquiry)throw new AttachmentError('Quotation unavailable');
  const files=(await payload.db.pool.query('SELECT upload_id AS id,filename,content_type AS "contentType",byte_count AS bytes FROM enquiry_attachments WHERE enquiry_id=$1 AND expires_at>now() ORDER BY id',[enquiry.id])).rows;
  return {files,submitted:!!enquiry.quotation_submitted_at};
}

/** Finalization and notification creation commit together. No file contents go to email. */
export async function finalizeQuotation(payload:Payload,reference:string){
  const client=await payload.db.pool.connect();
  try{
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(20260929,4)');
    const enquiry=(await client.query("SELECT id,quotation_submitted_at FROM enquiries WHERE reference=$1 AND request_kind='quotation' AND source='cms' AND verification_status='verified' AND verified_at IS NOT NULL FOR UPDATE",[reference])).rows[0];
    if(!enquiry)throw new AttachmentError('Quotation unavailable');
    if(enquiry.quotation_submitted_at){await client.query('COMMIT');return {submitted:true,repeated:true};}
    if((await client.query('SELECT 1 FROM quotation_upload_sessions WHERE enquiry_id=$1 AND completed_at IS NULL AND expires_at>now()',[enquiry.id])).rowCount)throw new AttachmentError('Finish or discard the file currently uploading');
    const files=Number((await client.query('SELECT count(*) AS total FROM enquiry_attachments WHERE enquiry_id=$1 AND expires_at>now()',[enquiry.id])).rows[0].total);
    if(files<1||files>3)throw new AttachmentError('Upload at least one file first');
    await assertQueueCapacity(statement=>client.query(statement));
    await client.query(`INSERT INTO notifications(enquiry_id,reference,delivery_key,recipient,source,status,attempts,next_attempt_at,created_at,updated_at)
      VALUES($1,$2,$3,$4,'cms','pending',0,now(),now(),now())`,[enquiry.id,reference,`enquiry-${reference}`,process.env.ENQUIRY_NOTIFICATION_TO||'alamal4trade@hotmail.com']);
    await client.query('UPDATE enquiries SET quotation_submitted_at=now(),updated_at=now() WHERE id=$1',[enquiry.id]);
    await client.query('COMMIT');return {submitted:true,repeated:false};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
// Called only by the explicitly enabled retention worker; bounded and skips locked rows.
export async function removeExpiredPhotos(payload:Payload){
  await payload.db.pool.query('DELETE FROM quotation_upload_sessions WHERE upload_id IN (SELECT upload_id FROM quotation_upload_sessions WHERE expires_at<=now() ORDER BY expires_at LIMIT 50 FOR UPDATE SKIP LOCKED) AND expires_at<=now()');
  const result=await payload.db.pool.query("DELETE FROM enquiry_attachments WHERE id IN (SELECT id FROM enquiry_attachments WHERE expires_at<=now() ORDER BY id LIMIT 50 FOR UPDATE SKIP LOCKED) AND expires_at<=now()");
  return result.rowCount??0;
}
