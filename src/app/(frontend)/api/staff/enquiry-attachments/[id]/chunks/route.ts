import {cmsEnabled} from '@/lib/cms-runtime';
import {readEnquiryFile,readEnquiryFilePart} from '@/lib/attachment-service';
import {attachmentChunkDownloadHandler} from '@/lib/attachment-chunk-download-http';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const handler=attachmentChunkDownloadHandler({enabled:cmsEnabled,read:async(id,headers,acknowledged,metadataOnly,index)=>{
 const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
 const payload=await getPayload({config}),user=(await payload.auth({headers})).user;
 return metadataOnly?readEnquiryFile(payload,id,user,process.env.PAYLOAD_SECRET!,false,true):readEnquiryFilePart(payload,id,user,process.env.PAYLOAD_SECRET!,acknowledged,index);
}});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return handler(request,(await params).id);}
