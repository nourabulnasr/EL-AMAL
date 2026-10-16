import assert from 'node:assert/strict';
import {randomUUID,createHash,randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {isolatedPayload} from './lib/isolated-payload.ts';
import {up} from '../src/migrations/20261016_160000_quotation_upload_chunks.ts';
import {beginQuotationUpload,saveQuotationChunk,completeQuotationUpload,cancelQuotationUpload} from '../src/lib/quotation-upload-service.ts';
import {finalizeQuotation,readEnquiryFile,readEnquiryFilePart,removeExpiredPhotos,saveQuotationFile} from '../src/lib/attachment-service.ts';
import {quotationChunkSize,quotationFileLimit} from '../src/lib/quotation-upload-limits.ts';
import {submitEnquiry} from '../src/lib/submit-enquiry.ts';
import {issueVerification,confirmVerification} from '../src/lib/enquiry-verification.ts';
if(process.env.CMS_DATABASE_CHECK!=='development'||process.env.VERCEL_ENV==='production')throw new Error('Development database only');
if(process.env.CI==='true'){
 for(const key of ['DATABASE_URL','DATABASE_URL_UNPOOLED']){const value=process.env[key];if(!value)continue;const url=new URL(value);if(!['127.0.0.1','localhost','::1','[::1]'].includes(url.hostname)||url.pathname!=='/elamal_ci')throw new Error('Disposable CI database required');}
}else{
 const dev=parseEnv(await readFile(new URL('../.env.local',import.meta.url),'utf8')),hosted=parseEnv(await readFile(new URL('../.env.hosted.local',import.meta.url),'utf8'));
 const host=(value:string)=>new URL(value).hostname.replace('-pooler.','.');
 if(!dev.DATABASE_URL||!dev.DATABASE_URL_UNPOOLED||!hosted.DATABASE_URL||process.env.DATABASE_URL!==dev.DATABASE_URL||process.env.DATABASE_URL_UNPOOLED!==dev.DATABASE_URL_UNPOOLED||host(dev.DATABASE_URL)===host(hosted.DATABASE_URL)||host(dev.DATABASE_URL)!==host(dev.DATABASE_URL_UNPOOLED))throw new Error('Dedicated development connections required');
}
const {payload,close}=await isolatedPayload('quotation_chunk_test');
const secret=randomBytes(48).toString('hex'),grantHash=createHash('sha256').update('synthetic grant').digest('hex');
let stage='migration',failed=false;
try{
 // Older local dev schema: migrate only this owned disposable schema, never public.
 const present=(await payload.db.pool.query("SELECT 1 FROM information_schema.tables WHERE table_schema=current_schema() AND table_name='quotation_upload_sessions'")).rowCount;
 if(!present)await up({db:payload.db.drizzle} as Parameters<typeof up>[0]);
 const catalogue={source:'cms' as const,products:[],categories:[]};
 async function enquiry(){
  const draft=await submitEnquiry(payload,{requestKey:randomUUID(),locale:'en',contact:{name:'Chunk upload test',email:`chunk-${randomUUID()}@example.invalid`,company:'Synthetic fixture',notes:''},lines:[],quotation:true},catalogue);
  const proof=await issueVerification(payload,draft.reference,'cms');assert.ok(proof);await confirmVerification(payload,proof);return draft.reference;
 }
 const reference=await enquiry(),otherReference=await enquiry();
 const head=Buffer.from('%PDF-1.7\n'),tail=Buffer.from('\n%%EOF\n');
 const bytes=Buffer.concat([head,Buffer.alloc(quotationFileLimit-head.length-tail.length,32),tail]);
 const identity={reference,grantHash,uploadId:randomUUID()};
 const metadata={...identity,filename:'Synthetic large quote.pdf',contentType:'application/pdf',size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
 stage='same-file start retries and cross-capability boundaries';
 const starts=await Promise.all([beginQuotationUpload(payload,metadata),beginQuotationUpload(payload,metadata)]);assert.ok(starts.every(result=>result.received.length===0));
 for(const change of [{reference:otherReference},{grantHash:'a'.repeat(64)},{filename:'changed.pdf'},{sha256:'b'.repeat(64)},{size:bytes.length-1}])await assert.rejects(beginQuotationUpload(payload,{...metadata,...change}));
 await assert.rejects(completeQuotationUpload(payload,identity,secret));
 assert.equal((await payload.db.pool.query('SELECT count(*)::int AS total FROM enquiry_attachments')).rows[0].total,0);
 stage='concurrent chunk retries, exact lengths and altered retry rejection';
 const first={...identity,index:0,bytes:bytes.subarray(0,quotationChunkSize)};
 const repeats=await Promise.all([saveQuotationChunk(payload,first,secret),saveQuotationChunk(payload,first,secret)]);assert.equal(repeats.filter(result=>result.repeated).length,1);
 await assert.rejects(saveQuotationChunk(payload,{...first,reference:otherReference},secret));
 await assert.rejects(saveQuotationChunk(payload,{...first,grantHash:'a'.repeat(64)},secret));
 await assert.rejects(saveQuotationChunk(payload,{...first,bytes:Buffer.alloc(quotationChunkSize)},secret));
 await assert.rejects(saveQuotationChunk(payload,{...first,index:1,bytes:Buffer.alloc(quotationChunkSize-1)},secret));
 await assert.rejects(saveQuotationChunk(payload,{...first,index:10},secret));
 assert.deepEqual((await beginQuotationUpload(payload,metadata)).received,[0]);
 for(let index=1;index<10;index++)await saveQuotationChunk(payload,{...identity,index,bytes:bytes.subarray(index*quotationChunkSize,(index+1)*quotationChunkSize)},secret);
 const ciphertext=(await payload.db.pool.query('SELECT sealed_data FROM quotation_upload_chunks WHERE upload_id=$1 AND chunk_index=0',[identity.uploadId])).rows[0].sealed_data;
 assert.ok(!Buffer.from(ciphertext,'base64').includes(head));
 stage='atomic completion and private staff access';
 // The dedicated cloud fixture deliberately has a five-second lock timeout.
 // A simultaneous retry may time out behind the large atomic insert; once the
 // first attempt settles, the identical retry must observe its one receipt.
 const attempts=await Promise.allSettled([completeQuotationUpload(payload,identity,secret),completeQuotationUpload(payload,identity,secret)]);
 const completed=[];
 for(const attempt of attempts){
  if(attempt.status==='fulfilled')completed.push(attempt.value);
  else{assert.equal(attempt.reason?.code,'55P03');completed.push(await completeQuotationUpload(payload,identity,secret));}
 }
 assert.equal(completed.filter(result=>result.repeated).length,1);
 stage='completed attachment row and encrypted chunk cleanup';
 assert.equal((await payload.db.pool.query('SELECT count(*)::int AS total FROM quotation_upload_chunks WHERE upload_id=$1',[identity.uploadId])).rows[0].total,0);
 const row=(await payload.db.pool.query('SELECT id FROM enquiry_attachments WHERE upload_id=$1',[identity.uploadId])).rows[0];
 const owner={collection:'staff',role:'owner',id:1};
 stage='unacknowledged document bytes';
 assert.equal((await readEnquiryFile(payload,row.id,owner,secret))?.bytes,null);
 stage='acknowledged 10 MiB document read';
 assert.deepEqual((await readEnquiryFile(payload,row.id,owner,secret,true))?.bytes,bytes);
 stage='private one-part reads, acknowledgment and staff role boundaries';
 for(const index of [0,9])assert.deepEqual((await readEnquiryFilePart(payload,row.id,owner,secret,true,index))?.bytes,bytes.subarray(index*quotationChunkSize,(index+1)*quotationChunkSize));
 assert.equal(await readEnquiryFilePart(payload,row.id,owner,secret,false,0),null);
 assert.equal(await readEnquiryFilePart(payload,row.id,{collection:'staff',role:'warehouse'},secret,true,0),null);
 assert.equal((await payload.db.pool.query('SELECT count(*)::int AS total FROM enquiry_attachment_parts WHERE attachment_id=$1',[row.id])).rows[0].total,10);
 assert.equal(await readEnquiryFile(payload,row.id,{collection:'staff',role:'warehouse',id:2},secret,true),null);
 assert.equal((await beginQuotationUpload(payload,metadata)).completed,true);
 assert.deepEqual(await cancelQuotationUpload(payload,identity),{cancelled:false,completed:true},'Lost completion response must not pretend the saved attachment was discarded');
 assert.equal((await payload.db.pool.query('SELECT count(*)::int AS total FROM enquiry_attachments WHERE upload_id=$1',[identity.uploadId])).rows[0].total,1);
 stage='three-slot concurrency across new and legacy transport';
 const small=Buffer.from('%PDF-1.7\n%%EOF\n');
 const candidates=Array.from({length:4},()=>({...metadata,uploadId:randomUUID(),size:small.length,sha256:createHash('sha256').update(small).digest('hex')}));
 const reserved=await Promise.allSettled(candidates.map(input=>beginQuotationUpload(payload,input)));
 assert.equal(reserved.filter(result=>result.status==='fulfilled').length,2);
 await assert.rejects(saveQuotationFile(payload,{reference,uploadId:randomUUID(),filename:'legacy.pdf',contentType:'application/pdf',bytes:small},secret));
 await assert.rejects(finalizeQuotation(payload,reference),'Incomplete files cannot be silently omitted at finalization');
 for(let index=0;index<reserved.length;index++)if(reserved[index].status==='fulfilled')await cancelQuotationUpload(payload,candidates[index]);
 stage='whole-file hash, format and truncation rejection before promotion';
 for(const mode of ['hash','format'] as const){
  const data=mode==='hash'?small:Buffer.from('malformed document');
  const input={...metadata,uploadId:randomUUID(),size:data.length,sha256:mode==='hash'?'c'.repeat(64):createHash('sha256').update(data).digest('hex')};
  await beginQuotationUpload(payload,input);await saveQuotationChunk(payload,{...input,index:0,bytes:data},secret);await assert.rejects(completeQuotationUpload(payload,input,secret));
  assert.equal((await payload.db.pool.query('SELECT count(*)::int AS total FROM enquiry_attachments WHERE upload_id=$1',[input.uploadId])).rows[0].total,0);await cancelQuotationUpload(payload,input);
 }
 stage='global quota reservations across enquiries';
 const reservations=[];
 for(let index=0;index<4;index++){const input={...metadata,reference:await enquiry(),uploadId:randomUUID()};await beginQuotationUpload(payload,input);reservations.push(input);}
 const quotaCandidates=[{...metadata,reference:await enquiry(),uploadId:randomUUID()},{...metadata,reference:await enquiry(),uploadId:randomUUID()}];
 const quotaResults=await Promise.allSettled(quotaCandidates.map(input=>beginQuotationUpload(payload,input)));
 assert.equal(quotaResults.filter(result=>result.status==='fulfilled').length,1);
 for(let index=0;index<quotaResults.length;index++)if(quotaResults[index].status==='fulfilled')reservations.push(quotaCandidates[index]);
 for(const input of reservations)await cancelQuotationUpload(payload,input);
 stage='expiry refuses resume and releases encrypted staging';
 const expiring={...metadata,reference:otherReference,uploadId:randomUUID()};await beginQuotationUpload(payload,expiring);await saveQuotationChunk(payload,{...expiring,index:0,bytes:first.bytes},secret);
 await payload.db.pool.query("UPDATE quotation_upload_sessions SET expires_at=now()-interval '1 second' WHERE upload_id=$1",[expiring.uploadId]);
 await assert.rejects(saveQuotationChunk(payload,{...expiring,index:1,bytes:first.bytes},secret));
 await removeExpiredPhotos(payload);
 assert.equal((await payload.db.pool.query('SELECT count(*)::int AS total FROM quotation_upload_chunks WHERE upload_id=$1',[expiring.uploadId])).rows[0].total,0);
 await finalizeQuotation(payload,reference);assert.equal((await completeQuotationUpload(payload,identity,secret)).repeated,true);
 await payload.db.pool.query("UPDATE enquiry_attachments SET expires_at=now()-interval '1 second' WHERE id=$1",[row.id]);
 await removeExpiredPhotos(payload);
 assert.equal((await payload.db.pool.query('SELECT count(*)::int AS total FROM enquiry_attachment_parts WHERE attachment_id=$1',[row.id])).rows[0].total,0);
 console.log('Chunked quotation regression succeeded: 10 MiB, capability isolation, concurrent retries/count/quota, whole-file hash/format, private role controls, expiry and legacy compatibility. Synthetic files only.');
}catch(error){failed=true;console.error('Chunked quotation regression failed during '+stage+'; sensitive diagnostics withheld.');if(error instanceof assert.AssertionError)console.error(error.message);else if(error instanceof Error)console.error('Error class: '+error.name+'; code: '+String('code' in error?error.code:'none'));}
finally{try{await close();console.log('Owned chunk fixture schema removed.');}catch{failed=true;console.error('Chunk fixture cleanup failed.');}}
process.exit(failed?1:0);
