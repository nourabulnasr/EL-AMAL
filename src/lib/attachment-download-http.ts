type FileResult={bytes:Buffer|null;contentType:string;unscanned:boolean}|null;
type Deps={enabled:()=>boolean;read:(id:number,headers:Headers,allowUnscanned:boolean)=>Promise<FileResult>};
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'};
const denied=()=>new Response('Not found',{status:404,headers});
export function attachmentDownloadHandler(deps:Deps){return async(request:Request,id:string)=>{
  if(!deps.enabled()||!/^[1-9]\d{0,9}$/.test(id))return denied();
  let acknowledged=false;
  if(request.method==='POST'){
    if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('content-type')!=='application/x-www-form-urlencoded')return denied();
    const reader=request.body?.getReader();if(!reader)return denied();
    const chunks:Uint8Array[]=[];let length=0;
    try{while(true){const item=await reader.read();if(item.done)break;length+=item.value.length;if(length>128){await reader.cancel();return denied();}chunks.push(item.value);}}finally{reader.releaseLock();}
    acknowledged=Buffer.concat(chunks).toString()==='acknowledge=unscanned';
    if(!acknowledged)return denied();
  }else if(request.method!=='GET')return denied();
  try{
    const file=await deps.read(Number(id),request.headers,acknowledged);if(!file)return denied();
    if(file.unscanned&&!acknowledged){
      return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Review unscanned document</title><main><h1>This document has not been virus scanned</h1><p>A customer supplied this PDF or Excel file. File-type checks do not establish that it is safe. Scan it with your organisation's security software before opening. Keep macros, external content and links disabled. This website does not preview or execute the document.</p><form method="post"><button name="acknowledge" value="unscanned">I understand — download for scanning</button></form><p>Only owner and sales staff can access this file. The download does not send it to any external scanner.</p></main></html>`,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
    }
    if(!file.bytes)return denied();
    const extension=({'image/png':'png','image/jpeg':'jpg','application/pdf':'pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx'} as Record<string,string>)[file.contentType];
    if(!extension)return denied();
    return new Response(new Uint8Array(file.bytes),{headers:{...headers,'Content-Type':file.unscanned?'application/octet-stream':file.contentType,'Content-Disposition':`attachment; filename="enquiry-file.${extension}"`,'Content-Security-Policy':"default-src 'none'; sandbox"}});
  }catch{return denied();}
};}
