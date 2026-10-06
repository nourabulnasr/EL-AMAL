import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {isolatedPayload} from './lib/isolated-payload.ts';
import {deliverNextNotification} from '../src/lib/notification-worker.ts';
import type {Staff} from '../src/payload-types.ts';

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

const {payload,close}=await isolatedPayload('admin_boundary_test');
const forbidden=(error:unknown)=>error instanceof Error&&'status' in error&&error.status===403;
const users={} as Record<'owner'|'sales'|'warehouse'|'catalogue-editor',Staff&{collection:'staff'}>;
let stage='fixtures',failures=0,checks=0;
async function check(label:string,run:()=>Promise<void>){
  checks++;
  try{await run();console.log(`OK: ${label}`);}
  catch{failures++;console.error(`FAILED: ${label}; diagnostic values withheld.`);}
}
try{
  for(const role of ['owner','sales','warehouse','catalogue-editor'] as const){
    const doc=await payload.create({collection:'staff',overrideAccess:true,data:{email:`${role}-${randomUUID()}@example.invalid`,password:randomBytes(24).toString('hex'),role}});
    users[role]={...doc,collection:'staff'};
  }
  stage='staff unlock authorization';
  // Payload 3.90's generated unlock input requires password although the operation
  // uses only email and the authenticated request's access rule. This is synthetic.
  const unlockData={email:users.owner.email,password:'unused-unlock-fixture'};
  const lock=()=>payload.db.pool.query("UPDATE staff SET login_attempts=5,lock_until=now()+interval '10 minutes' WHERE id=$1",[users.owner.id]);
  const lockState=async()=> (await payload.db.pool.query('SELECT login_attempts,lock_until FROM staff WHERE id=$1',[users.owner.id])).rows[0];
  for(const [label,user] of [['anonymous',undefined],['sales',users.sales],['warehouse',users.warehouse],['catalogue editor',users['catalogue-editor']]] as const){
    await check(`${label} cannot unlock another staff account`,async()=>{
      await lock();
      await assert.rejects(payload.unlock({collection:'staff',overrideAccess:false,req:{user:user??null},data:unlockData}),forbidden);
      const current=await lockState();assert.equal(Number(current.login_attempts),5);assert.ok(current.lock_until);
    });
  }
  await check('owner can unlock a staff account',async()=>{
    await lock();
    assert.equal(await payload.unlock({collection:'staff',overrideAccess:false,req:{user:users.owner},data:unlockData}),true);
    const current=await lockState();assert.equal(Number(current.login_attempts),0);assert.equal(current.lock_until,null);
  });
  stage='notification field projection';
  const enquiry=await payload.create({collection:'enquiries',overrideAccess:true,data:{reference:`EA-${randomUUID()}`,requestKey:randomUUID(),fingerprint:'disposable-boundary-test',locale:'en',source:'cms',name:'Synthetic tester',email:'customer@example.invalid',company:'Disposable regression',items:[{productId:'fixture',model:'TEST',nameEn:'Fixture',nameAr:'اختبار',quantity:1}],verificationStatus:'verified',verifiedAt:new Date().toISOString(),deliveryStatus:'not-configured',status:'new'}});
  const deliveryKey=randomUUID(),leaseToken=randomUUID();
  const notification=await payload.create({collection:'notifications',overrideAccess:true,data:{reference:enquiry.reference,enquiry:enquiry.id,deliveryKey,leaseToken,recipient:'staff@example.invalid',source:'cms',status:'pending',attempts:0,nextAttemptAt:new Date(Date.now()-1000).toISOString()}});
  for(const role of ['owner','sales'] as const){
    await check(`${role} can read queue status without worker identifiers`,async()=>{
      const options={collection:'notifications' as const,overrideAccess:false,user:users[role],depth:0};
      const detail=await payload.findByID({...options,id:notification.id});
      const list=await payload.find({...options,where:{id:{equals:notification.id}}});
      for(const row of [detail,...list.docs]){
        assert.equal(row.reference,enquiry.reference);assert.equal(row.status,'pending');
        assert.equal('deliveryKey' in row,false);assert.equal('leaseToken' in row,false);
      }
      assert.equal(list.totalDocs,1);
    });
  }
  for(const [label,user] of [['anonymous',undefined],['warehouse',users.warehouse],['catalogue editor',users['catalogue-editor']]] as const){
    await check(`${label} cannot read the notification queue`,async()=>{
      await assert.rejects(payload.find({collection:'notifications',overrideAccess:false,user,depth:0}),forbidden);
    });
  }
  await check('trusted worker retains identifiers and delivers once through fake transport',async()=>{
    const trusted=await payload.findByID({collection:'notifications',id:notification.id,overrideAccess:true,depth:0});
    assert.equal(trusted.deliveryKey,deliveryKey);assert.equal(trusted.leaseToken,leaseToken);
    let sent=0;
    const transport={send:async(message:{idempotencyKey:string})=>{sent++;assert.equal(message.idempotencyKey,deliveryKey);return{id:'synthetic-boundary-receipt'};}};
    const results=await Promise.all([deliverNextNotification(payload,transport),deliverNextNotification(payload,transport)]);
    assert.equal(sent,1);assert.equal(results.filter(result=>result.outcome==='sent').length,1);
    const final=await payload.findByID({collection:'notifications',id:notification.id,overrideAccess:true,depth:0});
    assert.equal(final.status,'sent');assert.equal(final.attempts,1);assert.equal(final.leaseToken,null);
  });
  stage='owner continuity';
  const ownerCount=async()=>Number((await payload.db.pool.query("SELECT count(*) AS count FROM staff WHERE role='owner'")).rows[0].count);
  const roleOf=async(id:number)=>(await payload.findByID({collection:'staff',id,overrideAccess:true})).role;
  const updateRole=(id:number,role:Staff['role'])=>payload.update({collection:'staff',id,overrideAccess:false,user:users.owner,data:{role}});
  await check('the last owner cannot be demoted',async()=>{
    await assert.rejects(updateRole(users.owner.id,'sales'));
    assert.equal(await roleOf(users.owner.id),'owner');assert.equal(await ownerCount(),1);
  });
  // Restore only these disposable fixtures after an expected red-stage failure.
  await payload.db.pool.query("UPDATE staff SET role='owner' WHERE id=$1",[users.owner.id]);
  await check('an owner can transfer ownership after appointing another owner',async()=>{
    await updateRole(users.sales.id,'owner');
    await updateRole(users.owner.id,'sales');
    assert.equal(await roleOf(users.sales.id),'owner');assert.equal(await roleOf(users.owner.id),'sales');
    await payload.update({collection:'staff',id:users.owner.id,overrideAccess:false,user:{...users.sales,role:'owner'},data:{role:'owner'}});
  });
  await check('bulk staff changes cannot remove every owner',async()=>{
    await assert.rejects(payload.update({collection:'staff',overrideAccess:false,user:users.owner,where:{role:{equals:'owner'}},data:{role:'sales'}}));
    assert.equal(await ownerCount(),2);
  });
  await payload.db.pool.query("UPDATE staff SET role='owner' WHERE id=ANY($1::int[])",[[users.owner.id,users.sales.id]]);
  await check('simultaneous owner demotions preserve exactly one owner',async()=>{
    const results=await Promise.allSettled([updateRole(users.owner.id,'sales'),updateRole(users.sales.id,'sales')]);
    assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
    assert.equal(await ownerCount(),1);
  });
  await payload.db.pool.query("UPDATE staff SET role='owner' WHERE id=ANY($1::int[])",[[users.owner.id,users.sales.id]]);
  await check('role changes fail closed without a database transaction',async()=>{
    await assert.rejects(payload.update({collection:'staff',id:users.sales.id,overrideAccess:false,user:users.owner,disableTransaction:true,data:{role:'sales'}}));
    assert.equal(await roleOf(users.sales.id),'owner');
  });
  await payload.db.pool.query("UPDATE staff SET role='owner' WHERE id=ANY($1::int[])",[[users.owner.id,users.sales.id]]);
  await check('an uncommitted demotion holds the lock and rollback releases it',async()=>{
    const transactionID=await payload.db.beginTransaction();assert.ok(transactionID);
    try{
      await payload.update({collection:'staff',id:users.sales.id,overrideAccess:false,user:users.owner,req:{transactionID},data:{role:'sales'}});
      await assert.rejects(updateRole(users.owner.id,'sales'));
    }finally{await payload.db.rollbackTransaction(transactionID);}
    assert.equal(await roleOf(users.sales.id),'owner');assert.equal(await ownerCount(),2);
    await updateRole(users.sales.id,'sales');assert.equal(await ownerCount(),1);
    await updateRole(users.sales.id,'owner');
  });
  await check('failed staff validation releases the role lock for a corrected request',async()=>{
    await assert.rejects(payload.update({collection:'staff',id:users.sales.id,overrideAccess:false,user:users.owner,data:{role:'sales',email:'invalid-email'}}));
    assert.equal(await roleOf(users.sales.id),'owner');
    await updateRole(users.sales.id,'sales');assert.equal(await ownerCount(),1);
  });
  await check('ordinary owner edits and non-owner role changes still work',async()=>{
    const email=`edited-${randomUUID()}@example.invalid`;
    const edited=await payload.update({collection:'staff',id:users.owner.id,overrideAccess:false,user:users.owner,data:{email}});
    assert.equal(edited.email,email);assert.equal(edited.role,'owner');
    await updateRole(users.sales.id,'warehouse');assert.equal(await roleOf(users.sales.id),'warehouse');
  });
  assert.equal(Object.keys(payload.db.sessions??{}).length,0);
}catch{
  failures++;console.error(`Boundary regression failed during ${stage}; sensitive diagnostics withheld.`);
}finally{
  try{await close();console.log('Owned empty-schema fixtures removed.');}
  catch{failures++;console.error('Boundary fixture cleanup failed; inspect isolated schema before retrying.');}
}
console.log(`Admin boundary checks: ${checks} executed, ${failures} failed. Fake transport only; no external email.`);
process.exit(failures?1:0);
