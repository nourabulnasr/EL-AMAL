import {timingSafeEqual} from 'node:crypto';

type WorkerResult={outcome:string};
type BatchDependencies={verification:()=>Promise<WorkerResult>;notification:()=>Promise<WorkerResult>;now?:()=>number;deadlineAt?:number};
export type BatchResult={outcome:'complete'|'degraded'|'disabled'|'maintenance';processed:number;accepted:number;failures:number};
export const DELIVERY_ITEM_LIMIT=8;
export const DELIVERY_START_BUDGET_MS=40000;

/** Start bounded work, leaving time for the transport's 15-second abort and persistence. */
export async function runDeliveryBatch(deps:BatchDependencies):Promise<BatchResult>{
 const now=deps.now??Date.now;
 const deadlineAt=deps.deadlineAt??now()+DELIVERY_START_BUDGET_MS;
 const result:BatchResult={outcome:'complete',processed:0,accepted:0,failures:0};
 const queues=[deps.verification,deps.notification];
 const empty=[false,false];
 const visited=[false,false];
 let turn=0;
 while(result.processed<DELIVERY_ITEM_LIMIT&&now()<deadlineAt&&!empty.every(Boolean)){
  const index=turn++%2;
  if(empty[index])continue;
  visited[index]=true;
  const item=await queues[index]();
  if(item.outcome==='disabled'){result.outcome='disabled';break;}
  if(item.outcome==='empty'){empty[index]=true;continue;}
  result.processed++;
  if(item.outcome==='sent')result.accepted++;
  else if(item.outcome!=='stale'){result.failures++;result.outcome='degraded';}
 }
 if(result.outcome==='complete'&&!visited.every(Boolean))result.outcome='degraded';
 return result;
}

export function isDeliveryHealthFresh(row:{lastOutcome?:unknown;lastSuccessAt?:unknown}|undefined,now=Date.now()){
 if(row?.lastOutcome!=='complete'||typeof row.lastSuccessAt!=='string')return false;
 const at=Date.parse(row.lastSuccessAt);
 return Number.isFinite(at)&&at<=now&&at>=now-15*60000;
}

/** New intake fails closed during an outage; existing request-key retries run first. */
export async function assertFreshDeliveryHealth(query:(statement:string)=>Promise<{rows:Record<string,unknown>[]}>,now?:number){
 const result=await query(`SELECT last_outcome AS "lastOutcome",last_success_at::text AS "lastSuccessAt"
  FROM delivery_operations WHERE key='delivery' LIMIT 1`);
 if(!isDeliveryHealthFresh(result.rows[0],now??Date.now()))throw new Error('Delivery is temporarily unavailable');
}

type Dependencies={secret:()=>string|undefined;enabled:()=>boolean;run:()=>Promise<{outcome:string}>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'}});
export function deliveryOperationsHandler(deps:Dependencies){
 return async(request:Request)=>{
  // Explicitly reject HEAD: Next otherwise auto-dispatches HEAD to an exported GET.
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
  const secret=deps.secret(),actual=Buffer.from(request.headers.get('authorization')??''),expected=Buffer.from(`Bearer ${secret??''}`);
  if(!secret||secret.length<32||actual.length!==expected.length||!timingSafeEqual(actual,expected))return json({error:'Unauthorized'},401);
  if(!deps.enabled())return json({outcome:'disabled'},503);
  try{
   const result=await deps.run();
   return json(result,['complete','maintenance','overlap'].includes(result.outcome)?200:503);
  }
  catch{return json({error:'Delivery operations unavailable'},503);}
 };
}
