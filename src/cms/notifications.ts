import type {CollectionConfig} from 'payload';
import {hasRole} from '../lib/access.ts';
export const Notifications:CollectionConfig={
 slug:'notifications',labels:{singular:'Notification',plural:'Notification queue'},
 admin:{useAsTitle:'reference',defaultColumns:['reference','status','attempts','nextAttemptAt'],description:'Sample requests never send. Delivery requires explicit sender activation. Sent means provider accepted, not confirmed inbox delivery. Failed records require review; do not reset attempts or change their creation date.'},
 access:{create:()=>false,read:({req})=>hasRole(req.user,['owner','sales']),update:()=>false,delete:()=>false},
 fields:[
  {name:'reference',type:'text',required:true},
  {name:'enquiry',type:'relationship',relationTo:'enquiries',required:true,unique:true},
  {name:'deliveryKey',type:'text',required:true,unique:true,admin:{hidden:true}},
  {name:'recipient',type:'email',required:true},
  {name:'source',type:'select',required:true,options:['demo','cms']},
  {name:'status',type:'select',required:true,options:['disabled','pending','processing','sent','failed'],index:true},
  {name:'attempts',type:'number',required:true,defaultValue:0,min:0,max:5},
  {name:'nextAttemptAt',type:'date',index:true},
  {name:'leaseToken',type:'text',admin:{hidden:true}},
  {name:'leaseExpiresAt',type:'date'},
  {name:'sentAt',type:'date'},
  {name:'providerMessageId',type:'text'},
  {name:'lastError',type:'text'},
 ],
};
