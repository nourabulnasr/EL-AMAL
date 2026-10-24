/** This cron-only endpoint never receives customer files or enquiry contents. */
export const schedulerBodyLimit=64*1024;
export class SchedulerRequestError extends Error {
 readonly status:number;
 constructor(status:number){super('Invalid scheduler request');this.status=status;}
}
/** Bound bytes before the SDK parses JSON or validates its collection schemas.
 * Preserve the exact body, URL and headers for the SDK's signature verification.
 */
export async function boundedSchedulerRequest(request:Request):Promise<Request>{
 if(request.method==='GET'||request.method==='HEAD')return request;
 if(request.method==='POST'&&!request.headers.get('x-inngest-signature')?.trim())throw new SchedulerRequestError(401);
 const length=request.headers.get('content-length');
 if(length&&(!/^\d+$/.test(length)||Number(length)>schedulerBodyLimit))throw new SchedulerRequestError(413);
 const encoding=request.headers.get('content-encoding');
 if(encoding&&encoding.toLowerCase()!=='identity')throw new SchedulerRequestError(415);
 const reader=request.body?.getReader();
 if(!reader)return request;
 const chunks:Uint8Array[]=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;
   if(size>schedulerBodyLimit){await reader.cancel().catch(()=>{});throw new SchedulerRequestError(413);}
   chunks.push(value);
  }
 }finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;
 for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 return new Request(request.url,{method:request.method,headers:request.headers,body:bytes,signal:request.signal});
}
