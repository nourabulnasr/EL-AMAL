import {randomUUID} from 'node:crypto';
import type {Payload} from 'payload';
import type {Catalogue} from './public-catalogue.ts';
import {parseEnquiry,enquiryFingerprint,snapshotItems,EnquiryConflictError} from './enquiries.ts';

// Trusted server service only. Never accept product descriptions or status from a caller.
export async function submitEnquiry(payload:Payload,raw:unknown,catalogue:Catalogue) {
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
  const items=snapshotItems(input.lines,catalogue.products);
  try {
    const record=await payload.create({collection:'enquiries',overrideAccess:true,depth:0,data:{
      reference:`EA-${randomUUID()}`,requestKey:input.requestKey,fingerprint,locale:input.locale,source:catalogue.source,
      ...input.contact,items,status:'new',verificationStatus:'unverified',deliveryStatus:'not-configured',
    }});
    return {reference:record.reference,repeated:false};
  }catch(error){
    // The unique database constraint also covers simultaneous identical requests.
    const raced=await existing();
    if(raced)return raced;
    throw error;
  }
}
