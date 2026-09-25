import type {CollectionConfig} from 'payload';
import {hasRole} from '../lib/access.ts';
export const VerificationEmails:CollectionConfig={
 slug:'verification-emails',labels:{singular:'Verification email',plural:'Verification email queue'},
 admin:{useAsTitle:'reference',defaultColumns:['reference','status','attempts','expiresAt'],description:'Customer confirmation delivery. Sample enquiries never send. Sent means provider acceptance, not confirmed inbox delivery. Message contents are encrypted and excluded from staff API access.'},
 access:{create:()=>false,read:({req})=>hasRole(req.user,['owner','sales']),update:()=>false,delete:()=>false},
 fields:[
  {name:'reference',type:'text',required:true},
  {name:'enquiry',type:'relationship',relationTo:'enquiries',required:true,unique:true},
  {name:'deliveryKey',type:'text',required:true,unique:true,admin:{hidden:true},access:{read:()=>false}},
  {name:'sealedMessage',type:'textarea',admin:{hidden:true},access:{read:()=>false}},
  {name:'status',type:'select',required:true,options:['pending','processing','sent','failed','cancelled'],index:true},
  {name:'attempts',type:'number',required:true,defaultValue:0,min:0,max:5},
  {name:'nextAttemptAt',type:'date',index:true},
  {name:'leaseToken',type:'text',admin:{hidden:true},access:{read:()=>false}},
  {name:'leaseExpiresAt',type:'date'},
  {name:'expiresAt',type:'date',required:true},
  {name:'sentAt',type:'date'},
  {name:'providerMessageId',type:'text'},
  {name:'lastError',type:'text'},
  {name:'issueCount',type:'number',required:true,min:1,max:3},
  {name:'issuanceWindowEndsAt',type:'date',required:true},
  {name:'lastIssuedAt',type:'date',required:true},
 ],
};
