import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runDeliveryBatch, deliveryOperationsHandler, isDeliveryHealthFresh,assertFreshDeliveryHealth} from '../src/lib/delivery-operations.ts';

const secret='c'.repeat(40);
const request=(method='GET',authorization=`Bearer ${secret}`)=>new Request('https://example.invalid/api/internal/delivery-operations',{method,headers:{authorization}});

test('scheduler denies missing, wrong, short and multibyte credentials before readiness or work',async()=>{
 let accessed=false;
 const handler=deliveryOperationsHandler({secret:()=>secret,enabled:()=>{accessed=true;return true;},run:async()=>{accessed=true;return {outcome:'complete'};}});
 for(const auth of ['', 'Bearer short',`Bearer ${'x'.repeat(40)}`,`Bearer ${'é'.repeat(40)}`])assert.equal((await handler(request('GET',auth))).status,401);
 assert.equal(accessed,false);
 assert.equal((await deliveryOperationsHandler({secret:()=> 'short',enabled:()=>true,run:async()=>({outcome:'complete'})})(request('GET','Bearer short'))).status,401);
});

test('only authenticated GET/POST run; HEAD never performs work and failures are generic',async()=>{
 let calls=0;
 const deps={secret:()=>secret,enabled:()=>true,run:async()=>{calls++;return {outcome:'complete',processed:0};}};
 const handler=deliveryOperationsHandler(deps);
 for(const method of ['GET','POST']){
  const result=await handler(request(method));
  assert.equal(result.status,200);
  assert.equal(result.headers.get('cache-control'),'no-store');
  assert.equal(result.headers.get('x-robots-tag'),'noindex, nofollow');
 }
 assert.equal((await handler(request('HEAD'))).status,405);
 assert.equal(calls,2);
 const disabled=await deliveryOperationsHandler({...deps,enabled:()=>false})(request());
 assert.equal(disabled.status,503);
 const failure=await deliveryOperationsHandler({...deps,run:async()=>{throw new Error('private@example.invalid TOKEN');}})(request());
 assert.equal(failure.status,503);
 assert.equal((await failure.text()).includes('private'),false);
});

test('batch alternates queues, caps work, and counts provider acceptance without claiming inbox delivery',async()=>{
 const calls=[];
 const result=await runDeliveryBatch({verification:async()=>{calls.push('verification');return{outcome:'sent'};},notification:async()=>{calls.push('notification');return{outcome:'retry'};},now:()=>0});
 assert.deepEqual(calls,['verification','notification','verification','notification','verification','notification','verification','notification']);
 assert.equal(result.processed,8);
 assert.equal(result.accepted,4);
 assert.equal(result.failures,4);
 assert.equal(result.outcome,'degraded');
});

test('empty queue cannot starve the other; both empty stop without spinning',async()=>{
 let v=0,n=0;
 const result=await runDeliveryBatch({verification:async()=>{v++;return{outcome:'empty'};},notification:async()=>{n++;return{outcome:'sent'};},now:()=>0});
 assert.equal(v,1);assert.equal(n,8);assert.equal(result.processed,8);
 const empty=await runDeliveryBatch({verification:async()=>({outcome:'empty'}),notification:async()=>({outcome:'empty'}),now:()=>0});
 assert.equal(empty.processed,0);
});

test('batch stops starting work before its deadline and stops on a disabled worker',async()=>{
 let time=0,calls=0;
 const next=async()=>{calls++;time+=15000;return{outcome:'sent'};};
 const result=await runDeliveryBatch({verification:next,notification:next,now:()=>time});
 assert.equal(calls,3);assert.equal(result.processed,3);
 const disabled=await runDeliveryBatch({verification:async()=>({outcome:'disabled'}),notification:async()=>{throw new Error('must not send');},now:()=>0});
 assert.equal(disabled.outcome,'disabled');
});

