import {createHash} from 'node:crypto';
import {readAttachmentGrant} from './enquiry-attachments.ts';
import {readInput} from './enquiry-http.ts';
import {quotationChunkSize} from './quotation-upload-limits.ts';
import {validateUploadMetadata,type UploadIdentity,type UploadMetadata} from './quotation-upload-service.ts';
type Deps={settings:()=>{origin:string;secret:string}|undefined;allow:(headers:Headers,reference:string)=>Promise<boolean>;begin:(input:UploadIdentity&UploadMetadata)=>Promise<unknown>;chunk:(input:UploadIdentity&{index:number;bytes:Buffer})=>Promise<unknown>;complete:(input:UploadIdentity)=>Promise<unknown>;cancel:(input:UploadIdentity)=>Promise<unknown>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
export function quotationChunkHandler(deps:Deps){return async(request:Request)=>{
 const settings=deps.settings();if(!settings)return json({error:'Quotation uploads unavailable'},503);
 if(request.headers.get('origin')!==settings.origin||new URL(request.url).origin!==settings.origin)return json({error:'Invalid origin'},403);
 const grant=request.headers.get('authorization')?.replace(/^Bearer /,''),reference=readAttachmentGrant(grant,settings.secret);
 if(!reference||!grant)return json({error:'Confirm your enquiry email first'},403);
 const grantHash=createHash('sha256').update(grant).digest('hex');
 try{
  if(!await deps.allow(request.headers,reference))return json({error:'Try again in a minute'},429);
  if(request.method==='PUT'){
   if(request.headers.get('content-type')!=='application/octet-stream')return json({error:'Binary chunk required'},415);
   const index=request.headers.get('x-chunk-index')??'',uploadId=request.headers.get('x-upload-id')??'';
   if(!/^[0-9]$/.test(index)||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(uploadId))return json({error:'Invalid chunk'},400);
   const reader=request.body?.getReader();if(!reader)return json({error:'Chunk required'},400);
   const chunks:Uint8Array[]=[];let length=0;
   try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>quotationChunkSize){await reader.cancel();return json({error:'Chunk exceeds 1 MiB'},413);}chunks.push(part.value);}}finally{reader.releaseLock();}
   if(!length)return json({error:'Chunk required'},400);
   return json(await deps.chunk({reference,grantHash,uploadId,index:Number(index),bytes:Buffer.concat(chunks)}));
  }
  if(request.method!=='POST')return json({error:'Unsupported method'},405);
  if(request.headers.get('content-type')!=='application/json')return json({error:'JSON required'},415);
  const body=await readInput(request,2048);
  if(body?.action==='begin')return json(await deps.begin({...validateUploadMetadata(body),reference,grantHash}));
  if(typeof body?.uploadId!=='string')return json({error:'Invalid upload'},400);
  const identity={reference,grantHash,uploadId:body.uploadId};
  if(body.action==='complete')return json(await deps.complete(identity));
  if(body.action==='cancel')return json(await deps.cancel(identity));
  return json({error:'Invalid action'},400);
 }catch{return json({error:'Could not save this file. Retry the same file, or discard it and choose a supported PDF, XLSX, JPEG or PNG up to 10 MiB.'},400);}
};}
