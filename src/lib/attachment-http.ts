import {attachmentLimit,readAttachmentGrant,spreadsheetType} from './enquiry-attachments.ts';
import {readInput} from './enquiry-http.ts';
type Deps={settings:()=>{origin:string;secret:string}|undefined;allow:(headers:Headers,reference:string)=>Promise<boolean>;save:(input:{reference:string;uploadId:string;filename:string;contentType:string;bytes:Buffer})=>Promise<unknown>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
export function attachmentHandler(deps:Deps,quotation=false){return async(request:Request)=>{
  const settings=deps.settings();if(!settings)return json({error:'Photo uploads unavailable'},503);
  if(request.headers.get('origin')!==settings.origin||new URL(request.url).origin!==settings.origin)return json({error:'Invalid origin'},403);
  const grant=request.headers.get('authorization')?.replace(/^Bearer /,''),reference=readAttachmentGrant(grant,settings.secret);
  if(!reference)return json({error:'Confirm your enquiry email first'},403);
  const contentType=request.headers.get('content-type')??'';
  if(!(quotation?['image/png','image/jpeg','application/pdf',spreadsheetType]:['image/png','image/jpeg']).includes(contentType))return json({error:quotation?'Use PDF, XLSX, JPEG or PNG':'Use a JPEG or PNG photo'},415);
  try{
    if(!await deps.allow(request.headers,reference))return json({error:'Try again later'},429);
    const reader=request.body?.getReader();if(!reader)return json({error:'Photo required'},400);
    const chunks:Uint8Array[]=[];let length=0;
    try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;
      if(length>attachmentLimit){await reader.cancel();return json({error:'Maximum photo size is 2 MB'},413);}chunks.push(part.value);
    }}finally{reader.releaseLock();}
    const filename=decodeURIComponent(request.headers.get(quotation?'x-file-name':'x-photo-name')??(quotation?'':'Technical photo'));
    if(filename.length>200)return json({error:'Photo filename is too long'},400);
    return json(await deps.save({reference,uploadId:request.headers.get('x-upload-id')??'',filename,contentType,bytes:Buffer.concat(chunks)}));
  }catch{return json({error:quotation?'Unable to save this file. Use a plain PDF, XLSX, JPEG or PNG up to 2 MB; maximum three files. Encrypted files, macros and external links are unsupported.':'Unable to save this photo. Use a valid JPEG/PNG up to 2 MB, with at most three photos per enquiry.'},400);}
};}

type ControlDeps=Pick<Deps,'settings'|'allow'>&{status:(reference:string)=>Promise<unknown>;finalize:(reference:string)=>Promise<unknown>};
export function quotationControlHandler(deps:ControlDeps){return async(request:Request)=>{
  const settings=deps.settings();if(!settings)return json({error:'Quotation uploads unavailable'},503);
  if(request.headers.get('origin')!==settings.origin||new URL(request.url).origin!==settings.origin)return json({error:'Invalid origin'},403);
  const reference=readAttachmentGrant(request.headers.get('authorization')?.replace(/^Bearer /,''),settings.secret);
  if(!reference)return json({error:'Confirm your enquiry email first'},403);
  if(request.headers.get('content-type')!=='application/json')return json({error:'JSON required'},415);
  try{
    if(!await deps.allow(request.headers,reference))return json({error:'Try again later'},429);
    const body=await readInput(request,1024);
    if(body?.action==='status')return json(await deps.status(reference));
    if(body?.action==='finalize')return json(await deps.finalize(reference));
    return json({error:'Invalid action'},400);
  }catch{return json({error:'Unable to complete this action. Keep this page open and retry.'},400);}
};}
