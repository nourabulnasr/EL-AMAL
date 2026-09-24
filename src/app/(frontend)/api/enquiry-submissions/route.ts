import {cmsEnabled} from '@/lib/cms-runtime';
import {catalogueSource} from '@/lib/public-catalogue';
import {enquiryHandlers} from '@/lib/enquiry-http';
import {loadCatalogue} from '@/lib/load-catalogue';
export const dynamic='force-dynamic';
async function cms(){const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);return getPayload({config});}
const handlers=enquiryHandlers({
  enabled:()=>cmsEnabled(),source:()=>catalogueSource(process.env.CATALOGUE_SOURCE),
  authenticate:async headers=>(await(await cms()).auth({headers})).user,
  submit:async input=>{const {submitEnquiry}=await import('@/lib/submit-enquiry');return submitEnquiry(await cms(),input,await loadCatalogue());},
});
export const GET=handlers.GET;
export const POST=handlers.POST;
