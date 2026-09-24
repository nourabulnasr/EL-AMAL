import {createHash} from 'node:crypto';
import type {Product,Locale} from './catalogue.ts';
import {validateEnquiry,type EnquiryDetails} from './enquiry-preview.ts';
import {readBasket,type BasketLine} from './basket.ts';

export class EnquiryInputError extends Error {}
export class EnquiryConflictError extends Error {}
export type EnquiryInput={requestKey:string;locale:Locale;contact:EnquiryDetails;lines:BasketLine[];manual?:{model:string;quantity:number;range:string}};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
export function parseEnquiry(value:unknown):EnquiryInput {
  if(!object(value)||!object(value.contact)||!['en','ar'].includes(String(value.locale))||
    typeof value.requestKey!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestKey)) throw new EnquiryInputError('Invalid enquiry');
  const contact={} as EnquiryDetails;
  for(const key of ['name','email','company','notes'] as const){
    if(typeof value.contact[key]!=='string')throw new EnquiryInputError('Invalid contact details');
    contact[key]=value.contact[key].trim();
  }
  if(Object.keys(validateEnquiry(contact)).length)throw new EnquiryInputError('Invalid contact details');
  let manual:EnquiryInput['manual'];
  if(value.manual!==undefined){
    const m=value.manual;
    if(!object(m)||typeof m.model!=='string'||!m.model.trim()||m.model.length>120||typeof m.range!=='string'||!m.range.trim()||m.range.length>160||!Number.isInteger(m.quantity)||Number(m.quantity)<1||Number(m.quantity)>9999)throw new EnquiryInputError('Enter a model, quantity and range');
    if(!Array.isArray(value.lines)||value.lines.length)throw new EnquiryInputError('Use either catalogue items or a direct model request');
    manual={model:m.model.trim(),quantity:Number(m.quantity),range:m.range.trim()};
  }
  const lines=readBasket(JSON.stringify(value.lines));
  if(!lines.length&&!manual)throw new EnquiryInputError('Choose at least one valid product');
  lines.sort((a,b)=>a.productId.localeCompare(b.productId,'en'));
  return {requestKey:value.requestKey.toLowerCase(),locale:value.locale as Locale,contact,lines,...manual?{manual}:{}};
}
export function enquiryFingerprint(input:EnquiryInput,source:'demo'|'cms') {
  return createHash('sha256').update(JSON.stringify({source,locale:input.locale,contact:input.contact,lines:input.lines,...input.manual?{manual:input.manual}:{}})).digest('hex');
}
export function snapshotItems(lines:BasketLine[],products:Product[]) {
  const byId=new Map(products.map(product=>[product.id,product]));
  return lines.map(line=>{
    const product=byId.get(line.productId);
    if(!product)throw new EnquiryInputError('A requested product is no longer available');
    return {productId:product.id,model:product.model,nameEn:product.name.en,nameAr:product.name.ar,quantity:line.quantity};
  });
}
