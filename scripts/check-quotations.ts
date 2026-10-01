import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import sharp from 'sharp';
import {isolatedPayload} from './lib/isolated-payload.ts';
import type {Staff} from '../src/payload-types.ts';
import {saveEnquiryPhoto,removeExpiredPhotos,saveQuotationFile,readEnquiryFile,finalizeQuotation,quotationUploadStatus} from '../src/lib/attachment-service.ts';
import {submitEnquiry} from '../src/lib/submit-enquiry.ts';
import {issueVerification,confirmVerification} from '../src/lib/enquiry-verification.ts';
import {deliverNextNotification} from '../src/lib/notification-worker.ts';
import {readInventory} from '../src/lib/inventory-service.ts';
// Use the disposable CI database or the separately configured development DB.
// The helper then clones an empty schema; fixtures never enter public tables.
if(process.env.CMS_DATABASE_CHECK!=='development'||process.env.VERCEL_ENV==='production')throw new Error('Development database only');
if(process.env.CI==='true'){
  for(const key of ['DATABASE_URL','DATABASE_URL_UNPOOLED']){
    const value=process.env[key];if(!value)continue;
    const url=new URL(value);
    if(!['127.0.0.1','localhost','::1','[::1]'].includes(url.hostname)||url.pathname!=='/elamal_ci')throw new Error('Disposable local CI database required');
  }
}else{
  const development=parseEnv(await readFile(new URL('../.env.local',import.meta.url),'utf8'));
  const hosted=parseEnv(await readFile(new URL('../.env.hosted.local',import.meta.url),'utf8'));
  const host=(url:string)=>new URL(url).hostname.replace('-pooler.','.');
  if(!development.DATABASE_URL||!development.DATABASE_URL_UNPOOLED||!hosted.DATABASE_URL||
    process.env.DATABASE_URL!==development.DATABASE_URL||process.env.DATABASE_URL_UNPOOLED!==development.DATABASE_URL_UNPOOLED||
    host(development.DATABASE_URL)===host(hosted.DATABASE_URL)||host(development.DATABASE_URL)!==host(development.DATABASE_URL_UNPOOLED))throw new Error('Dedicated development connections required');
}


