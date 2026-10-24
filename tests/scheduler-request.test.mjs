import test from 'node:test';
import assert from 'node:assert/strict';
import {boundedSchedulerRequest,schedulerBodyLimit} from '../src/lib/scheduler-request.ts';
const make=(body,headers={},method='POST')=>new Request('https://example.test/api/inngest?fnId=delivery',{method,headers:{'content-type':'application/json','x-inngest-signature':'t=123&s=test',...headers},body,...(body instanceof ReadableStream?{duplex:'half'}:{})});
test('scheduler preserves signed raw bytes and URL instead of parsing or reserialising',async()=>{
 const text=' { "event": { "name": "inngest/scheduled.timer", "data": "أمل" } } ';
 const input=make(text);const result=await boundedSchedulerRequest(input);
 assert.equal(await result.text(),text);
 assert.equal(result.url,input.url);
 assert.equal(result.headers.get('x-inngest-signature'),input.headers.get('x-inngest-signature'));
});
test('scheduler rejects an unsigned POST before reading its body',async()=>{
 const input=make('{}');input.headers.delete('x-inngest-signature');
 await assert.rejects(boundedSchedulerRequest(input),e=>e.status===401);
 assert.equal(input.bodyUsed,false);
});
test('scheduler bounds chunked bytes even with missing or dishonest content length',async()=>{
 for(const headers of [{},{'content-length':'1'}]){
  let cancelled=false;
  const body=new ReadableStream({start(c){c.enqueue(new Uint8Array(schedulerBodyLimit));c.enqueue(new Uint8Array(1));},cancel(){cancelled=true;}});
  await assert.rejects(boundedSchedulerRequest(make(body,headers)),e=>e.status===413);
  assert.equal(cancelled,true);
 }
});
test('scheduler permits the byte boundary and bodyless registration but rejects compression and oversized declarations',async()=>{
 assert.equal((await (await boundedSchedulerRequest(make('x'.repeat(schedulerBodyLimit)))).text()).length,schedulerBodyLimit);
 for(const headers of [{'content-length':String(schedulerBodyLimit+1)},{'content-length':'bad'}])await assert.rejects(boundedSchedulerRequest(make('{}',headers)),e=>e.status===413);
 await assert.rejects(boundedSchedulerRequest(make('{}',{'content-encoding':'gzip'})),e=>e.status===415);
 const get=new Request('https://example.test/api/inngest');assert.equal(await boundedSchedulerRequest(get),get);
 const put=new Request('https://example.test/api/inngest',{method:'PUT'});assert.equal(await boundedSchedulerRequest(put),put);
});
