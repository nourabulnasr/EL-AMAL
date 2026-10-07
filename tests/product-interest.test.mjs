import test from 'node:test';
import assert from 'node:assert/strict';
import {parseInterestEvents,parseInterestQuery,interestCsv,interestMetrics} from '../src/lib/product-interest.ts';
import {createInterestSession,readInterestSession,interestSessionHash} from '../src/lib/product-interest-session.ts';
import {interestHandler} from '../src/lib/product-interest-http.ts';

const event={kind:'impression',productId:'cms-1',locale:'en',list:'catalogue'};
const secret='analytics-test-secret-for-local-unit-tests-only-0123456789';
const origin='https://example.test';
const now=Date.parse('2026-10-07T12:00:00Z');
test('analytics accepts only bounded, known product event fields without freeform data',()=>{
  assert.deepEqual(parseInterestEvents({events:[event]}),[event]);
  for(const value of [{events:[]},{events:Array(33).fill(event)},{events:[{...event,email:'person@example.test'}]},
    {events:[{...event,productId:'demo-p1'}]},{events:[{...event,productId:'cms-999999999999'}]},
    {events:[{...event,list:'search?email=private'}]},{events:[{...event,locale:'fr'}]},
    {events:[{...event,kind:'view',list:'catalogue'}]},{events:[event],notes:'private'}]) assert.throws(()=>parseInterestEvents(value));
});
test('signed sessions expire, reject tampering and cannot be linked using a different secret',()=>{
  const session=createInterestSession(secret,'mobile',now);
  assert.equal(readInterestSession(session,secret,now+1799999)?.device,'mobile');
  assert.equal(readInterestSession(session,secret,now+1800000),undefined);
  assert.equal(readInterestSession(session+'x',secret,now),undefined);
  assert.equal(readInterestSession(session,secret+'other',now),undefined);
  assert.equal(readInterestSession(session,secret,now-60000),undefined);
  const identity=readInterestSession(session,secret,now);
  assert.match(interestSessionHash(identity,secret),/^[a-f0-9]{64}$/);
  assert.notEqual(interestSessionHash(identity,secret),interestSessionHash(identity,secret+'other'));
});
test('report filters preserve aligned bounds and reject ambiguous or excessive requests',()=>{
  const query=parseInterestQuery(new URLSearchParams('start=2026-10-01&end=2026-10-07&locale=ar&list=catalogue&device=mobile&sort=ctr'),new Date(now));
  assert.equal(query.start,'2026-10-01');assert.equal(query.locale,'ar');assert.equal(query.sort,'ctr');
  for(const params of ['start=2026-01-01','locale=ar&locale=en','list=arbitrary','end=2026-11-01','sort=name','email=private'])assert.throws(()=>parseInterestQuery(new URLSearchParams(params),new Date(now)));
});
test('CTR has no invented denominator and low-volume samples are explicit',()=>{
  assert.deepEqual(interestMetrics(0,0),{ctr:null,smallSample:true});
  assert.deepEqual(interestMetrics(4,1),{ctr:25,smallSample:true});
  assert.deepEqual(interestMetrics(100,7),{ctr:7,smallSample:false});
  assert.throws(()=>interestMetrics(2,3));
});
test('analytics CSV exports only aggregates and neutralizes formula-bearing model labels',()=>{
  const csv=interestCsv({rows:[{productId:'cms-1',model:'=SUM(1,2)',impressions:4,selections:1,views:2,basketAdds:1,datasheets:0,ctr:25,smallSample:true}],filters:parseInterestQuery(new URLSearchParams(),new Date(now)),updatedAt:new Date(now).toISOString(),enabled:true});
  assert.match(csv,/"'=SUM\(1,2\)"/);assert.match(csv,/25/);assert.doesNotMatch(csv,/session_hash/);
});
function setup(overrides={}){
  const saved=[];
  const handler=interestHandler({settings:()=>({origin,secret}),allow:async()=>true,isStaff:async()=>false,save:async(session,events)=>saved.push({session,events}),now:()=>now,...overrides});
  const req=(body,headers={})=>new Request(`${origin}/api/product-interest`,{method:'POST',headers:{origin,'content-type':'application/json',...headers},body:JSON.stringify(body)});
  return {handler,req,saved};
}
test('collection requires explicit consent, signed session and same-origin JSON',async()=>{
  const {handler,req,saved}=setup();
  assert.equal((await handler(req({action:'start',device:'mobile'},{origin:'https://evil.test'}))).status,403);
  assert.equal((await handler(req({events:[event]}))).status,401);
  assert.equal((await handler(req({action:'start',device:'mobile'}))).status,400);
  const start=await handler(req({action:'start',device:'mobile',consent:true}));
  assert.equal(start.status,200);assert.match(start.headers.get('set-cookie'),/HttpOnly/);assert.match(start.headers.get('cache-control'),/no-store/);
  const cookie=start.headers.get('set-cookie').split(';')[0];
  assert.equal((await handler(req({events:[event]},{cookie}))).status,202);
  assert.equal(saved.length,1);assert.deepEqual(saved[0].events,[event]);
  assert.equal((await handler(req({action:'stop'},{cookie}))).headers.get('set-cookie').includes('Max-Age=0'),true);
});
test('disabled, staff, bot, privacy-signal and throttled requests never write analytics',async()=>{
  for(const overrides of [{settings:()=>undefined},{isStaff:async()=>true},{allow:async()=>false}]){
    const {handler,req,saved}=setup(overrides);await handler(req({action:'start',device:'desktop',consent:true}));assert.equal(saved.length,0);
  }
  for(const headers of [{'sec-gpc':'1'},{dnt:'1'},{'user-agent':'Googlebot'}]){
    const {handler,req,saved}=setup();assert.equal((await handler(req({action:'start',device:'desktop',consent:true},headers))).status,403);assert.equal(saved.length,0);
  }
});