test('fresh health requires a completed success, rejects stale, future and degraded health',()=>{
 const now=1800000000000;
 assert.equal(isDeliveryHealthFresh({lastOutcome:'complete',lastSuccessAt:new Date(now-60000).toISOString()},now),true);
 for(const row of [undefined,{lastOutcome:'degraded',lastSuccessAt:new Date(now).toISOString()},{lastOutcome:'maintenance',lastSuccessAt:new Date(now).toISOString()},{lastOutcome:'complete',lastSuccessAt:new Date(now-900001).toISOString()},{lastOutcome:'complete',lastSuccessAt:new Date(now+60000).toISOString()}])assert.equal(isDeliveryHealthFresh(row,now),false);
});

test('budget exhaustion before either queue is checked cannot create healthy evidence',async()=>{
 const result=await runDeliveryBatch({verification:async()=>{throw new Error('must not run');},notification:async()=>{throw new Error('must not run');},now:()=>40000,deadlineAt:40000});
 assert.equal(result.outcome,'degraded');
 assert.equal(result.processed,0);
});

test('scheduler exposes disabled or degraded operation as retryable unhealthy status',async()=>{
 for(const outcome of ['disabled','degraded','stale']){
  const response=await deliveryOperationsHandler({secret:()=>secret,enabled:()=>true,run:async()=>({outcome})})(request());
  assert.equal(response.status,503);
 }
});
test('a maintenance-only scheduler run succeeds without representing mail delivery readiness',async()=>{
 const {runDeliveryOperations}=await import('../src/lib/delivery-runner.ts');
 const payload={db:{pool:{query:async()=>({rows:[{id:1}],rowCount:1})}}};
 let maintained=false;
 const handler=deliveryOperationsHandler({secret:()=>secret,enabled:()=>true,run:()=>runDeliveryOperations(payload,{secret,maintenance:async()=>{maintained=true;}})});
 const response=await handler(request());
 assert.equal(response.status,200);
 const result=await response.json();
 assert.equal(result.outcome,'maintenance');
 assert.equal(result.processed,0);assert.equal(result.accepted,0);assert.equal(maintained,true);
 assert.equal(isDeliveryHealthFresh({lastOutcome:result.outcome,lastSuccessAt:new Date().toISOString()}),false);
});
test('new customer admission requires real fresh durable delivery evidence',async()=>{
 const now=1800000000000;
 const success={lastOutcome:'complete',lastSuccessAt:new Date(now-60000).toISOString()};
 await assertFreshDeliveryHealth(async()=>({rows:[success]}),now);
 for(const row of [undefined,{...success,lastOutcome:'error'},{...success,lastSuccessAt:new Date(now-900001).toISOString()}]){
  await assert.rejects(assertFreshDeliveryHealth(async()=>({rows:row?[row]:[]}),now),/Delivery is temporarily unavailable/);
 }
});
test('new customer submissions stop before quota or persistence when delivery is stale, while accepted retries remain available',async()=>{
 const {submitCustomerEnquiry}=await import('../src/lib/customer-service.ts');
 const {parseEnquiry,enquiryFingerprint}=await import('../src/lib/enquiries.ts');
 const {randomUUID}=await import('node:crypto');
 const input={requestKey:randomUUID(),locale:'en',contact:{name:'Test customer',company:'Fixture company',email:'test@example.invalid',notes:''},lines:[],manual:{model:'TEST',quantity:1,range:'0-10 bar'}};
 const settings={secret:'s'.repeat(40),origin:'https://example.invalid',from:'sender@example.invalid'};
 const catalogue={source:'cms',products:[],categories:[]};
 const payload={find:async()=>({docs:[]}),db:{pool:{query:async statement=>{
  assert.match(statement,/FROM delivery_operations/,'Fresh health must be checked before quota or writes');return {rows:[]};
 }}}};
 await assert.rejects(submitCustomerEnquiry(payload,input,catalogue,settings),/Delivery is temporarily unavailable/);
 payload.find=async()=>({docs:[{reference:'EA-existing',fingerprint:enquiryFingerprint(parseEnquiry(input),'cms')}]});
 payload.db.pool.query=async()=>{throw new Error('An accepted retry must not depend on current worker health');};
 assert.deepEqual(await submitCustomerEnquiry(payload,input,catalogue,settings),{reference:'EA-existing',repeated:true});
});
