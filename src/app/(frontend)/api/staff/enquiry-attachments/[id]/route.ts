import {cmsEnabled} from '@/lib/cms-runtime';
import {readEnquiryPhoto} from '@/lib/attachment-service';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const denied=()=>new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  if(!cmsEnabled())return denied();
  const {id}=await params;if(!/^[1-9]\d{0,9}$/.test(id))return denied();
  try{
    const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
    const payload=await getPayload({config}),user=(await payload.auth({headers:request.headers})).user;
    const photo=await readEnquiryPhoto(payload,Number(id),user,process.env.PAYLOAD_SECRET!);if(!photo)return denied();
    return new Response(new Uint8Array(photo.bytes),{headers:{'Content-Type':photo.contentType,'Content-Disposition':`attachment; filename="technical-photo.${photo.contentType==='image/png'?'png':'jpg'}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Referrer-Policy':'no-referrer'}});
  }catch{return denied();}
}
