import {cmsEnabled} from '@/lib/cms-runtime';
import {canReadDemand,DemandError} from '@/lib/demand-report';
import {parseInterestQuery,interestCsv} from '@/lib/product-interest';
import {interestPayload,interestSettings} from '@/lib/product-interest-runtime';
import {readProductInterest} from '@/lib/product-interest-service';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
const privateHeaders={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
export async function GET(request:Request){
  try{
    if(!cmsEnabled())throw new DemandError('Product reporting is unavailable.',503);
    const payload=await interestPayload(),{user}=await payload.auth({headers:request.headers});
    if(!canReadDemand(user))throw new DemandError('Sign in with an owner or sales account.',403);
    const filters=parseInterestQuery(new URL(request.url).searchParams);
    const report=await readProductInterest(payload,user,filters,!!interestSettings());
    if(filters.format==='csv')return new Response(interestCsv(report),{headers:{...privateHeaders,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="el-amal-product-interest-${filters.start}-to-${filters.end}.csv"`}});
    return Response.json(report,{headers:privateHeaders});
  }catch(error){return Response.json({error:error instanceof DemandError?error.message:'Product reporting is temporarily unavailable.'},{status:error instanceof DemandError?error.status:503,headers:privateHeaders});}
}
