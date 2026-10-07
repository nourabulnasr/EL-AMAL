import {cmsEnabled} from './cms-runtime';
import {interestHandler} from './product-interest-http';
import {allowRequest,requestLimitKey} from './request-limits';
export function interestSettings(env:Record<string,string|undefined>=process.env){
  if(!cmsEnabled(env)||env.CATALOGUE_SOURCE!=='cms'||env.PRODUCT_ANALYTICS_ENABLED!=='true')return;
  try{const url=new URL(env.SITE_URL||'');if(url.username||url.password||!(url.protocol==='https:'||(env.NODE_ENV!=='production'&&url.hostname==='127.0.0.1')))return;return {origin:url.origin,secret:env.PAYLOAD_SECRET!};}catch{return;}
}
export async function interestPayload(){const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);return getPayload({config});}
export const collectInterest=interestHandler({
  settings:()=>interestSettings(),
  allow:async headers=>allowRequest(await interestPayload(),requestLimitKey(headers,'product-interest'),120),
  isStaff:async headers=>!!(await(await interestPayload()).auth({headers})).user,
  save:async(session,events)=>{const {saveProductInterest}=await import('./product-interest-service');return saveProductInterest(await interestPayload(),session,events,process.env.PAYLOAD_SECRET!);},
});
