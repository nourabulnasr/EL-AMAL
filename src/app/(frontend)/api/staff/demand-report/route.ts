import {cmsEnabled} from '@/lib/cms-runtime';
import {demandReportHandler} from '@/lib/demand-http';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=30;
async function cms(){const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);return getPayload({config});}
export const GET=demandReportHandler({
  enabled:()=>cmsEnabled(),
  authenticate:async headers=>(await(await cms()).auth({headers})).user,
  read:async(actor,filters)=>{const {readDemandReport}=await import('@/lib/demand-service');return readDemandReport(await cms(),actor,filters);},
});
