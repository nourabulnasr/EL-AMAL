import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {createLocalReq} from 'payload';
import type {PostgresAdapter} from '@payloadcms/db-postgres';
import {isolatedPayload} from './lib/isolated-payload.ts';
import {up,down} from '../src/migrations/20261013_120000_enquiry_connection_options.ts';
import {parseCatalogueDetails} from '../src/lib/catalogue-details.ts';
import type {Catalogue} from '../src/lib/public-catalogue.ts';
import {submitEnquiry} from '../src/lib/submit-enquiry.ts';
import {EnquiryConflictError,EnquiryOptionError} from '../src/lib/enquiries.ts';
import {issueVerification,confirmVerification} from '../src/lib/enquiry-verification.ts';
import {deliverNextNotification,type NotificationTransport} from '../src/lib/notification-worker.ts';
import {readInventory} from '../src/lib/inventory-service.ts';

// Match the quotation regression's connection checks before the helper creates
// an empty owned schema. Never run against the hosted production connection.
if(process.env.CMS_DATABASE_CHECK!=='development'||process.env.VERCEL_ENV==='production')throw new Error('Development database only');
if(process.env.CI==='true'){
 for(const key of ['DATABASE_URL','DATABASE_URL_UNPOOLED']){
  const value=process.env[key];if(!value)continue;
  const url=new URL(value);
  if(!['127.0.0.1','localhost','::1','[::1]'].includes(url.hostname)||url.pathname!=='/elamal_ci')throw new Error('Disposable local CI database required');
 }
 if(!process.env.DATABASE_URL)throw new Error('Disposable local CI database required');
}else{
 const development=parseEnv(await readFile(new URL('../.env.local',import.meta.url),'utf8'));
 const hosted=parseEnv(await readFile(new URL('../.env.hosted.local',import.meta.url),'utf8'));
 const host=(value:string)=>new URL(value).hostname.replace('-pooler.','.');
 if(!development.DATABASE_URL||!development.DATABASE_URL_UNPOOLED||!hosted.DATABASE_URL||
  process.env.DATABASE_URL!==development.DATABASE_URL||process.env.DATABASE_URL_UNPOOLED!==development.DATABASE_URL_UNPOOLED||
  host(development.DATABASE_URL)===host(hosted.DATABASE_URL)||host(development.DATABASE_URL)!==host(development.DATABASE_URL_UNPOOLED))throw new Error('Dedicated development connections required');
}

