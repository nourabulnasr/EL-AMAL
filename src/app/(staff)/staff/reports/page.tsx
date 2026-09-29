import {headers} from 'next/headers';
import {cmsEnabled} from '@/lib/cms-runtime';
import {canReadDemand,parseDemandQuery,DemandError,type DemandReport} from '@/lib/demand-report';
import {DemandReportView} from '@/components/demand-report-view';
import './reports.css';
export const dynamic='force-dynamic';
export const metadata={title:'Demand report | EL AMAL',robots:{index:false,follow:false}};
type Search=Promise<Record<string,string|string[]|undefined>>;
export default async function DemandReportsPage({searchParams}:{searchParams:Search}){
  if(!cmsEnabled())return <section><h1>Demand reporting unavailable</h1><p>Administration must be configured before saved enquiries can be reported.</p></section>;
  let report:DemandReport;
  try{
    const [{getPayload},{default:config},{readDemandReport}]=await Promise.all([import('payload'),import('@/payload.config'),import('@/lib/demand-service')]);
    const payload=await getPayload({config});const {user}=await payload.auth({headers:await headers()});
    if(!canReadDemand(user))return <section><h1>Private demand report</h1><p>Sign in with an owner or sales account to view saved enquiry demand.</p><a className="button" href="/admin/login?redirect=%2Fstaff%2Freports">Sign in</a></section>;
    const params=new URLSearchParams();
    for(const [key,value] of Object.entries(await searchParams))for(const entry of Array.isArray(value)?value:value===undefined?[]:[value])params.append(key,entry);
    const filters=parseDemandQuery(params);
    if(filters.format!=='json')throw new DemandError('Use the Download CSV action to export this report.');
    report=await readDemandReport(payload,user,filters);
  }catch(error){
    return <section><h1>Demand report</h1><p role="alert">{error instanceof DemandError?error.message:'Demand reporting is temporarily unavailable. Try again or choose a shorter date range.'}</p><a className="button secondary" href="/staff/reports">Reset report filters</a></section>;
  }
  return <DemandReportView report={report}/>;
}
