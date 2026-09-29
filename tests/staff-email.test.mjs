import {test} from 'node:test';
import assert from 'node:assert/strict';
import {staffEmailAdapter} from '../src/lib/staff-email.ts';
const env={STAFF_RECOVERY_ENABLED:'true',MAIL_PROVIDER:'resend',MAIL_FROM:'admin@example.test',RESEND_API_KEY:'unit-test-only',SITE_URL:'https://example.test'};
test('disabled staff email fails closed without sending or logging reset content',async()=>{
  let calls=0;
  const adapter=staffEmailAdapter({},async()=>{calls++;throw new Error('unexpected');})({});
  await assert.rejects(adapter.sendEmail({to:'owner@example.test',subject:'Reset',html:'private'}),/unavailable/);
  assert.equal(calls,0);
});
test('staff recovery uses configured sender, one validated recipient and stable provider idempotency',async()=>{
  const calls=[];
  const adapter=staffEmailAdapter(env,async(url,options)=>{calls.push({url,...options});return Response.json({id:'receipt-1'});})({});
  const message={from:'untrusted@example.test',to:'owner@example.test',subject:'Reset EL AMAL password',html:'<a href="https://example.test/admin/reset/token">Reset</a>'};
  assert.deepEqual(await adapter.sendEmail(message),{id:'receipt-1'});
  await adapter.sendEmail(message);
  assert.equal(calls[0].url,'https://api.resend.com/emails');
  assert.deepEqual(JSON.parse(calls[0].body),{from:env.MAIL_FROM,to:['owner@example.test'],subject:message.subject,html:message.html});
  assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
  assert.equal(calls[0].redirect,'error');
  for(const to of [['a@example.test','b@example.test'],'x@example.test\r\nBcc:z@example.test']) await assert.rejects(adapter.sendEmail({...message,to}));
  assert.equal(calls.length,2);
});
test('staff recovery provider errors do not expose response bodies',async()=>{
  const adapter=staffEmailAdapter(env,async()=>new Response('owner@example.test secret-token',{status:403}))({});
  await assert.rejects(adapter.sendEmail({to:'owner@example.test',subject:'Reset',html:'private'}),e=>e.message==='Staff email delivery not confirmed');
});
