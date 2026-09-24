import type {Access,CollectionConfig,Field} from 'payload';
import {safeDatasheetUrl} from '../lib/public-catalogue.ts';
import {instrumentTypes,applications} from '../content/product-options.ts';
import {hasRole,canPublish} from '../lib/access.ts';
const owner:Access=({req})=>hasRole(req.user,['owner']);
const catalogue:Access=({req})=>hasRole(req.user,['owner','catalogue-editor']);
const staff:Access=({req})=>hasRole(req.user,['owner','catalogue-editor','sales','warehouse']);
const bilingual=(name:string,type:'text'|'textarea'='text'):Field=>({
 name,type:'group',fields:['en','ar'].map(language=>{
   const common={name:language,label:language==='en'?'English':'Arabic',required:true};
   return type==='textarea'?{...common,type:'textarea' as const}:{...common,type:'text' as const};
 }),
});
export const Staff:CollectionConfig={
 slug:'staff',auth:{maxLoginAttempts:5,lockTime:600000},admin:{useAsTitle:'email'},
 endpoints:[{path:'/first-register',method:'post',handler:async()=>Response.json({error:'Owner setup requires a trusted local operation.'},{status:403})}],
 access:{create:owner,read:({req})=>hasRole(req.user,['owner'])?true:req.user?{id:{equals:req.user.id}}:false,update:owner,delete:()=>false,admin:({req})=>hasRole(req.user,['owner','catalogue-editor','sales','warehouse'])},
 fields:[{name:'role',type:'select',required:true,defaultValue:'catalogue-editor',options:['owner','catalogue-editor','sales','warehouse'],access:{create:({req})=>hasRole(req.user,['owner']),update:({req})=>hasRole(req.user,['owner'])}}],
};
export const Categories:CollectionConfig={
 slug:'categories',admin:{useAsTitle:'key'},access:{create:catalogue,read:staff,update:catalogue,delete:()=>false},
 fields:[{name:'key',type:'text',required:true,unique:true},bilingual('name'),bilingual('description','textarea')],
};
export const Products:CollectionConfig={
 slug:'products',admin:{useAsTitle:'model'},versions:{drafts:true},
 access:{create:catalogue,read:({req})=>hasRole(req.user,['owner','catalogue-editor','sales','warehouse'])?true:{_status:{equals:'published'}},update:catalogue,delete:()=>false},
 hooks:{beforeChange:[({data,originalDoc,req})=>{
   const merged={...originalDoc,...data};
   if(merged._status==='published'){
     if(!hasRole(req.user,['owner']))throw new Error('Only the owner can publish reviewed products.');
     if(!canPublish(merged))throw new Error('Publication requires reviewed English and Arabic content, source evidence and asset rights.');
   }
   return data;
 }]},
 fields:[{name:'externalId',type:'text',required:true,unique:true},{name:'model',type:'text',required:true,index:true},{name:'category',type:'relationship',relationTo:'categories',required:true},bilingual('name'),bilingual('description','textarea'),{name:'instrumentType',type:'select',options:instrumentTypes.map(x=>({label:x.en,value:x.id}))},{name:'applications',type:'select',hasMany:true,options:applications.map(x=>({label:x.en,value:x.id})),admin:{description:'Choose only applications supported by reviewed manufacturer information.'}},{name:'datasheetUrl',type:'text',validate:(value:unknown)=>!value||!!safeDatasheetUrl(value)||'Enter an HTTPS manufacturer datasheet URL.',admin:{description:'Link to the actual model datasheet. Verify the document and reuse rights before publishing.'}},{name:'sourceRef',type:'text',required:true,access:{read:({req})=>!!req.user}},{name:'reviewedBy',type:'relationship',relationTo:'staff',access:{read:({req})=>hasRole(req.user,['owner','catalogue-editor']),create:({req})=>hasRole(req.user,['owner']),update:({req})=>hasRole(req.user,['owner'])}},{name:'reviewedAt',type:'date',access:{create:({req})=>hasRole(req.user,['owner']),update:({req})=>hasRole(req.user,['owner'])}},{name:'rightsConfirmed',type:'checkbox',defaultValue:false,access:{create:({req})=>hasRole(req.user,['owner']),update:({req})=>hasRole(req.user,['owner'])}}],
};
export const SKUs:CollectionConfig={
 slug:'skus',admin:{useAsTitle:'skuCode'},access:{create:owner,read:staff,update:owner,delete:()=>false},
 fields:[{name:'skuCode',type:'text',required:true,unique:true},{name:'product',type:'relationship',relationTo:'products',required:true},{name:'manufacturerPartNumber',type:'text'},{name:'configuration',type:'json',required:true},{name:'active',type:'checkbox',defaultValue:true}],
};
// Quantity fields are intentionally absent. A transactional inventory service owns future stock writes.

