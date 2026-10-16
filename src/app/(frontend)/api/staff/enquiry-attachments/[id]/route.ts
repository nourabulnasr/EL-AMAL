import {cmsEnabled} from '@/lib/cms-runtime';
import {readEnquiryFile} from '@/lib/attachment-service';
import {attachmentDownloadHandler} from '@/lib/attachment-download-http';
export const runtime='nodejs';export const dynamic='force-dynamic';
const handler=attachmentDownloadHandler({enabled:cmsEnabled,read:async(id,headers,acknowledged)=>{
  const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
  const payload=await getPayload({config}),user=(await payload.auth({headers})).user;
  const metadata=await readEnquiryFile(payload,id,user,process.env.PAYLOAD_SECRET!,false,true);
  return metadata&&metadata.byteCount>2*1024*1024?metadata:readEnquiryFile(payload,id,user,process.env.PAYLOAD_SECRET!,acknowledged);
}});
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return handler(request,(await params).id);}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return handler(request,(await params).id);}
