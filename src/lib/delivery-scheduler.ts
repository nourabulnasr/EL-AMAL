import {Inngest} from 'inngest';
import {serve} from 'inngest/next';
import type {NextRequest} from 'next/server';
import {cmsEnabled} from './cms-runtime.ts';

type DeliveryResult={outcome:string;processed?:number;accepted?:number;failures?:number};
type Run=()=>Promise<DeliveryResult>;
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};

/** Only aggregate delivery results belong in the external scheduler history. */
export async function runScheduledDelivery(run:Run):Promise<DeliveryResult>{
 try{
  const result=await run();
  if(!['complete','maintenance','overlap'].includes(result.outcome))throw new Error();
  return result.outcome==='overlap'?{outcome:'overlap'}:{
   outcome:result.outcome,processed:result.processed,accepted:result.accepted,failures:result.failures,
  };
 }catch{throw new Error('Delivery schedule unavailable');}
}

export function createDeliveryScheduler(env:Record<string,string|undefined>,run:Run){
 // Explicit cloud mode prevents unsigned requests even if INNGEST_DEV is set.
 const client=new Inngest({id:'el-amal-delivery',isDev:false,
  signingKey:env.INNGEST_SIGNING_KEY,eventKey:env.INNGEST_EVENT_KEY});
 const delivery=client.createFunction({id:'process-quotation-delivery',
  triggers:[{cron:'*/5 * * * *'}],concurrency:1,retries:2},()=>runScheduledDelivery(run));
 const handlers=serve({client,functions:[delivery],serveOrigin:env.SITE_URL});
 const wrap=(handler:typeof handlers.GET)=>async(request:NextRequest,context?:unknown)=>{
  if(env.VERCEL_ENV!=='production'||!cmsEnabled(env)||env.DELIVERY_OPERATIONS_ENABLED!=='true'||!env.INNGEST_SIGNING_KEY?.trim()){
   return Response.json({error:'Delivery schedule unavailable'},{status:503,headers});
  }
  const response=await handler(request,context);
  for(const [name,value] of Object.entries(headers))response.headers.set(name,value);
  return response;
 };
 return {GET:wrap(handlers.GET),POST:wrap(handlers.POST),PUT:wrap(handlers.PUT)};
}