const {payload,close}=await isolatedPayload('quotation_test');
const cms=payload,secret=randomBytes(48).toString('hex');
const users={} as Record<'owner'|'sales'|'warehouse'|'catalogue-editor',Staff&{collection:'staff'}>;
let stage='fixtures',failed=false;
try{
  for(const role of ['owner','sales','warehouse','catalogue-editor'] as const){
    const doc=await payload.create({collection:'staff',overrideAccess:true,data:{email:`${role}-${randomUUID()}@example.invalid`,password:randomBytes(24).toString('hex'),role}});
    users[role]={...doc,collection:'staff'};
  }
  const bytes=await sharp({create:{width:4,height:3,channels:3,background:'#092340'}}).png().toBuffer();
  stage='quotation zero-item lifecycle, email-proof recovery and notification boundary';
  const raw={requestKey:randomUUID(),locale:'en',contact:{name:'Quotation tester',email:'quotation@example.invalid',company:'Disposable regression',notes:''},lines:[],quotation:true};
  const catalogue={source:'cms' as const,products:[],categories:[]};
  const draft=await submitEnquiry(cms,raw,catalogue);
  assert.equal((await submitEnquiry(cms,raw,catalogue)).reference,draft.reference);
  const quoteRecord=(await cms.find({collection:'enquiries',overrideAccess:true,where:{reference:{equals:draft.reference}}})).docs[0];
  assert.equal(quoteRecord.requestKind,'quotation');assert.equal(quoteRecord.items?.length??0,0);
  assert.equal((await cms.db.pool.query('SELECT count(*)::int AS total FROM notifications WHERE enquiry_id=$1',[quoteRecord.id])).rows[0].total,0);
  const document={reference:draft.reference,uploadId:randomUUID(),filename:'Existing quotation.pdf',contentType:'application/pdf',bytes:Buffer.from('%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n')};
  await assert.rejects(saveQuotationFile(cms,document,secret));
  await assert.rejects(finalizeQuotation(cms,draft.reference));
  const proof=await issueVerification(cms,draft.reference,'cms');assert.ok(proof);
  const confirmed=await confirmVerification(cms,proof);assert.equal(confirmed?.requestKind,'quotation');
  assert.deepEqual(await confirmVerification(cms,proof),confirmed,'Original unexpired email proof recovers a lost confirmation response');
  await assert.rejects(finalizeQuotation(cms,draft.reference),'An empty quotation cannot be submitted');
  const docRepeats=await Promise.all([saveQuotationFile(cms,document,secret),saveQuotationFile(cms,document,secret)]);
  assert.equal(docRepeats.filter(result=>result.repeated).length,1);
  await assert.rejects(saveEnquiryPhoto(cms,{...document,filename:'photo.png',contentType:'image/png',bytes},secret),'Photo endpoint cannot bypass quotation finalization');
  let notificationsSent=0;
  const fakeTransport={send:async()=>{notificationsSent++;return {id:'synthetic-quotation-receipt'};}};
  assert.equal((await deliverNextNotification(cms,fakeTransport)).outcome,'empty');assert.equal(notificationsSent,0);
  const quoteStatus=await quotationUploadStatus(cms,draft.reference);assert.equal(quoteStatus.files.length,1);assert.equal(quoteStatus.submitted,false);
  const documentRow=(await cms.db.pool.query('SELECT id,sealed_data FROM enquiry_attachments WHERE upload_id=$1',[document.uploadId])).rows[0];
  assert.equal(Buffer.from(documentRow.sealed_data,'base64').includes(document.bytes),false);
  for(const role of ['owner','sales'] as const){
    assert.equal((await readEnquiryFile(cms,documentRow.id,users[role],secret))?.bytes,null,'Unacknowledged documents expose no bytes');
    assert.deepEqual((await readEnquiryFile(cms,documentRow.id,users[role],secret,true))?.bytes,document.bytes);
  }
  for(const user of [null,users.warehouse,users['catalogue-editor']])assert.equal(await readEnquiryFile(cms,documentRow.id,user,secret,true),null);
  const finalizations=await Promise.all([finalizeQuotation(cms,draft.reference),finalizeQuotation(cms,draft.reference)]);
  assert.equal(finalizations.filter(result=>result.repeated).length,1);
  assert.equal((await cms.db.pool.query('SELECT count(*)::int AS total FROM notifications WHERE enquiry_id=$1',[quoteRecord.id])).rows[0].total,1);
  assert.equal((await quotationUploadStatus(cms,draft.reference)).submitted,true);
  await assert.rejects(saveQuotationFile(cms,{...document,uploadId:randomUUID()},secret),'Finalized quotation files are immutable');
  assert.equal((await saveQuotationFile(cms,document,secret)).repeated,true,'Completed upload retries remain idempotent');
  assert.equal((await deliverNextNotification(cms,fakeTransport)).outcome,'sent');assert.equal(notificationsSent,1);
  assert.equal((await deliverNextNotification(cms,fakeTransport)).outcome,'empty');
  const stockView=await readInventory(cms,users.owner,new URL('https://example.invalid/api/staff/inventory'));
  assert.ok(!stockView.enquiries.some(enquiry=>enquiry.id===quoteRecord.id),'File-only enquiries never appear in stock line selection');
  await cms.db.pool.query("UPDATE enquiry_verifications SET expires_at=now()-interval '1 second' WHERE enquiry_id=$1",[quoteRecord.id]);
  assert.equal(await confirmVerification(cms,proof),null,'Expired original email proof cannot mint another upload capability');
  await cms.db.pool.query("UPDATE enquiry_attachments SET expires_at=now()-interval '1 second' WHERE id=$1",[documentRow.id]);
  assert.equal(await readEnquiryFile(cms,documentRow.id,users.owner,secret,true),null);
  assert.equal(await removeExpiredPhotos(cms),1,'Document retention uses the existing bounded cleanup');
  console.log('Quotation regression succeeded: empty draft, proof recovery, private documents, finalization/retry, queue boundary, stock exclusion and retention. Fake transport only.');
}catch{failed=true;console.error('Quotation regression failed during '+stage+'; sensitive diagnostics withheld.');}
finally{try{await close();console.log('Owned quotation fixture schema removed.');}catch{failed=true;console.error('Quotation fixture cleanup failed.');}}
process.exit(failed?1:0);
