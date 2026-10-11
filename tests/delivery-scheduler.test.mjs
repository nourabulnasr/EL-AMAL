import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDeliveryScheduler,runScheduledDelivery} from '../src/lib/delivery-scheduler.ts';

const env={VERCEL_ENV:'production',CMS_ENABLED:'true',DATABASE_URL:'postgresql://unused.invalid/test',PAYLOAD_SECRET:'s'.repeat(40),DELIVERY_OPERATIONS_ENABLED:'true',INNGEST_SIGNING_KEY:'signkey-prod-'+ 'a'.repeat(64),SITE_URL:'https://www.al-amaleg.com'};
const request=method=>new Request('https://www.al-amaleg.com/api/inngest',{method,...(method==='POST'?{headers:{'content-type':'application/json'},body:'{}'}:{})});

test('scheduler cannot run on a preview or without its signing key, even with development override',async()=>{
 for(const settings of [{...env,VERCEL_ENV:'preview'},{...env,INNGEST_SIGNING_KEY:''},{...env,DELIVERY_OPERATIONS_ENABLED:'false'},{...env,CMS_ENABLED:'false'}]){
  const handlers=createDeliveryScheduler({...settings,INNGEST_DEV:'1'},async()=>{assert.fail('Disabled scheduler reached the database');});
  for(const method of ['GET','POST','PUT'])assert.equal((await handlers[method](request(method))).status,503);
 }
});

test('enabled scheduler rejects unsigned execution before any delivery work',async()=>{
 const previous=process.env.INNGEST_DEV;process.env.INNGEST_DEV='1';
 try{
  const handlers=createDeliveryScheduler(env,async()=>{assert.fail('Unsigned request reached delivery');});
  for(const signature of [null,'t=1&s=forged']){
   const input=request('POST');if(signature)input.headers.set('x-inngest-signature',signature);
   const response=await handlers.POST(input);
   assert.equal(response.status,401);
   assert.equal(response.headers.get('cache-control'),'private, no-store');
   assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
   assert.equal((await response.text()).includes(env.INNGEST_SIGNING_KEY),false);
  }
 }finally{if(previous===undefined)delete process.env.INNGEST_DEV;else process.env.INNGEST_DEV=previous;}
});

test('scheduler results contain only outcome and counts, with failures exposed for retry',async()=>{
 const result=await runScheduledDelivery(async()=>({outcome:'complete',processed:2,accepted:2,failures:0,email:'private@example.invalid',token:'secret'}));
 assert.deepEqual(result,{outcome:'complete',processed:2,accepted:2,failures:0});
 assert.deepEqual(await runScheduledDelivery(async()=>({outcome:'overlap'})),{outcome:'overlap'});
 for(const outcome of ['degraded','disabled','stale','error'])await assert.rejects(runScheduledDelivery(async()=>({outcome})),/Delivery schedule unavailable/);
 await assert.rejects(runScheduledDelivery(async()=>{throw new Error('private@example.invalid');}),error=>error.message==='Delivery schedule unavailable');
});
