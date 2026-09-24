import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enquiryHandlers} from '../src/lib/enquiry-http.ts';
const request=(body='{}',origin='https://example.test')=>new Request('https://example.test/api/enquiry-submissions',{method:'POST',headers:{origin,'content-type':'application/json'},body});
function setup(user={collection:'staff',role:'owner'},source='demo'){
  let writes=0;const handlers=enquiryHandlers({enabled:()=>true,source:()=>source,authenticate:async()=>user,submit:async()=>{writes++;return{reference:'test-reference',repeated:false};}});
  return{handlers,writes:()=>writes};
}
test('test enquiry writes require staff owner/sales and demo source',async()=>{
  for(const user of [null,{collection:'staff',role:'warehouse'},{collection:'staff',role:'catalogue-editor'},{collection:'other',role:'owner'}]){
    const t=setup(user);assert.equal((await t.handlers.POST(request())).status,403);assert.equal(t.writes(),0);
  }
  const real=setup(undefined,'cms');assert.equal((await real.handlers.POST(request())).status,503);assert.equal(real.writes(),0);
  for(const role of ['owner','sales']){const t=setup({collection:'staff',role});assert.equal((await t.handlers.POST(request())).status,201);assert.equal(t.writes(),1);}
});
test('cross-origin, malformed and oversized requests never reach persistence',async()=>{
  const t=setup();assert.equal((await t.handlers.POST(request('{}','https://evil.invalid'))).status,403);
  assert.equal((await t.handlers.POST(request('{'))).status,400);
  assert.equal((await t.handlers.POST(request(JSON.stringify({value:'x'.repeat(33000)})))).status,400);
  assert.equal(t.writes(),0);
});
test('capability response contains no identity and never caches staff permissions',async()=>{
  const t=setup();const response=await t.handlers.GET(new Request('https://example.test/api/enquiry-submissions'));
  assert.deepEqual(await response.json(),{canSaveTest:true});assert.equal(response.headers.get('cache-control'),'no-store');
  const denied=await setup(null).handlers.GET(new Request('https://example.test/api/enquiry-submissions'));
  assert.deepEqual(await denied.json(),{canSaveTest:false});
});
