import {cmsEnabled} from './cms-runtime';
import {attachmentHandler,quotationControlHandler} from './attachment-http';
import {saveQuotationFile,quotationUploadStatus,finalizeQuotation} from './attachment-service';
import {allowRequest,requestLimitKey} from './request-limits';
async function cms(){const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);return getPayload({config});}
function settings(){
  return cmsEnabled()&&process.env.ENQUIRY_QUOTATIONS_ENABLED==='true'&&process.env.SITE_URL?.startsWith('https://')?{origin:process.env.SITE_URL,secret:process.env.PAYLOAD_SECRET!}:undefined;
}
async function allow(headers:Headers,reference:string){
  const payload=await cms();
  return await allowRequest(payload,requestLimitKey(headers,'quotation-upload'),12)&&await allowRequest(payload,requestLimitKey(new Headers(),`quotation:${reference}`),12);
}
export const upload=attachmentHandler({settings,allow,save:async input=>saveQuotationFile(await cms(),input,process.env.PAYLOAD_SECRET!)},true);
export const control=quotationControlHandler({settings,allow,status:async reference=>quotationUploadStatus(await cms(),reference),finalize:async reference=>finalizeQuotation(await cms(),reference)});
