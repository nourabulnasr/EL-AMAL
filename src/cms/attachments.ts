import type {CollectionConfig} from 'payload';
import {hasRole} from '../lib/access.ts';
export const EnquiryAttachments:CollectionConfig={
  slug:'enquiry-attachments',labels:{singular:'Enquiry photo',plural:'Enquiry photos'},
  admin:{useAsTitle:'filename',defaultColumns:['filename','enquiry','byteCount','expiresAt','download'],description:'Private reconstructed JPEG/PNG photos supplied after email confirmation. Files expire after 30 days. Only owner and sales can download.'},
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
