import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tokenDigest} from '../src/lib/enquiry-verification.ts';
import {requestLimitKey} from '../src/lib/request-limits.ts';
import {verificationHandlers} from '../src/lib/verification-http.ts';
import {EnquiryVerifications,RequestLimits} from '../src/cms/verification.ts';
const token='a'.repeat(64),secret='s'.repeat(32);
const request=(body,origin='https://example.test')=>new Request('https://example.test/api/enquiry-verification',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
const deps={enabled:()=>true,authenticate:async()=>({collection:'staff',role:'owner'}),allow:async()=>true,issue:async()=>token,confirm:async()=>({reference:'test',mode:'test'})};
test('verification tokens are strict and stored as a digest',()=>{
 for(const value of [undefined,null,42,'a'.repeat(63),'z'.repeat(64),token.toUpperCase()])assert.equal(tokenDigest(value),null);
 assert.equal(tokenDigest(token).length,64);assert.notEqual(tokenDigest(token),token);
});
test('only configured Vercel proxy headers influence pseudonymous rate buckets',()=>{
 const env={PAYLOAD_SECRET:secret,VERCEL:'1'},headers=new Headers({'x-forwarded-for':'192.0.2.1'});
 const a=requestLimitKey(headers,'confirm',env);assert.equal(a.length,64);assert.ok(!a.includes('192.0.2.1'));
 assert.notEqual(a,requestLimitKey(headers,'issue',env));
 assert.equal(requestLimitKey(headers,'confirm',{PAYLOAD_SECRET:secret}),requestLimitKey(new Headers(),'confirm',{PAYLOAD_SECRET:secret}));
 assert.equal(requestLimitKey(new Headers({'x-forwarded-for':'fake, 192.0.2.2'}),'confirm',env),requestLimitKey(new Headers(),'confirm',env));
 assert.throws(()=>requestLimitKey(headers,'confirm',{}));
});
test('token issuance is staff-only and cannot leak tokens to other roles',async()=>{
 for(const user of [null,{collection:'other',role:'owner'},{collection:'staff',role:'warehouse'},{collection:'staff',role:'catalogue-editor'}]){
  let calls=0;const h=verificationHandlers({...deps,authenticate:async()=>user,issue:async()=>{calls++;return token;}});
  assert.equal((await h.issue(request({reference:'EA-'+ 'a'.repeat(36)}))).status,403);assert.equal(calls,0);
 }
});
test('verification rejects cross-origin, excessive, malformed and oversized requests',async()=>{
 let calls=0;const h=verificationHandlers({...deps,confirm:async()=>{calls++;return null;}});
 assert.equal((await h.confirm(request({token},'https://evil.invalid'))).status,403);
 assert.equal((await h.confirm(request({token:'invalid'}))).status,400);
 assert.equal((await h.confirm(request({token,extra:'x'.repeat(5000)}))).status,400);
 const limited=await verificationHandlers({...deps,allow:async()=>false}).confirm(request({token}));assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'60');assert.equal(calls,0);
});
test('confirmation returns a test result without stock or email claims and never caches',async()=>{
 const response=await verificationHandlers(deps).confirm(request({token}));assert.deepEqual(await response.json(),{reference:'test',mode:'test',stockReserved:false});assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal((await verificationHandlers({...deps,confirm:async()=>null}).confirm(request({token}))).status,400);
});
test('verification tokens and rate buckets have no REST access, including owner',()=>{
 for(const collection of [EnquiryVerifications,RequestLimits])for(const operation of ['read','create','update','delete'])assert.equal(collection.access[operation]({req:{user:{role:'owner'}}}),false);
});
