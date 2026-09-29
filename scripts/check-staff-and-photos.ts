import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {randomBytes,randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import {buildConfig,getPayload} from 'payload';
import {postgresAdapter} from '@payloadcms/db-postgres';
import sharp from 'sharp';
import config from '../src/payload.config.ts';
import {staffEmailAdapter} from '../src/lib/staff-email.ts';
import {saveEnquiryPhoto,readEnquiryPhoto,removeExpiredPhotos} from '../src/lib/attachment-service.ts';
import type {Staff} from '../src/payload-types.ts';

// Refuse a production environment and a URL different from the dedicated local
// development configuration. Never print connection strings, messages or tokens.
if(process.env.CMS_DATABASE_CHECK!=='development'||process.env.VERCEL_ENV==='production')throw new Error('Development database only');
const development=parseEnv(await readFile(new URL('../.env.local',import.meta.url),'utf8'));
const production=parseEnv(await readFile(new URL('../.env.hosted.local',import.meta.url),'utf8'));
if(!development.DATABASE_URL||development.DATABASE_URL!==process.env.DATABASE_URL||!development.DATABASE_URL_UNPOOLED||development.DATABASE_URL_UNPOOLED!==process.env.DATABASE_URL_UNPOOLED)throw new Error('Load the dedicated development environment last with its unpooled connection');
const databaseHost=(value:string)=>new URL(value).hostname.replace('-pooler.','.');
if(!production.DATABASE_URL||databaseHost(development.DATABASE_URL)===databaseHost(production.DATABASE_URL)||databaseHost(development.DATABASE_URL_UNPOOLED)!==databaseHost(development.DATABASE_URL))throw new Error('Development and production database isolation is not established');
const connectionString=process.env.DATABASE_URL_UNPOOLED;
const schema=`security_test_${randomUUID().replaceAll('-','')}`;
const quote=(value:string)=>`"${value.replaceAll('"','""')}"`;
const control=new Pool({connectionString,max:1,connectionTimeoutMillis:10000});
let created=false,payload:Awaited<ReturnType<typeof getPayload>>|undefined,stage='schema setup';
const secret=randomBytes(48).toString('hex');
const env={STAFF_RECOVERY_ENABLED:'true',MAIL_PROVIDER:'resend',MAIL_FROM:'staff@example.invalid',RESEND_API_KEY:'synthetic-no-provider-key',SITE_URL:'https://example.invalid'};
let providerFails=false;
const messages:{to:string[];html:string}[]=[];
const fakeFetch:typeof fetch=async(_url,options)=>{
  if(providerFails)return new Response('Synthetic failure',{status:503});
  messages.push(JSON.parse(String(options?.body)));
  return Response.json({id:`synthetic-receipt-${messages.length}`});
};
const forbidden=(error:unknown)=>error instanceof Error&&'status' in error&&error.status===403;
try{
  await control.query(`CREATE SCHEMA ${schema}`);created=true;
  const tables=await control.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
  for(const {table_name:table} of tables.rows){
    await control.query(`CREATE TABLE ${schema}.${quote(table)} (LIKE public.${quote(table)} INCLUDING ALL)`);
    const serials=await control.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_default LIKE 'nextval(%'",[table]);
    for(const {column_name:column} of serials.rows){
      const sequence=`test_${table}_${column}_seq`;
      await control.query(`CREATE SEQUENCE ${schema}.${quote(sequence)}`);
      await control.query(`ALTER TABLE ${schema}.${quote(table)} ALTER COLUMN ${quote(column)} SET DEFAULT nextval('${schema}.${quote(sequence)}')`);
    }
  }
  await control.query('SET search_path=pg_catalog');
  const foreignKeys=await control.query("SELECT c.conname,t.relname,pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND c.contype='f'");
  for(const row of foreignKeys.rows)await control.query(`ALTER TABLE ${schema}.${quote(row.relname)} ADD CONSTRAINT ${quote(row.conname)} ${row.definition.replaceAll('public.',`${schema}.`)}`);
  const base=await config;
  const isolated=await buildConfig({secret,serverURL:env.SITE_URL,logger:{options:{level:'silent'}},email:staffEmailAdapter(env,fakeFetch),db:postgresAdapter({schemaName:schema,pool:{connectionString,max:3,connectionTimeoutMillis:15000,options:`-c search_path=${schema} -c statement_timeout=15000 -c lock_timeout=5000`},push:false})});
  payload=await getPayload({config:{...base,secret,telemetry:false,serverURL:env.SITE_URL,logger:isolated.logger,email:isolated.email,db:isolated.db}});
  const cms=payload;
  assert.equal((await cms.db.pool.query('SELECT current_schema() AS name')).rows[0].name,schema);
  const users={} as Record<'owner'|'sales'|'warehouse'|'catalogue-editor',Staff&{collection:'staff'}>;
  const passwords={} as Record<keyof typeof users,string>;
  stage='staff fixtures and password policy';
  for(const role of ['owner','sales','warehouse','catalogue-editor'] as const){
    passwords[role]=randomBytes(24).toString('hex');
    const doc=await cms.create({collection:'staff',overrideAccess:true,data:{email:`${role}-${randomUUID()}@example.invalid`,password:passwords[role],role}});
    users[role]={...doc,collection:'staff'};
  }
  await assert.rejects(cms.create({collection:'staff',overrideAccess:true,data:{email:'weak@example.invalid',password:'short',role:'sales'}}),/15/);
  await assert.rejects(cms.update({collection:'staff',id:users.sales.id,overrideAccess:true,data:{password:'short'}}),/15/);
  stage='photo admission and retry concurrency';
  const enquiries=[] as {id:number;reference:string}[];
  for(const index of [0,1,2,3,4]){
    const doc=await cms.create({collection:'enquiries',overrideAccess:true,data:{reference:`EA-${randomUUID()}`,requestKey:randomUUID(),fingerprint:'disposable-security-fixture',locale:'en',source:index===2?'demo':'cms',name:'Synthetic security tester',email:'customer@example.invalid',company:'Disposable regression',items:[{productId:'fixture',model:'TEST',nameEn:'Fixture',nameAr:'اختبار',quantity:1}],verificationStatus:index===2?'test-verified':index===3?'unverified':'verified',verifiedAt:index===3?undefined:new Date().toISOString(),deliveryStatus:'not-configured',status:'new'}});
    enquiries.push({id:doc.id,reference:doc.reference});
  }
  const bytes=await sharp({create:{width:4,height:3,channels:3,background:'#092340'}}).png().toBuffer();
  const input=(index=0)=>({reference:enquiries[index].reference,uploadId:randomUUID(),filename:'Gauge label.png',contentType:'image/png',bytes});
  for(const index of [2,3])await assert.rejects(saveEnquiryPhoto(cms,input(index),secret));
  const upload=input();
  const repeats=await Promise.all([saveEnquiryPhoto(cms,upload,secret),saveEnquiryPhoto(cms,upload,secret)]);
  assert.equal(repeats.filter(x=>x.repeated).length,1);
  await assert.rejects(saveEnquiryPhoto(cms,{...upload,filename:'Changed.png'},secret));
  await assert.rejects(saveEnquiryPhoto(cms,{...upload,reference:enquiries[1].reference},secret));
  const limited=await Promise.allSettled([saveEnquiryPhoto(cms,input(),secret),saveEnquiryPhoto(cms,input(),secret),saveEnquiryPhoto(cms,input(),secret)]);
  assert.equal(limited.filter(x=>x.status==='fulfilled').length,2,'Only three total photos may be admitted');
  const stored=(await cms.db.pool.query('SELECT * FROM enquiry_attachments WHERE upload_id=$1',[upload.uploadId])).rows[0];
  assert.equal(Buffer.from(stored.sealed_data,'base64').includes(bytes),false);
  for(const role of ['owner','sales'] as const){
    const photo=await readEnquiryPhoto(cms,stored.id,users[role],secret);assert.ok(photo);
    assert.equal((await sharp(photo.bytes).metadata()).format,'png');
    const docs=await cms.find({collection:'enquiry-attachments',overrideAccess:false,user:users[role],depth:0});
    assert.equal(docs.totalDocs,3);
    assert.equal('sealedData' in docs.docs[0],false);assert.equal('contentHash' in docs.docs[0],false);
    await assert.rejects(cms.create({collection:'enquiry-attachments',overrideAccess:false,user:users[role],data:{}} as never),forbidden);
    await assert.rejects(cms.update({collection:'enquiry-attachments',id:stored.id,overrideAccess:false,user:users[role],data:{filename:'tamper'}}),forbidden);
    await assert.rejects(cms.delete({collection:'enquiry-attachments',id:stored.id,overrideAccess:false,user:users[role]}),forbidden);
  }
  for(const user of [null,users.warehouse,users['catalogue-editor'],{...users.owner,collection:'customers'}])assert.equal(await readEnquiryPhoto(cms,stored.id,user,secret),null);
  for(const user of [undefined,users.warehouse,users['catalogue-editor']])await assert.rejects(cms.find({collection:'enquiry-attachments',overrideAccess:false,user}),forbidden);
  await assert.rejects(readEnquiryPhoto(cms,stored.id,users.owner,randomBytes(48).toString('hex')));
  const tampered=Buffer.from(stored.sealed_data,'base64');tampered[tampered.length-1]^=1;
  await cms.db.pool.query('UPDATE enquiry_attachments SET sealed_data=$1 WHERE id=$2',[tampered.toString('base64'),stored.id]);
  await assert.rejects(readEnquiryPhoto(cms,stored.id,users.owner,secret));
  await cms.db.pool.query('UPDATE enquiry_attachments SET sealed_data=$1 WHERE id=$2',[stored.sealed_data,stored.id]);
  stage='photo quota and bounded retention';
  // Only disposable clone rows are used to model a nearly-full shared quota.
  await cms.db.pool.query(`INSERT INTO enquiry_attachments(upload_id,enquiry_id,reference,filename,content_type,byte_count,content_hash,sealed_data,expires_at,created_at,updated_at)
    SELECT gen_random_uuid()::text,$1,$2,'Synthetic quota row','image/png',2097152,$3,$4,now()-interval '1 day',now(),now() FROM generate_series(1,32)`,[enquiries[1].id,enquiries[1].reference,stored.content_hash,stored.sealed_data]);
  await assert.rejects(saveEnquiryPhoto(cms,input(4),secret),/full/);
  assert.equal(await removeExpiredPhotos(cms),32);
  await cms.db.pool.query("UPDATE enquiry_attachments SET expires_at=now()-interval '1 second' WHERE id=$1",[stored.id]);
  assert.equal(await readEnquiryPhoto(cms,stored.id,users.owner,secret),null,'Expired content cannot be downloaded before cleanup');
  await cms.db.pool.query(`INSERT INTO enquiry_attachments(upload_id,enquiry_id,reference,filename,content_type,byte_count,content_hash,sealed_data,expires_at,created_at,updated_at)
    SELECT gen_random_uuid()::text,$1,$2,'Synthetic retention row','image/png',1,$3,$4,now()-interval '1 day',now(),now() FROM generate_series(1,54)`,[enquiries[1].id,enquiries[1].reference,stored.content_hash,stored.sealed_data]);
  assert.equal(await removeExpiredPhotos(cms),50);assert.equal(await removeExpiredPhotos(cms),5);assert.equal(await removeExpiredPhotos(cms),0);
  assert.equal(Number((await cms.db.pool.query('SELECT count(*) AS total FROM enquiry_attachments')).rows[0].total),2,'Active photos survive cleanup');
  stage='real Payload recovery, expiry and session invalidation';
  const previous=await cms.login({collection:'staff',data:{email:users.owner.email,password:passwords.owner}});assert.ok(previous.token);
  const auth=(token:string)=>cms.auth({headers:new Headers({authorization:`JWT ${token}`})});
  assert.equal((await auth(previous.token)).user?.id,users.owner.id);
  assert.equal(await cms.forgotPassword({collection:'staff',overrideAccess:true,data:{email:'unknown@example.invalid'}}),null);
  const token=await cms.forgotPassword({collection:'staff',overrideAccess:true,data:{email:users.owner.email}});assert.ok(token);
  assert.equal(messages.length,1);assert.deepEqual(messages[0].to,[users.owner.email]);
  assert.ok(messages[0].html.includes(`${env.SITE_URL}/admin/reset/${token}`));
  assert.equal(await cms.forgotPassword({collection:'staff',overrideAccess:true,data:{email:users.owner.email}}),null);assert.equal(messages.length,1,'Cooldown does not resend');
  await assert.rejects(cms.resetPassword({collection:'staff',overrideAccess:false,data:{token,password:'short'}}),/15/);
  const newPassword=randomBytes(24).toString('hex');
  const reset=await cms.resetPassword({collection:'staff',overrideAccess:false,data:{token,password:newPassword}});assert.ok(reset.token);
  assert.equal((await auth(previous.token)).user,null,'Recovery revokes the old session');
  assert.equal((await auth(reset.token)).user?.id,users.owner.id);
  await assert.rejects(cms.resetPassword({collection:'staff',overrideAccess:false,data:{token,password:randomBytes(24).toString('hex')}}));
  await assert.rejects(cms.login({collection:'staff',data:{email:users.owner.email,password:passwords.owner}}));
  assert.ok((await cms.login({collection:'staff',data:{email:users.owner.email,password:newPassword}})).token);
  providerFails=true;
  await assert.rejects(cms.forgotPassword({collection:'staff',overrideAccess:true,data:{email:users.sales.email}}),/not confirmed/);
  providerFails=false;
  const expiryToken=await cms.forgotPassword({collection:'staff',overrideAccess:true,data:{email:users.sales.email}});assert.ok(expiryToken,'Provider failure releases cooldown');
  await cms.db.pool.query("UPDATE staff SET reset_password_expiration=now()-interval '1 second' WHERE id=$1",[users.sales.id]);
  await assert.rejects(cms.resetPassword({collection:'staff',overrideAccess:false,data:{token:expiryToken,password:randomBytes(24).toString('hex')}}));
  stage='concurrent one-time staff reset';
  const raceToken=await cms.forgotPassword({collection:'staff',overrideAccess:true,data:{email:users.warehouse.email}});assert.ok(raceToken);
  const resetRace=await Promise.allSettled([0,1].map(()=>cms.resetPassword({collection:'staff',overrideAccess:false,data:{token:raceToken,password:randomBytes(24).toString('hex')}})));
  const successfulResets=resetRace.filter(result=>result.status==='fulfilled').length;
  console.log(`Concurrent single-token reset outcomes: ${successfulResets} successes, ${2-successfulResets} rejections.`);
  assert.equal(successfulResets,1,'A reset token must succeed exactly once even under concurrent requests');
  assert.equal(Object.keys(cms.db.sessions??{}).length,0);
  console.log('Security regression succeeded: isolated photo admission/retry/quota/retention, private access, tamper rejection, real Payload password policy/recovery/cooldown/expiry/session revocation and concurrent one-time reset. Fake transport only.');
}catch{
  // Suppress database diagnostics, assertion operands, tokens and synthetic mail bodies.
  console.error(`Security regression failed during ${stage}; sensitive diagnostic values withheld.`);process.exitCode=1;
}finally{
  try{if(payload)await payload.destroy();}
  catch{console.error('Security regression connection shutdown failed; inspect locally.');process.exitCode=1;}
  try{if(created){await control.query(`DROP SCHEMA ${schema} CASCADE`);console.log('Owned isolated security-test schema removed.');}}
  catch{console.error(`Cleanup failed for owned schema ${schema}; remove only this exact test schema after inspection.`);process.exitCode=1;}
  finally{await control.end();}
}
process.exit(process.exitCode?1:0);
