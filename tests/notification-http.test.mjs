import {test} from 'node:test';
import assert from 'node:assert/strict';
import {notificationHandler} from '../src/lib/notification-http.ts';
const secret='s'.repeat(32);
const request=(authorization='')=>new Request('https://example.invalid/api/internal/notifications',{method:'POST',headers:{authorization}});
test('worker denies missing, wrong, malformed and unconfigured credentials before work',async()=>{
 let runs=0;const handler=notificationHandler({secret:()=>secret,enabled:()=>true,run:async()=>{runs++;return {outcome:'empty'};}});
 for(const header of ['',`Bearer ${'z'.repeat(32)}`,secret,'Bearer short',`Bearer ${'é'.repeat(32)}`])assert.equal((await handler(request(header))).status,401);
 assert.equal(runs,0);
 const unconfigured=notificationHandler({secret:()=>undefined,enabled:()=>true,run:async()=>{throw new Error('Must not run');}});
 assert.equal((await unconfigured(request('Bearer undefined'))).status,401);
});
test('worker reports disabled/failure without details and runs one authorised job',async()=>{
 let runs=0;const base={secret:()=>secret,enabled:()=>true,run:async()=>{runs++;return{outcome:'sent'};}};
 const success=await notificationHandler(base)(request(`Bearer ${secret}`));
 assert.deepEqual(await success.json(),{outcome:'sent'});assert.equal(runs,1);assert.equal(success.headers.get('cache-control'),'no-store');
 const disabled=await notificationHandler({...base,enabled:()=>false})(request(`Bearer ${secret}`));assert.equal(disabled.status,503);assert.equal(runs,1);
 const failed=await notificationHandler({...base,run:async()=>{throw new Error('secret');}})(request(`Bearer ${secret}`));
 assert.equal(failed.status,503);assert.equal(JSON.stringify(await failed.json()).includes('secret'),false);
});
