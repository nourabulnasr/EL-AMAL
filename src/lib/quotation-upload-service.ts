import {createHash} from 'node:crypto';
import type {Payload} from 'payload';
import type {PoolClient} from 'pg';
import {AttachmentError} from './attachment-service.ts';
import {openAttachment,sealAttachment,spreadsheetType,validateQuotationFile} from './enquiry-attachments.ts';
import {quotationChunkSize,quotationFileCount,quotationFileLimit,quotationStorageLimit} from './quotation-upload-limits.ts';

const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const digest=/^[a-f0-9]{64}$/;
export type UploadIdentity={reference:string;grantHash:string;uploadId:string};
export type UploadMetadata={uploadId:string;filename:string;contentType:string;size:number;sha256:string};
const reject=():never=>{throw new AttachmentError('Upload unavailable; retry the same file or choose another file');};
export function validateUploadMetadata(input:unknown):UploadMetadata{
 if(!input||typeof input!=='object')return reject();
 const value=input as UploadMetadata;
 if(typeof value.uploadId!=='string'||!uuid.test(value.uploadId)||typeof value.filename!=='string'||!value.filename.trim()||value.filename.length>100||/[\u0000-\u001f\u007f<>:"/\\|?*]/.test(value.filename)||!Number.isSafeInteger(value.size)||value.size<1||value.size>quotationFileLimit||typeof value.sha256!=='string'||!digest.test(value.sha256))return reject();
 const extension=value.filename.toLowerCase().split('.').pop();
 const valid=({'application/pdf':['pdf'],[spreadsheetType]:['xlsx'],'image/jpeg':['jpg','jpeg'],'image/png':['png']} as Record<string,string[]>)[value.contentType];
 if(!valid?.includes(extension??''))return reject();
 return {uploadId:value.uploadId,filename:value.filename,contentType:value.contentType,size:value.size,sha256:value.sha256};
}
function checkIdentity(value:UploadIdentity){if(!uuid.test(value.uploadId)||!digest.test(value.grantHash))reject();}
async function transaction<T>(payload:Payload,run:(client:PoolClient)=>Promise<T>){
 const client=await payload.db.pool.connect();
 try{
  await client.query('BEGIN');
  // Shared with legacy uploads: reservations and finished files have one global quota.
  await client.query('SELECT pg_advisory_xact_lock(20260929,4)');
  const result=await run(client);await client.query('COMMIT');return result;
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
async function session(client:Pick<PoolClient,'query'>,input:UploadIdentity,lock=true){
 checkIdentity(input);
 const row=(await client.query(`SELECT s.*,e.quotation_submitted_at FROM quotation_upload_sessions s JOIN enquiries e ON e.id=s.enquiry_id
  WHERE s.upload_id=$1 AND s.reference=$2 AND s.grant_hash=$3 AND s.expires_at>now()
  AND e.source='cms' AND e.request_kind='quotation' AND e.verification_status='verified' AND e.verified_at IS NOT NULL ${lock?'FOR UPDATE OF s,e':''}`,[input.uploadId,input.reference,input.grantHash])).rows[0];
 if(!row||(!row.completed_at&&row.quotation_submitted_at))return reject();return row;
}
export async function beginQuotationUpload(payload:Payload,input:UploadIdentity&UploadMetadata){
 const meta=validateUploadMetadata(input);checkIdentity(input);
 return transaction(payload,async client=>{
  await client.query('DELETE FROM quotation_upload_sessions WHERE upload_id IN (SELECT upload_id FROM quotation_upload_sessions WHERE expires_at<=now() LIMIT 50 FOR UPDATE SKIP LOCKED)');
  const existing=(await client.query('SELECT * FROM quotation_upload_sessions WHERE upload_id=$1',[input.uploadId])).rows[0];
  if(existing){
   const row=await session(client,input);
   if(row.filename!==meta.filename||row.content_type!==meta.contentType||row.byte_count!==meta.size||row.content_hash!==meta.sha256)return reject();
   const received=(await client.query('SELECT chunk_index FROM quotation_upload_chunks WHERE upload_id=$1 ORDER BY chunk_index',[input.uploadId])).rows.map(r=>r.chunk_index as number);
   return {received,completed:!!row.completed_at};
  }
  if((await client.query('SELECT 1 FROM enquiry_attachments WHERE upload_id=$1',[input.uploadId])).rowCount)return reject();
  const enquiry=(await client.query("SELECT id FROM enquiries WHERE reference=$1 AND source='cms' AND request_kind='quotation' AND verification_status='verified' AND verified_at IS NOT NULL AND quotation_submitted_at IS NULL FOR UPDATE",[input.reference])).rows[0];
  if(!enquiry)return reject();
  const count=Number((await client.query(`SELECT (SELECT count(*) FROM enquiry_attachments WHERE enquiry_id=$1)+(SELECT count(*) FROM quotation_upload_sessions WHERE enquiry_id=$1 AND completed_at IS NULL AND expires_at>now()) AS total`,[enquiry.id])).rows[0].total);
  const total=Number((await client.query(`SELECT (SELECT COALESCE(sum(byte_count),0) FROM enquiry_attachments)+(SELECT COALESCE(sum(byte_count),0) FROM quotation_upload_sessions WHERE completed_at IS NULL AND expires_at>now()) AS total`)).rows[0].total);
  if(count>=quotationFileCount||total+meta.size>quotationStorageLimit)return reject();
  await client.query(`INSERT INTO quotation_upload_sessions(upload_id,enquiry_id,reference,grant_hash,filename,content_type,byte_count,content_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[input.uploadId,enquiry.id,input.reference,input.grantHash,meta.filename,meta.contentType,meta.size,meta.sha256]);
  return {received:[] as number[],completed:false};
 });
}
export async function saveQuotationChunk(payload:Payload,input:UploadIdentity&{index:number;bytes:Buffer},secret:string){
 if(!Number.isSafeInteger(input.index)||input.index<0||input.index>=quotationFileLimit/quotationChunkSize||!input.bytes.length||input.bytes.length>quotationChunkSize)return reject();
 return transaction(payload,async client=>{
  const row=await session(client,input);if(row.completed_at)return reject();
  const expected=Math.min(quotationChunkSize,row.byte_count-input.index*quotationChunkSize);
  if(input.bytes.length!==expected)return reject();
  const hash=createHash('sha256').update(input.bytes).digest('hex');
  const old=(await client.query('SELECT content_hash FROM quotation_upload_chunks WHERE upload_id=$1 AND chunk_index=$2',[input.uploadId,input.index])).rows[0];
  if(old){if(old.content_hash!==hash)return reject();return {saved:true,repeated:true};}
  const sealed=sealAttachment(input.bytes,secret,`${input.reference}:${input.uploadId}:chunk:${input.index}`);
  await client.query('INSERT INTO quotation_upload_chunks(upload_id,chunk_index,byte_count,content_hash,sealed_data) VALUES($1,$2,$3,$4,$5)',[input.uploadId,input.index,input.bytes.length,hash,sealed]);
  return {saved:true,repeated:false};
 });
}
export async function completeQuotationUpload(payload:Payload,input:UploadIdentity,secret:string){
 // Read and validate immutable encrypted chunks without holding the global quota
 // lock during cloud transfer or image reconstruction. Recheck the session under
 // lock before the single promotion commit; cancellation/expiry wins that race.
 const initial=await session(payload.db.pool,input,false);
 if(initial.completed_at)return {saved:true,repeated:true};
 const chunkIndexes=(await payload.db.pool.query('SELECT chunk_index FROM quotation_upload_chunks WHERE upload_id=$1 ORDER BY chunk_index',[input.uploadId])).rows;
 if(chunkIndexes.length!==Math.ceil(initial.byte_count/quotationChunkSize)){
  if((await session(payload.db.pool,input,false)).completed_at)return {saved:true,repeated:true};
  return reject();
 }
 const parts:Buffer[]=[];
 for(let index=0;index<chunkIndexes.length;index++){
  const chunk=(await payload.db.pool.query('SELECT * FROM quotation_upload_chunks WHERE upload_id=$1 AND chunk_index=$2',[input.uploadId,index])).rows[0];
  if(!chunk){if((await session(payload.db.pool,input,false)).completed_at)return {saved:true,repeated:true};return reject();}
  if(chunk.chunk_index!==index)return reject();
  const bytes=openAttachment(chunk.sealed_data,secret,`${input.reference}:${input.uploadId}:chunk:${index}`);
  if(bytes.length!==chunk.byte_count||createHash('sha256').update(bytes).digest('hex')!==chunk.content_hash)return reject();parts.push(bytes);
 }
 const bytes=Buffer.concat(parts);
 if(bytes.length!==initial.byte_count||createHash('sha256').update(bytes).digest('hex')!==initial.content_hash)return reject();
 const file=await validateQuotationFile(bytes,initial.content_type,initial.filename);
 const hash=createHash('sha256').update(file.bytes).digest('hex');
 const unchanged=hash===initial.content_hash&&file.bytes.length===initial.byte_count;
 const storedParts:{index:number;bytes:number;sealed:string}[]=[];
 for(let index=0;!unchanged&&index<Math.ceil(file.bytes.length/quotationChunkSize);index++){
  const bytes=file.bytes.subarray(index*quotationChunkSize,(index+1)*quotationChunkSize);
  storedParts.push({index,bytes:bytes.length,sealed:sealAttachment(bytes,secret,`${input.reference}:${input.uploadId}:chunk:${index}`)});
 }
 return transaction(payload,async client=>{
  const row=await session(client,input);if(row.completed_at)return {saved:true,repeated:true};
  if(row.content_hash!==initial.content_hash||row.byte_count!==initial.byte_count||row.filename!==initial.filename||row.content_type!==initial.content_type||row.created_at.getTime()!==initial.created_at.getTime())return reject();
  const total=Number((await client.query(`SELECT (SELECT COALESCE(sum(byte_count),0) FROM enquiry_attachments)+(SELECT COALESCE(sum(byte_count),0) FROM quotation_upload_sessions WHERE completed_at IS NULL AND expires_at>now() AND upload_id<>$1) AS total`,[input.uploadId])).rows[0].total);
  if(total+file.bytes.length>quotationStorageLimit)return reject();
  const attachment=(await client.query(`INSERT INTO enquiry_attachments(upload_id,enquiry_id,reference,filename,content_type,byte_count,content_hash,sealed_data,expires_at,created_at,updated_at)
   VALUES($1,$2,$3,$4,$5,$6,$7,'chunks-v1',now()+interval '30 days',now(),now()) RETURNING id`,[input.uploadId,row.enquiry_id,input.reference,row.filename,file.contentType,file.bytes.length,hash])).rows[0];
  // Final parts remain encrypted independently, so a staff download never reloads
  // the entire file for each one-mebibyte response. Legacy blobs remain readable.
  if(unchanged){
   // Plain PDF/XLSX bytes do not change during format validation. Reuse the
   // authenticated ciphertext in PostgreSQL without sending ten MiB back again.
   await client.query('INSERT INTO enquiry_attachment_parts(attachment_id,part_index,byte_count,sealed_data) SELECT $1,chunk_index,byte_count,sealed_data FROM quotation_upload_chunks WHERE upload_id=$2',[attachment.id,input.uploadId]);
  }else{
   for(const part of storedParts)await client.query('INSERT INTO enquiry_attachment_parts(attachment_id,part_index,byte_count,sealed_data) VALUES($1,$2,$3,$4)',[attachment.id,part.index,part.bytes,part.sealed]);
  }
  await client.query("UPDATE quotation_upload_sessions SET completed_at=now(),expires_at=now()+interval '24 hours' WHERE upload_id=$1",[input.uploadId]);
  await client.query('DELETE FROM quotation_upload_chunks WHERE upload_id=$1',[input.uploadId]);
  return {saved:true,repeated:false};
 });
}
export async function cancelQuotationUpload(payload:Payload,input:UploadIdentity){
 checkIdentity(input);
 return transaction(payload,async client=>{
  const row=(await client.query('SELECT reference,grant_hash,completed_at FROM quotation_upload_sessions WHERE upload_id=$1 FOR UPDATE',[input.uploadId])).rows[0];
  if(!row)return {cancelled:true};
  if(row.reference!==input.reference||row.grant_hash!==input.grantHash)return reject();
  if(row.completed_at)return {cancelled:false,completed:true};
  await client.query('DELETE FROM quotation_upload_sessions WHERE upload_id=$1',[input.uploadId]);return {cancelled:true};
 });
}
