import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {getPayload} from 'payload';
import config from '../src/payload.config.ts';
import {submitEnquiry} from '../src/lib/submit-enquiry.ts';
import {deliverNextNotification} from '../src/lib/notification-worker.ts';
import type {Catalogue} from '../src/lib/public-catalogue.ts';
if(process.env.CMS_DATABASE_CHECK!=='development')throw new Error('Development database only');
const payload=await getPayload({config});
const keys=[randomUUID(),randomUUID(),randomUUID()];
const catalogue:Catalogue={source:'demo',categories:[],products:[{id:'test',model:'TEST',category:'test',name:{en:'Test',ar:'اختبار'},description:{en:'',ar:''}}]};
const input={locale:'en',contact:{name:'Test',email:'test@example.invalid',company:'Test',notes:''},lines:[{productId:'test',quantity:1}]};
const originalRecipient=process.env.ENQUIRY_NOTIFICATION_TO;
try{
 // This worker test must not claim unrelated development work.
 const pending=await payload.db.pool.query("select count(*) from notifications where source='cms' and status in ('pending','processing')");
 assert.equal(Number(pending.rows[0].count),0,'Development queue must be idle before this test');
 process.env.ENQUIRY_NOTIFICATION_TO='notification-test@example.invalid';
 const demo=await submitEnquiry(payload,{...input,requestKey:keys[0]},catalogue);
 assert.deepEqual(await deliverNextNotification(payload),{outcome:'disabled'});
 let sends=0;
 assert.deepEqual(await deliverNextNotification(payload,{send:async()=>{sends++;return{id:'test'};}}),{outcome:'empty'});
 assert.equal(sends,0,'Demo notifications are never delivered');
 process.env.ENQUIRY_NOTIFICATION_TO='invalid-address';
 await assert.rejects(submitEnquiry(payload,{...input,requestKey:keys[2]},catalogue));
 const rolledBack=await payload.find({collection:'enquiries',overrideAccess:true,where:{requestKey:{equals:keys[2]}}});
 assert.equal(rolledBack.totalDocs,0,'Queue failure rolls back the enquiry too');
 process.env.ENQUIRY_NOTIFICATION_TO='notification-test@example.invalid';
 const real=await submitEnquiry(payload,{...input,requestKey:keys[1]},{...catalogue,source:'cms'});
 await submitEnquiry(payload,{...input,requestKey:keys[1]},{...catalogue,source:'cms'});
 const queue=await payload.find({collection:'notifications',overrideAccess:true,where:{reference:{equals:real.reference}}});
 assert.equal(queue.totalDocs,1,'Retry does not create another notification');const id=queue.docs[0].id;
 const failed=await deliverNextNotification(payload,{send:async()=>{throw new Error('Provider secret must not be retained');}});
 assert.equal(failed.outcome,'retry');
 let row=(await payload.findByID({collection:'notifications',id,overrideAccess:true}));
 assert.equal(row.attempts,1);assert.equal(row.status,'pending');assert.equal(row.lastError,'Delivery failed; details withheld');
 assert.deepEqual(await deliverNextNotification(payload,{send:async()=>{throw new Error('Not due');}}),{outcome:'empty'});
 await payload.db.pool.query("update notifications set next_attempt_at=now()-interval '1 second' where id=$1",[id]);
 const deliveredKeys:string[]=[];
 const fake={send:async(message:{idempotencyKey:string})=>{deliveredKeys.push(message.idempotencyKey);return{id:'fake-provider-receipt'};}};
 const concurrent=await Promise.all([deliverNextNotification(payload,fake),deliverNextNotification(payload,fake)]);
 assert.equal(concurrent.filter(result=>result.outcome==='sent').length,1);assert.equal(deliveredKeys.length,1);
 row=await payload.findByID({collection:'notifications',id,overrideAccess:true});assert.equal(row.status,'sent');
 assert.equal(deliveredKeys[0],row.deliveryKey);
 // A late worker cannot overwrite a lease subsequently owned by another worker.
 await payload.db.pool.query("update notifications set status='pending',attempts=0,next_attempt_at=now()-interval '1 second' where id=$1",[id]);
 const stale=await deliverNextNotification(payload,{send:async()=>{
   await payload.db.pool.query('update notifications set lease_token=$1 where id=$2',[randomUUID(),id]);
   return {id:'late-receipt'};
 }});
 assert.equal(stale.outcome,'stale');
 assert.equal((await payload.findByID({collection:'notifications',id,overrideAccess:true})).status,'processing');
 // Simulate an abandoned final attempt: recovery must stop, not send a sixth time.
 await payload.db.pool.query("update notifications set status='processing',attempts=5,lease_expires_at=now()-interval '1 second' where id=$1",[id]);
 await deliverNextNotification(payload,fake);
 assert.equal((await payload.findByID({collection:'notifications',id,overrideAccess:true})).status,'failed');
 assert.equal(deliveredKeys.length,1);
 const disabled=await payload.find({collection:'notifications',overrideAccess:true,where:{reference:{equals:demo.reference}}});
 assert.equal(disabled.docs[0].status,'disabled');
 await assert.rejects(payload.find({collection:'notifications',overrideAccess:false}));
 console.log('Notification checks succeeded: atomic rollback, demo suppression, unique enqueue, delayed retry, concurrent claim and retry limit. Fake sender only; no external messages.');
}finally{
 if(originalRecipient===undefined)delete process.env.ENQUIRY_NOTIFICATION_TO;else process.env.ENQUIRY_NOTIFICATION_TO=originalRecipient;
 const records=await payload.find({collection:'enquiries',overrideAccess:true,where:{requestKey:{in:keys}},limit:100,depth:0});
 if(records.docs.length)await payload.delete({collection:'notifications',overrideAccess:true,where:{enquiry:{in:records.docs.map(doc=>doc.id)}}});
 await payload.delete({collection:'enquiries',overrideAccess:true,where:{requestKey:{in:keys}}});
 assert.equal(Object.keys(payload.db.sessions??{}).length,0);await payload.destroy();
}
console.log('Temporary notification and enquiry records removed.');process.exit(0);
