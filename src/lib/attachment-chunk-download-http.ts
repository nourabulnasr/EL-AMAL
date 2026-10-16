import {readInput} from './enquiry-http.ts';
import {quotationChunkSize,quotationFileLimit} from './quotation-upload-limits.ts';
type File={bytes:Buffer|null;contentType:string;unscanned:boolean;byteCount:number;sha256:string;filename:string};
type Deps={enabled:()=>boolean;read:(id:number,headers:Headers,acknowledged:boolean,metadataOnly:boolean,index:number)=>Promise<File|null>};
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'none'; sandbox"};
const denied=()=>new Response('Not found',{status:404,headers});
export function attachmentChunkDownloadHandler(deps:Deps){return async(request:Request,id:string)=>{
 if(!deps.enabled()||request.method!=='POST'||!/^[1-9]\d{0,9}$/.test(id)||request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('content-type')!=='application/json')return denied();
 try{
  const body=await readInput(request,512);
  if(body?.action!=='manifest'&&body?.action!=='part')return denied();
  const metadata=body.action==='manifest';
  if(!metadata&&(!Number.isSafeInteger(body.index)||body.index<0||body.index>=quotationFileLimit/quotationChunkSize))return denied();
  const file=await deps.read(Number(id),request.headers,body.acknowledge===true,metadata,metadata?0:body.index);
  if(!file||!Number.isSafeInteger(file.byteCount)||file.byteCount<1||file.byteCount>quotationFileLimit)return denied();
  if(metadata)return Response.json({filename:file.filename,bytes:file.byteCount,contentType:file.contentType,sha256:file.sha256,parts:Math.ceil(file.byteCount/quotationChunkSize),chunkSize:quotationChunkSize,unscanned:file.unscanned},{headers});
  if(file.unscanned&&body.acknowledge!==true||!file.bytes)return denied();
  const start=body.index*quotationChunkSize;if(start>=file.byteCount)return denied();
  if(file.bytes.length!==Math.min(quotationChunkSize,file.byteCount-start))return denied();
  return new Response(new Uint8Array(file.bytes),{headers:{...headers,'Content-Type':'application/octet-stream'}});
 }catch{return denied();}
};}
