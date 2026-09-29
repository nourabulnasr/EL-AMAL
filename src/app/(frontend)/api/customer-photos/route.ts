// A separate path preserves Payload's /api/enquiry-attachments collection routes.
import {cmsEnabled} from '@/lib/cms-runtime';
import {attachmentHandler} from '@/lib/attachment-http';
import {saveEnquiryPhoto} from '@/lib/attachment-service';
import {allowRequest,requestLimitKey} from '@/lib/request-limits';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
async function cms(){const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);return getPayload({config});}
export const POST=attachmentHandler({
  settings:()=>cmsEnabled()&&process.env.ENQUIRY_PHOTOS_ENABLED==='true'&&process.env.SITE_URL?.startsWith('https://')?{origin:process.env.SITE_URL,secret:process.env.PAYLOAD_SECRET!}:undefined,
  allow:async(headers,reference)=>{const payload=await cms();return await allowRequest(payload,requestLimitKey(headers,'photo-upload'),6)&&await allowRequest(payload,requestLimitKey(new Headers(),`photo:${reference}`),6);},
  save:async input=>saveEnquiryPhoto(await cms(),input,process.env.PAYLOAD_SECRET!),
});
