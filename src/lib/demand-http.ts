import {canReadDemand,parseDemandQuery,demandCsv,DemandError,type DemandActor,type DemandQuery,type DemandReport} from './demand-report.ts';
type Dependencies={enabled:()=>boolean;authenticate:(headers:Headers)=>Promise<unknown>;read:(actor:DemandActor,filters:DemandQuery)=>Promise<DemandReport>;now?:()=>Date};
const privateHeaders={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:privateHeaders});
export function demandReportHandler(deps:Dependencies){
  return async(request:Request)=>{
    if(!deps.enabled())return json({error:'Demand reporting is unavailable.'},503);
    try{
      const actor=await deps.authenticate(request.headers);
      if(!canReadDemand(actor))return json({error:'Sign in with an owner or sales account to view demand.'},403);
      const filters=parseDemandQuery(new URL(request.url).searchParams,deps.now?.());
      const report=await deps.read(actor,filters);
      if(filters.format==='csv')return new Response(demandCsv(report),{headers:{...privateHeaders,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="el-amal-demand-${filters.start}-to-${filters.end}.csv"`}});
      return json(report);
    }catch(error){
      return error instanceof DemandError?json({error:error.message},error.status):json({error:'Demand reporting is temporarily unavailable. Try again or choose a shorter date range.'},503);
    }
  };
}
