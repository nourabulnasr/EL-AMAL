import {randomUUID} from 'node:crypto';
import type {Payload} from 'payload';
import type {Catalogue} from './public-catalogue.ts';
import {parseEnquiry,enquiryFingerprint,snapshotItems,EnquiryConflictError} from './enquiries.ts';
import {enqueueInitialVerification} from './verification-outbox.ts';
import type {VerificationSettings} from './verification-message.ts';

// Trusted server service only. Never accept product descriptions or status from a caller.
export async function submitEnquiry(payload:Payload,raw:unknown,catalogue:Catalogue,verification?:VerificationSettings) {
  const input=parseEnquiry(raw);
  const fingerprint=enquiryFingerprint(input,catalogue.source);
  const existing=async()=>{
    const result=await payload.find({collection:'enquiries',overrideAccess:true,depth:0,limit:1,where:{requestKey:{equals:input.requestKey}}});
    const record=result.docs[0];
    if(!record)return null;
    if(record.fingerprint!==fingerprint)throw new EnquiryConflictError('This request key was already used for different details');
    return {reference:record.reference,repeated:true};
  };
  const previous=await existing();
  if(previous)return previous;
  const items=input.manual?[{productId:'customer-specified',model:input.manual.model,quantity:input.manual.quantity,range:input.manual.range,nameEn:'Customer-specified model — technical review required',nameAr:'طراز حدده العميل — يتطلب مراجعة فنية'}]:snapshotItems(input.lines,catalogue.products);
  const transactionID=await payload.db.beginTransaction();
  if(transactionID===null)throw new Error('Enquiry persistence requires transactions');
  const req={transactionID};
  try {
    const record=await payload.create({collection:'enquiries',overrideAccess:true,depth:0,req,data:{
      reference:`EA-${randomUUID()}`,requestKey:input.requestKey,fingerprint,locale:input.locale,source:catalogue.source,
      ...input.contact,items,status:'new',verificationStatus:'unverified',deliveryStatus:'not-configured',
    }});
    await payload.create({collection:'notifications',overrideAccess:true,depth:0,req,data:{
      enquiry:record.id,reference:record.reference,deliveryKey:`enquiry-${record.reference}`,
      recipient:process.env.ENQUIRY_NOTIFICATION_TO||'mohamed.sorour8@icloud.com',source:catalogue.source,
      status:catalogue.source==='demo'?'disabled':'pending',attempts:0,nextAttemptAt:new Date().toISOString(),
    }});
    if(verification)await enqueueInitialVerification(payload,record,verification,req);
    await payload.db.commitTransaction(transactionID);
    return {reference:record.reference,repeated:false};
  }catch(error){
    await payload.db.rollbackTransaction(transactionID);
    // The unique database constraint also covers simultaneous identical requests.
    const raced=await existing();
    if(raced)return raced;
    throw error;
  }
}
