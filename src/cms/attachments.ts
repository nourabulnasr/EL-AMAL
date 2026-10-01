import type {CollectionConfig} from 'payload';
import {hasRole} from '../lib/access.ts';
export const EnquiryAttachments:CollectionConfig={
  slug:'enquiry-attachments',labels:{singular:'Enquiry attachment',plural:'Enquiry attachments'},
  admin:{useAsTitle:'filename',defaultColumns:['filename','enquiry','contentType','byteCount','expiresAt','download'],description:'Private files supplied after email confirmation, available for 30 days to owner and sales. Photos are reconstructed. PDF/XLSX files are unscanned; their download screen requires acknowledgment. Scan documents locally before opening; keep macros and external content disabled.'},
  access:{create:()=>false,read:({req})=>hasRole(req.user,['owner','sales']),update:()=>false,delete:()=>false},
  fields:[
    {name:'uploadId',type:'text',required:true,unique:true},
    {name:'enquiry',type:'relationship',relationTo:'enquiries',required:true,index:true},
    {name:'reference',type:'text',required:true},
    {name:'filename',type:'text',required:true},
    {name:'contentType',type:'text',required:true},
    {name:'byteCount',type:'number',required:true,min:1,max:2097152},
    {name:'contentHash',type:'text',required:true,admin:{hidden:true},access:{read:()=>false}},
    {name:'sealedData',type:'textarea',required:true,admin:{hidden:true},access:{read:()=>false}},
    {name:'expiresAt',type:'date',required:true,index:true},
    {name:'download',type:'ui',admin:{components:{Cell:'/src/components/admin/attachment-download#AttachmentDownload'}}},
  ],
};
