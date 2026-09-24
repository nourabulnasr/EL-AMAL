import type {Access,CollectionConfig,Field} from 'payload';
import {hasRole} from '../lib/access.ts';
const sales:Access=({req})=>hasRole(req.user,['owner','sales']);
const immutable={update:()=>false};
const fixed=(field:Field):Field=>({...field,access:immutable,admin:{...field.admin,readOnly:true}} as Field);
export const Enquiries:CollectionConfig={
  slug:'enquiries',
  admin:{useAsTitle:'reference',defaultColumns:['reference','company','status','source','createdAt'],description:'Saved requests. Email delivery and stock reservation are not active yet.'},
  access:{create:()=>false,read:sales,update:sales,delete:()=>false},
  hooks:{beforeChange:[({operation,data,originalDoc})=>{
    // Field access protects REST/admin; this also prevents trusted updates from rewriting history.
    if(operation==='update')for(const key of ['reference','requestKey','fingerprint','locale','source','name','email','company','notes','items','verificationStatus','deliveryStatus']){
      if(key in data&&JSON.stringify(data[key])!==JSON.stringify(originalDoc[key]))throw new Error('Submitted enquiry details are immutable.');
    }
    return data;
  }]},
  fields:[
    fixed({name:'reference',type:'text',required:true,unique:true}),
    fixed({name:'requestKey',type:'text',required:true,unique:true,admin:{hidden:true}}),
    fixed({name:'fingerprint',type:'text',required:true,admin:{hidden:true}}),
    fixed({name:'locale',type:'select',required:true,options:['en','ar']}),
    fixed({name:'source',type:'select',required:true,options:['demo','cms']}),
    fixed({name:'name',type:'text',required:true}),
    fixed({name:'email',type:'email',required:true}),
    fixed({name:'company',type:'text',required:true}),
    fixed({name:'notes',type:'textarea'}),
    fixed({name:'items',type:'array',required:true,minRows:1,maxRows:100,fields:[
      {name:'productId',type:'text',required:true},{name:'model',type:'text',required:true},
      {name:'nameEn',type:'text',required:true},{name:'nameAr',type:'text',required:true},
      {name:'quantity',type:'number',required:true,min:1,max:9999},{name:'range',type:'text',maxLength:160},
    ]}),
    fixed({name:'verificationStatus',type:'select',required:true,defaultValue:'unverified',options:['unverified']}),
    fixed({name:'deliveryStatus',type:'select',required:true,defaultValue:'not-configured',options:['not-configured']}),
    {name:'status',type:'select',required:true,defaultValue:'new',options:['new','reviewing','awaiting-customer','quoted','closed']},
    {name:'internalNotes',type:'textarea',maxLength:10000},
  ],
};
