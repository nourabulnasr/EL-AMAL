import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertQueueCapacity,QueueCapacityError} from '../src/lib/queue-capacity.ts';
import {customerHandlers} from '../src/lib/customer-http.ts';

test('admission rejects full confirmation or staff queues, permits room and fails closed for invalid counts',async()=>{
 for(const [verification,notification,expected] of [[99,99,true],[100,0,false],[0,100,false],[NaN,0,false]]){
  const query=async sql=>sql.includes('pg_advisory_xact_lock')?{rows:[]}:{rows:[{verification,notification}]};
  if(expected)await assertQueueCapacity(query);
  else await assert.rejects(assertQueueCapacity(query),QueueCapacityError);
 }
});

test('queue capacity refusal has retryable generic submit response and neutral resend response',async()=>{
 const secret='s'.repeat(40),origin='https://example.test';
 const handler=customerHandlers({settings:()=>({secret,origin}),allow:async()=>true,submit:async()=>{throw new QueueCapacityError();},resend:async()=>{throw new QueueCapacityError();}});
 const {randomUUID}=await import('node:crypto');
 const {createReceipt}=await import('../src/lib/customer-receipt.ts');
 const request=body=>new Request(origin+'/api/customer-enquiries',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
 const response=await handler.POST(request({requestKey:randomUUID(),locale:'en',contact:{name:'Test',company:'Test',email:'test@example.invalid',notes:''},lines:[],manual:{model:'TEST',quantity:1,range:'0-10bar'}}));
 assert.equal(response.status,503);
 assert.equal(response.headers.get('retry-after'),'60');
 assert.equal((await response.text()).includes('100'),false);
 const resend=await handler.resend(request({receipt:createReceipt(`EA-${randomUUID()}`,secret)}));
 assert.equal(resend.status,202);assert.deepEqual(await resend.json(),{accepted:true});
});
