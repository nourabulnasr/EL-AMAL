import type {CollectionConfig} from 'payload';
const privateAccess={create:()=>false,read:()=>false,update:()=>false,delete:()=>false};
export const EnquiryVerifications:CollectionConfig={slug:'enquiry-verifications',admin:{hidden:true},access:privateAccess,fields:[
 {name:'enquiry',type:'relationship',relationTo:'enquiries',required:true,unique:true},
 {name:'tokenHash',type:'text',required:true,unique:true},
 {name:'expiresAt',type:'date',required:true},
 {name:'consumedAt',type:'date'},
]};
export const RequestLimits:CollectionConfig={slug:'request-limits',admin:{hidden:true},access:privateAccess,fields:[
 {name:'key',type:'text',required:true,unique:true},
 {name:'hits',type:'number',required:true},
 {name:'windowEndsAt',type:'date',required:true,index:true},
]};
