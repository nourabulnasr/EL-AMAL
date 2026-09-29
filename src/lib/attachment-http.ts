import {attachmentLimit,readAttachmentGrant} from './enquiry-attachments.ts';
type Deps={settings:()=>{origin:string;secret:string}|undefined;allow:(headers:Headers,reference:string)=>Promise<boolean>;save:(input:{reference:string;uploadId:string;filename:string;contentType:string;bytes:Buffer})=>Promise<unknown>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
export function attachmentHandler(deps:Deps){return async(request:Request)=>{
  const settings=deps.settings();if(!settings)return json({error:'Photo uploads unavailable'},503);
  if(request.headers.get('origin')!==settings.origin||new URL(request.url).origin!==settings.origin)return json({error:'Invalid origin'},403);
  const grant=request.headers.get('authorization')?.replace(/^Bearer /,''),reference=readAttachmentGrant(grant,settings.secret);
  if(!reference)return json({error:'Confirm your enquiry email first'},403);
  const contentType=request.headers.get('content-type')??'';
  if(!['image/png','image/jpeg'].includes(contentType))return json({error:'Use a JPEG or PNG photo'},415);
  try{
    if(!await deps.allow(request.headers,reference))return json({error:'Try again later'},429);
    const reader=request.body?.getReader();if(!reader)return json({error:'Photo required'},400);
    const chunks:Uint8Array[]=[];let length=0;
    try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;
      if(length>attachmentLimit){await reader.cancel();return json({error:'Maximum photo size is 2 MB'},413);}chunks.push(part.value);
    }}finally{reader.releaseLock();}
    const filename=decodeURIComponent(request.headers.get('x-photo-name')??'Technical photo');
    if(filename.length>200)return json({error:'Photo filename is too long'},400);
    return json(await deps.save({reference,uploadId:request.headers.get('x-upload-id')??'',filename,contentType,bytes:Buffer.concat(chunks)}));
  }catch{return json({error:'Unable to save this photo. Use a valid JPEG/PNG up to 2 MB, with at most three photos per enquiry.'},400);}
};}