const {payload,close}=await isolatedPayload('connection_option_test');
const originalRecipient=process.env.ENQUIRY_NOTIFICATION_TO;
let stage='isolated migration setup',failed=false;
try{
 // Synthetic recipient and local function transport only: no network mail sender.
 process.env.ENQUIRY_NOTIFICATION_TO='connection-regression@example.invalid';
 const pool=payload.db.pool;
 const schema=(await pool.query('SELECT current_schema() AS schema')).rows[0].schema as string;
 assert.match(schema,/^connection_option_test_[a-f0-9]{32}$/);
 const columns=async()=>pool.query("SELECT column_name,is_nullable,data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name='enquiries_items' AND column_name IN ('option_id','option_name_en','option_name_ar','option_model') ORDER BY column_name",[schema]);
 assert.equal((await columns()).rowCount,4,'Run the current migrations before this regression');
 const db=(payload.db as unknown as Pick<PostgresAdapter,'drizzle'>).drizzle;
 const migrationContext={db,payload,req:await createLocalReq({},payload)};
 const plain={id:'regression-plain',model:'LEGACY-TEST',category:'pressure',name:{en:'Legacy fixture',ar:'منتج اختبار قديم'},description:{en:'Disposable fixture',ar:'منتج اختبار مؤقت'}};
 const catalogue:Catalogue={source:'cms',categories:[],products:[plain]};
 const contact={name:'Connection regression',email:'connection@example.invalid',company:'Disposable test',notes:'PRIVATE CONTACT NOTES'};
 const legacyInput={requestKey:randomUUID(),locale:'en',contact,lines:[{productId:plain.id,quantity:3}]};
 const legacy=await submitEnquiry(payload,legacyInput,catalogue);
 const savedLegacy=(await payload.find({collection:'enquiries',overrideAccess:true,where:{reference:{equals:legacy.reference}}})).docs[0];
 const legacyRow=async()=> (await pool.query('SELECT product_id,model,quantity::int AS quantity,option_id,option_name_en,option_name_ar,option_model FROM enquiries_items WHERE _parent_id=$1',[savedLegacy.id])).rows[0];
 assert.deepEqual(await legacyRow(),{product_id:plain.id,model:'LEGACY-TEST',quantity:3,option_id:null,option_name_en:null,option_name_ar:null,option_model:null});

 stage='migration down/up preserves legacy rows';
 // The real migration executes using the isolated adapter's search path. All
 // schema changes affect the owned clone; no public table is altered.
 await down(migrationContext);
 assert.equal((await columns()).rowCount,0);
 const beforeUp=(await pool.query('SELECT product_id,model,quantity::int AS quantity FROM enquiries_items WHERE _parent_id=$1',[savedLegacy.id])).rows[0];
 assert.deepEqual(beforeUp,{product_id:plain.id,model:'LEGACY-TEST',quantity:3});
 await up(migrationContext);
 const addedColumns=await columns();assert.equal(addedColumns.rowCount,4);
 for(const column of addedColumns.rows){assert.equal(column.is_nullable,'YES');assert.equal(column.data_type,'character varying');}
 assert.deepEqual(await legacyRow(),{product_id:plain.id,model:'LEGACY-TEST',quantity:3,option_id:null,option_name_en:null,option_name_ar:null,option_model:null});
 assert.equal((await submitEnquiry(payload,legacyInput,catalogue)).reference,legacy.reference,'Legacy idempotency survives the additive migration');

 stage='trusted connection snapshots, concurrent retries and forged choices';
 const details=parseCatalogueDetails({manufacturer:'WIKA',image:{src:'/images/products/fixture.webp',width:20,height:20,alt:{en:'Disposable fixture',ar:'منتج اختبار'},sourceUrl:'https://www.wika.com/'},specifications:[],datasheets:[],availability:'check',availabilityReportedAt:'2026-01-01',options:[
  {id:'bottom-connection',name:{en:'Bottom connection',ar:'توصيل سفلي'},model:'111.10'},
  {id:'back-connection',name:{en:'Back connection',ar:'توصيل خلفي'},model:'111.12'},
 ]});assert.ok(details);
 const product={...plain,id:'regression-option',model:'111.10 / 111.12',details};
 const reviewed:Catalogue={...catalogue,products:[plain,product]};
 const optionInput={requestKey:randomUUID(),locale:'ar',contact,lines:[
  {productId:product.id,quantity:1,optionId:'bottom-connection',optionNameEn:'FORGED',optionModel:'999'},
  {productId:product.id,quantity:2,optionId:'back-connection',optionNameAr:'FORGED'},
 ]};
 const requests=await Promise.all([submitEnquiry(payload,optionInput,reviewed),submitEnquiry(payload,optionInput,reviewed)]);
 assert.equal(requests[0].reference,requests[1].reference);assert.equal(requests.filter(result=>result.repeated).length,1);
 const records=await payload.find({collection:'enquiries',overrideAccess:true,where:{requestKey:{equals:optionInput.requestKey}}});
 assert.equal(records.totalDocs,1);const record=records.docs[0];
 assert.deepEqual(record.items?.map(item=>({model:item.model,quantity:item.quantity,optionId:item.optionId,optionNameEn:item.optionNameEn,optionNameAr:item.optionNameAr,optionModel:item.optionModel,range:item.range??null})),[
  {model:'111.10 / 111.12',quantity:2,optionId:'back-connection',optionNameEn:'Back connection',optionNameAr:'توصيل خلفي',optionModel:'111.12',range:null},
  {model:'111.10 / 111.12',quantity:1,optionId:'bottom-connection',optionNameEn:'Bottom connection',optionNameAr:'توصيل سفلي',optionModel:'111.10',range:null},
 ]);
 const snapshot=structuredClone(record.items);
 assert.equal((await pool.query('SELECT count(*)::int AS total FROM notifications WHERE enquiry_id=$1',[record.id])).rows[0].total,1);
 assert.equal((await submitEnquiry(payload,optionInput,{...reviewed,products:[]})).reference,record.reference,'Stored snapshots resolve a retry after catalogue changes');
 await assert.rejects(submitEnquiry(payload,{...optionInput,lines:[{productId:product.id,quantity:3,optionId:'bottom-connection'}]},reviewed),EnquiryConflictError);
 for(const lines of [[{productId:product.id,quantity:1}],[{productId:plain.id,quantity:1},{productId:product.id,quantity:1,optionId:'forged'}]]){
  const requestKey=randomUUID();
  await assert.rejects(submitEnquiry(payload,{...optionInput,requestKey,lines},reviewed),EnquiryOptionError);
  assert.equal((await payload.find({collection:'enquiries',overrideAccess:true,where:{requestKey:{equals:requestKey}}})).totalDocs,0);
 }
 await assert.rejects(payload.update({collection:'enquiries',id:record.id,overrideAccess:true,data:{items:record.items?.map(item=>({...item,optionNameEn:'Tampered'}))}}),/immutable/);

 stage='verification, staff allocation and notification item SELECT retain both choices';
 const messages:Parameters<NotificationTransport['send']>[0][]=[];
 const capture:NotificationTransport={send:async(message)=>{messages.push(message);return{id:'synthetic-connection-receipt'};}};
 assert.equal((await deliverNextNotification(payload,capture)).outcome,'empty');assert.equal(messages.length,0);
 const proof=await issueVerification(payload,record.reference,'cms');assert.ok(proof);
 assert.equal((await confirmVerification(payload,proof))?.mode,'customer');
 const owner=await payload.create({collection:'staff',overrideAccess:true,data:{email:'connection-owner-'+randomUUID()+'@example.invalid',password:randomBytes(24).toString('hex'),role:'owner'}});
 const allocation=await readInventory(payload,{...owner,collection:'staff'},new URL('https://example.invalid/api/staff/inventory'));
 const allocationItems=allocation.enquiries.find(enquiry=>enquiry.id===record.id)?.items;
 assert.equal(allocationItems?.length,2,'Verified connections remain separately selectable in staff allocation');
 assert.equal(new Set(allocationItems?.map(item=>item.id)).size,2);
 assert.deepEqual(allocationItems?.map(item=>({optionId:item.optionId,optionNameEn:item.optionNameEn,optionNameAr:item.optionNameAr,optionModel:item.optionModel})).sort((a,b)=>a.optionId!.localeCompare(b.optionId!)),[
  {optionId:'back-connection',optionNameEn:'Back connection',optionNameAr:'توصيل خلفي',optionModel:'111.12'},
  {optionId:'bottom-connection',optionNameEn:'Bottom connection',optionNameAr:'توصيل سفلي',optionModel:'111.10'},
 ]);
 const first=await deliverNextNotification(payload,{send:async(message)=>{messages.push(message);throw new Error('Synthetic ambiguous provider failure');}});
 assert.equal(first.outcome,'retry');assert.equal(messages.length,1);
 await pool.query("UPDATE notifications SET next_attempt_at=now()-interval '1 second' WHERE enquiry_id=$1",[record.id]);
 assert.equal((await deliverNextNotification(payload,capture)).outcome,'sent');assert.equal(messages.length,2);
 assert.deepEqual(messages[0],messages[1],'Retry retains exact content, recipient and provider idempotency key');
 assert.equal(messages[1].to,'connection-regression@example.invalid');assert.equal(messages[1].idempotencyKey,'enquiry-'+record.reference);
 assert.match(messages[1].text,/111\.10/);assert.match(messages[1].text,/111\.12/);
 assert.match(messages[1].text,/Bottom connection/);assert.match(messages[1].text,/Back connection/);
 assert.match(messages[1].text,/توصيل سفلي/);assert.match(messages[1].text,/توصيل خلفي/);
 assert.match(messages[1].text,/Quantity: 1/);assert.match(messages[1].text,/Quantity: 2/);
 for(const privateValue of [contact.name,contact.email,contact.company,contact.notes,'FORGED','999 |'])assert.equal(messages[1].text.includes(privateValue),false);
 assert.deepEqual((await payload.findByID({collection:'enquiries',overrideAccess:true,id:record.id})).items,snapshot,'Confirmation and delivery preserve immutable item history');
 const legacyProof=await issueVerification(payload,legacy.reference,'cms');assert.ok(legacyProof);await confirmVerification(payload,legacyProof);
 assert.equal((await deliverNextNotification(payload,capture)).outcome,'sent');
 assert.equal(messages[2].text,`Enquiry ${legacy.reference} is available in the EL AMAL admin inbox. Sign in to review its details.`);

 stage='migration rollback refuses to destroy submitted option history';
 await assert.rejects(down(migrationContext),/Preserve connection option enquiry history/);
 assert.equal((await columns()).rowCount,4);
 assert.deepEqual((await payload.findByID({collection:'enquiries',overrideAccess:true,id:record.id})).items,snapshot);
 assert.equal(Object.keys(payload.db.sessions??{}).length,0);
 console.log('Connection PostgreSQL regression succeeded: nullable legacy rows, migration down/up, trusted bilingual snapshots, concurrent retry/conflict, forged selection rejection, immutable confirmation, notification SELECT/retry and safe rollback refusal. Local transport only; no external messages.');
}catch{failed=true;console.error('Connection PostgreSQL regression failed during '+stage+'; sensitive diagnostics withheld.');}
finally{
 if(originalRecipient===undefined)delete process.env.ENQUIRY_NOTIFICATION_TO;else process.env.ENQUIRY_NOTIFICATION_TO=originalRecipient;
 try{await close();console.log('Owned connection fixture schema removed.');}catch{failed=true;console.error('Connection fixture cleanup failed.');}
}
process.exit(failed?1:0);
