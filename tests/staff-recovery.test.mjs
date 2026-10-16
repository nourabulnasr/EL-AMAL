import {test} from 'node:test';
import assert from 'node:assert/strict';
import {staffRecoveryHandler} from '../src/lib/staff-recovery.ts';
const env={STAFF_RECOVERY_ENABLED:'true',MAIL_PROVIDER:'resend',MAIL_FROM:'admin@example.test',RESEND_API_KEY:'test',SITE_URL:'https://example.test'};
const req=(body,origin=env.SITE_URL)=>new Request(`${env.SITE_URL}/api/staff/forgot-password`,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
test('forgot recovery hides unknown users, provider failures and cooldowns without returning tokens',async()=>{
  for(const forgot of [async()=>null,async()=> 'private-reset-token',async()=>{throw new Error('private-provider-message');}]){
    const handler=staffRecoveryHandler({env:()=>env,allow:async()=>true,forgot,reset:async()=>new Response()});
    const response=await handler(req({email:'owner@example.test'}),'forgot-password');
    assert.equal(response.status,200);assert.deepEqual(await response.json(),{message:'If the account is eligible, a password reset email will be sent.'});
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
});
test('recovery denies invalid origin, disabled config and rate limit before sending',async()=>{
  let calls=0;const deps={env:()=>env,allow:async()=>true,forgot:async()=>{calls++;},reset:async()=>new Response()};
  assert.equal((await staffRecoveryHandler(deps)(req({email:'a@example.test'},'https://attacker.test'),'forgot-password')).status,403);
  assert.equal((await staffRecoveryHandler({...deps,env:()=>({})})(req({email:'a@example.test'}),'forgot-password')).status,503);
  assert.equal((await staffRecoveryHandler({...deps,allow:async()=>false})(req({email:'a@example.test'}),'forgot-password')).status,429);
  assert.equal(calls,0);
});
test('reset passes a bounded sanitized request to Payload and preserves its session response',async()=>{
  let body;
  const handler=staffRecoveryHandler({env:()=>env,allow:async()=>true,forgot:async()=>{},reset:async request=>{body=await request.json();return new Response('done',{headers:{'Set-Cookie':'example=unit-test; HttpOnly'}});}});
  const response=await handler(req({token:'a'.repeat(40),password:'An instrument shelf at dawn',role:'owner'}),'reset-password');
  assert.deepEqual(body,{token:'a'.repeat(40),password:'An instrument shelf at dawn'});
  assert.equal(response.headers.get('set-cookie'),'example=unit-test; HttpOnly');
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  assert.equal(await response.text(),'done');
});

const adminRequest=body=>{
  const form=new FormData();form.append('_payload',JSON.stringify(body));
  return new Request(`${env.SITE_URL}/api/staff/forgot-password`,{method:'POST',headers:{origin:env.SITE_URL},body:form});
};
test('the actual Payload admin multipart form can request recovery and reset a password',async()=>{
  let email,forwarded;
  const handler=staffRecoveryHandler({env:()=>env,allow:async()=>true,forgot:async value=>{email=value;},reset:async request=>{
    forwarded={contentType:request.headers.get('content-type'),body:await request.json()};
    return Response.json({message:'Password reset.'},{headers:{'Set-Cookie':'payload-token=synthetic; HttpOnly'}});
  }});
  const forgot=await handler(adminRequest({email:' OWNER@example.test '}),'forgot-password');
  assert.equal(forgot.status,200);assert.equal(email,'owner@example.test');
  const reset=await handler(adminRequest({token:'a'.repeat(40),password:'A unique instrument shelf phrase',role:'owner','confirm-password':'A unique instrument shelf phrase'}),'reset-password');
  assert.equal(reset.status,200);
  assert.deepEqual(forwarded,{contentType:'application/json',body:{token:'a'.repeat(40),password:'A unique instrument shelf phrase'}});
  assert.equal(reset.headers.get('set-cookie'),'payload-token=synthetic; HttpOnly');
});
test('recovery rejects files, duplicate payload fields, malformed forms and oversized streamed form bodies',async()=>{
  let calls=0;
  const handler=staffRecoveryHandler({env:()=>env,allow:async()=>true,forgot:async()=>{calls++;},reset:async()=>{calls++;return new Response();}});
  for(const amend of [
    form=>form.append('_payload','{}'),
    form=>form.append('file',new Blob(['private']),'private.txt'),
    form=>form.set('_payload','not-json'),
    form=>form.set('_payload',new Blob(['{}']),'payload.json'),
    form=>form.set('_payload',JSON.stringify({email:'owner@example.test',extra:'x'.repeat(9000)})),
  ]){
    const form=new FormData();form.append('_payload',JSON.stringify({email:'owner@example.test'}));amend(form);
    const request=new Request(`${env.SITE_URL}/api/staff/forgot-password`,{method:'POST',headers:{origin:env.SITE_URL},body:form});
    assert.equal((await handler(request,'forgot-password')).status,400);
  }
  assert.equal(calls,0);
});
test('weak reset passwords return a useful Payload-compatible error without calling reset',async()=>{
  let calls=0;
  const handler=staffRecoveryHandler({env:()=>env,allow:async()=>true,forgot:async()=>{},reset:async()=>{calls++;return new Response();}});
  const response=await handler(adminRequest({token:'a'.repeat(40),password:'short'}),'reset-password');
  assert.equal(response.status,400);assert.match((await response.json()).message,/15–128/);assert.equal(calls,0);
});
