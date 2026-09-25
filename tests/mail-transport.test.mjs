import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mailReadiness,notificationTransport} from '../src/lib/mail-transport.ts';
const env={NOTIFICATION_DELIVERY_ENABLED:'true',MAIL_PROVIDER:'resend',RESEND_API_KEY:'test-not-a-key',MAIL_FROM:'sender@example.invalid',NOTIFICATION_WORKER_SECRET:'x'.repeat(32)};
const message={to:'receiver@example.invalid',subject:'Test reference',text:'Test only',idempotencyKey:'request-1'};
test('mail transport stays off until every required setting is configured',()=>{
 for(const key of Object.keys(env))assert.equal(notificationTransport({...env,[key]:undefined}),undefined);
 assert.equal(notificationTransport({...env,MAIL_FROM:'invalid'}),undefined);
 assert.equal(notificationTransport({...env,NOTIFICATION_DELIVERY_ENABLED:'false'}),undefined);
 assert.equal(Object.values(mailReadiness(env)).every(Boolean),true);
});
test('sender uses fixed HTTPS endpoint, timeout, JSON and stable idempotency key',async()=>{
 const calls=[];
 const transport=notificationTransport(env,async(url,options)=>{calls.push({url,options});return Response.json({id:'receipt'});});
 await transport.send(message);await transport.send(message);
 assert.equal(calls[0].url,'https://api.resend.com/emails');
 assert.equal(calls[0].options.redirect,'error');assert.ok(calls[0].options.signal instanceof AbortSignal);
 assert.equal(calls[0].options.headers['Idempotency-Key'],'request-1');
 assert.equal(calls[0].options.body,calls[1].options.body);
 assert.deepEqual(JSON.parse(calls[0].options.body),{from:env.MAIL_FROM,to:[message.to],subject:message.subject,text:message.text});
});
test('timeouts, provider errors and invalid receipts remain generic',async()=>{
 for(const fetcher of [async()=>{throw new Error('secret address timeout');},async()=>Response.json({error:'private provider details'},{status:429}),async()=>Response.json({id:''}),async()=>new Response('broken')]){
  await assert.rejects(notificationTransport(env,fetcher).send(message),{message:'Delivery not confirmed'});
 }
});
test('verification retries use the snapshotted sender even after configuration changes',async()=>{
 let body;
 const transport=notificationTransport(env,async(_url,options)=>{body=JSON.parse(options.body);return Response.json({id:'receipt'});});
 await transport.send({...message,from:'original@example.invalid'});
 assert.equal(body.from,'original@example.invalid');
 await assert.rejects(transport.send({...message,from:'invalid'}),{message:'Delivery not confirmed'});
});
