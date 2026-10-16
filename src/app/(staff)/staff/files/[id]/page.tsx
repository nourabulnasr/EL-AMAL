import {headers} from 'next/headers';
import {cmsEnabled} from '@/lib/cms-runtime';
import {hasRole} from '@/lib/access';
import {PrivateFileDownload} from '@/components/private-file-download';
export const dynamic='force-dynamic';
export const metadata={title:'Private file | EL AMAL',robots:{index:false,follow:false}};
export default async function PrivateFilePage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!cmsEnabled()||!/^[1-9]\d{0,9}$/.test(id))return <section><h1>File unavailable</h1></section>;
 const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
 const payload=await getPayload({config}),{user}=await payload.auth({headers:await headers()});
 if(!user||user.collection!=='staff'||!hasRole(user,['owner','sales']))return <section><h1>Private enquiry file</h1><p>Sign in with an owner or sales account.</p><a className="button" href={`/admin/login?redirect=${encodeURIComponent(`/staff/files/${id}`)}`}>Sign in</a></section>;
 return <PrivateFileDownload id={Number(id)}/>;
}
