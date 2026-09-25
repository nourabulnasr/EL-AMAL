import {hasRole} from './access.ts';
import {EnquiryInputError,EnquiryConflictError} from './enquiries.ts';
type Dependencies={enabled:()=>boolean;source:()=>string;authenticate:(headers:Headers)=>Promise<unknown>;submit:(input:unknown)=>Promise<{reference:string;repeated:boolean}>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const permitted=(user:unknown)=>!!user&&typeof user==='object'&&'collection' in user&&user.collection==='staff'&&hasRole(user,['owner','sales']);
export async function readInput(request:Request,maxBytes=32768){
  const reader=request.body?.getReader();if(!reader)throw new EnquiryInputError('Missing request');
  const chunks:Uint8Array[]=[];let size=0;
  try {while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;
    if(size>maxBytes){await reader.cancel();throw new EnquiryInputError('Request too large');}chunks.push(part.value);
  }}finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new EnquiryInputError('Invalid JSON');}
}
export function enquiryHandlers(deps:Dependencies){
  return {
    GET:async(request:Request)=>{
      try {return json({canSaveTest:deps.enabled()&&deps.source()==='demo'&&permitted(await deps.authenticate(request.headers))});}
      catch{return json({canSaveTest:false});}
    },
    POST:async(request:Request)=>{
      if(!deps.enabled()||deps.source()!=='demo')return json({error:'Test submissions unavailable'},503);
      if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Invalid origin'},403);
      if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return json({error:'JSON required'},415);
      try {
        if(!permitted(await deps.authenticate(request.headers)))return json({error:'Staff sign-in required'},403);
        const result=await deps.submit(await readInput(request));
        return json({...result,mode:'test',emailSent:false,stockReserved:false},result.repeated?200:201);
      }catch(error){
        if(error instanceof EnquiryInputError)return json({error:'Check the enquiry details and selected items'},400);
        if(error instanceof EnquiryConflictError)return json({error:'Request changed; review it again'},409);
        return json({error:'Unable to save now. Retry with the same details.'},503);
      }
    },
  };
}
