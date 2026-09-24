import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {getPayload} from 'payload';
import config from '../src/payload.config.ts';
import {submitEnquiry} from '../src/lib/submit-enquiry.ts';
import {EnquiryConflictError} from '../src/lib/enquiries.ts';
import type {Catalogue} from '../src/lib/public-catalogue.ts';
if(process.env.CMS_DATABASE_CHECK!=='development')throw new Error('Development database only');
const payload=await getPayload({config});
const requestKeys=[randomUUID(),randomUUID(),randomUUID()];
const staffIds:number[]=[];
const catalogue:Catalogue={source:'demo',categories:[],products:[{id:'test-1',model:'TEST-MODEL',category:'test',name:{en:'Test instrument',ar:'جهاز اختبار'},description:{en:'Test',ar:'اختبار'}}]};
const input={requestKey:requestKeys[0],locale:'en',contact:{name:'Test engineer',email:'enquiry-test@example.invalid',company:'Test only',notes:'Temporary verification'},lines:[{productId:'test-1',quantity:2}]};
const forbidden=(error:unknown)=>error instanceof Error&&'status' in error&&error.status===403;
try {
  const first=await submitEnquiry(payload,input,catalogue);
  const repeated=await submitEnquiry(payload,input,catalogue);
  assert.equal(first.reference,repeated.reference);assert.equal(repeated.repeated,true);
  await assert.rejects(submitEnquiry(payload,{...input,contact:{...input.contact,company:'Changed'}},catalogue),EnquiryConflictError);
  const concurrent=await Promise.all([submitEnquiry(payload,{...input,requestKey:requestKeys[1]},catalogue),submitEnquiry(payload,{...input,requestKey:requestKeys[1]},catalogue)]);
  assert.equal(concurrent[0].reference,concurrent[1].reference);
  const records=await payload.find({collection:'enquiries',overrideAccess:true,where:{requestKey:{in:requestKeys}},depth:0});
  assert.equal(records.totalDocs,2,'Concurrent retries create exactly one record per key');
  const record=records.docs.find(doc=>doc.reference===first.reference)!;
  assert.equal(record.items[0].model,'TEST-MODEL');assert.equal(record.deliveryStatus,'not-configured');
  // A later catalogue change cannot rewrite saved item snapshots or break a retry.
  assert.equal((await submitEnquiry(payload,input,{...catalogue,products:[]})).reference,first.reference);
  await assert.rejects(payload.find({collection:'enquiries',overrideAccess:false}),forbidden);
  for(const role of ['owner','sales','catalogue-editor','warehouse'] as const){
    const member=await payload.create({collection:'staff',overrideAccess:true,data:{email:`rfq-${role}-${requestKeys[0]}@example.invalid`,password:randomBytes(32).toString('hex'),role}});
    staffIds.push(member.id);
    const user={...member,collection:'staff' as const};
    if(role==='owner'||role==='sales'){
      const visible=await payload.findByID({collection:'enquiries',id:record.id,overrideAccess:false,user});
      assert.equal(visible.reference,first.reference);
      await payload.update({collection:'enquiries',id:record.id,overrideAccess:false,user,data:{status:'reviewing',internalNotes:'Checked in test'}});
      // Payload strips fields blocked by field access; verify the stored original remains intact.
      await payload.update({collection:'enquiries',id:record.id,overrideAccess:false,user,data:{company:'Tampered'}});
      const unchanged=await payload.findByID({collection:'enquiries',id:record.id,overrideAccess:true});
      assert.equal(unchanged.company,'Test only');assert.equal(unchanged.status,'reviewing');
    }else{
      await assert.rejects(payload.find({collection:'enquiries',overrideAccess:false,user}),forbidden);
      await assert.rejects(payload.update({collection:'enquiries',id:record.id,overrideAccess:false,user,data:{status:'closed'}}),forbidden);
    }
    await assert.rejects(payload.create({collection:'enquiries',overrideAccess:false,user,data:{...record,id:undefined}}),forbidden);
    await assert.rejects(payload.delete({collection:'enquiries',id:record.id,overrideAccess:false,user}),forbidden);
  }
  await assert.rejects(payload.update({collection:'enquiries',id:record.id,overrideAccess:true,data:{company:'Trusted tampering'}}),/immutable/);
  const direct={...input,requestKey:requestKeys[2],lines:[],manual:{model:'CUSTOM-42',quantity:4,range:'0–10 bar'}};
  const saved=await submitEnquiry(payload,direct,{...catalogue,products:[]});
  assert.equal((await submitEnquiry(payload,direct,{...catalogue,products:[]})).reference,saved.reference);
  const directRecord=(await payload.find({collection:'enquiries',overrideAccess:true,where:{reference:{equals:saved.reference}}})).docs[0];
  assert.equal(directRecord.items[0].range,'0–10 bar');assert.equal(directRecord.items[0].model,'CUSTOM-42');assert.equal(directRecord.items[0].quantity,4);
  await assert.rejects(submitEnquiry(payload,{...direct,manual:{...direct.manual,range:'0–16 bar'}},catalogue),EnquiryConflictError);
  console.log('Direct RFQ checks succeeded: model/range persistence, duplicate retry and changed-range conflict.');
  console.log('Enquiry checks succeeded: durable snapshots, repeat/conflict/concurrent requests, owner/sales workflow, private reads and immutable contact details.');
}finally{
  const records=await payload.find({collection:'enquiries',overrideAccess:true,where:{requestKey:{in:requestKeys}},depth:0,limit:100});
  if(records.docs.length)await payload.delete({collection:'notifications',overrideAccess:true,where:{enquiry:{in:records.docs.map(doc=>doc.id)}}});
  await payload.delete({collection:'enquiries',overrideAccess:true,where:{requestKey:{in:requestKeys}}});
  for(const id of staffIds.reverse())await payload.delete({collection:'staff',id,overrideAccess:true});
  assert.equal(Object.keys(payload.db.sessions??{}).length,0);
  await payload.destroy();
}
console.log('Temporary enquiry/staff records removed.');
process.exit(0);
