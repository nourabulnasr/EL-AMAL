import {test} from 'node:test';
import assert from 'node:assert/strict';
import {staffPasswordError, validateStaffOperation, recoveryReady, recoveryRequest} from '../src/lib/staff-security.ts';

test('staff passwords require a long passphrase, support Unicode and never truncate',()=>{
  for(const value of [undefined,123,'short','a'.repeat(129),' '.repeat(20),'passwordpassword','123456789012345']) assert.ok(staffPasswordError(value));
  for(const value of ['An instrument shelf at dawn','كلمة مرور طويلة ومختلفة ٢٠٢٦','A9_'.repeat(30)]) assert.equal(staffPasswordError(value),null);
});
test('password policy covers staff create, update and reset but leaves login and unrelated updates alone',()=>{
  for(const operation of ['create','update','resetPassword']) assert.throws(()=>validateStaffOperation(operation,{data:{password:'short'}}),/15/);
  assert.doesNotThrow(()=>validateStaffOperation('login',{data:{password:'old'}}));
  assert.doesNotThrow(()=>validateStaffOperation('update',{data:{email:'owner@example.test'}}));
  assert.doesNotThrow(()=>validateStaffOperation('resetPassword',{data:{password:'The gauges on the steel shelf'}}));
});
const configured={STAFF_RECOVERY_ENABLED:'true',MAIL_PROVIDER:'resend',MAIL_FROM:'admin@example.test',RESEND_API_KEY:'test',SITE_URL:'https://example.test'};
test('staff recovery requires an explicit switch, sender and exact HTTPS origin',()=>{
  assert.equal(recoveryReady(configured),true);
  for(const key of Object.keys(configured)) assert.equal(recoveryReady({...configured,[key]:''}),false,key);
  assert.equal(recoveryReady({...configured,SITE_URL:'https://example.test/path'}),false);
  assert.equal(recoveryReady({...configured,SITE_URL:'http://example.test'}),false);
});
function request(body,origin='https://example.test') { return new Request('https://example.test/api/staff/forgot-password',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}); }
test('recovery refuses cross-origin, malformed and oversized requests before work',async()=>{
  await assert.rejects(recoveryRequest(request({email:'a@b.test'},'https://attacker.test'),'forgot-password',configured),/origin/);
  await assert.rejects(recoveryRequest(request({email:'not-email'}),'forgot-password',configured),/email/);
  await assert.rejects(recoveryRequest(request({email:'a@b.test',extra:'x'.repeat(9000)}),'forgot-password',configured));
  assert.deepEqual(await recoveryRequest(request({email:' A@B.test '}),'forgot-password',configured),{email:'a@b.test'});
});
test('reset rejects weak passwords and malformed tokens before password hashing',async()=>{
  await assert.rejects(recoveryRequest(request({token:'a'.repeat(40),password:'short'}),'reset-password',configured),/15/);
  await assert.rejects(recoveryRequest(request({token:'no',password:'Strong phrase for recovery'}),'reset-password',configured),/token/);
  assert.deepEqual(await recoveryRequest(request({token:'a'.repeat(40),password:'Strong phrase for recovery'}),'reset-password',configured),{token:'a'.repeat(40),password:'Strong phrase for recovery'});
});
