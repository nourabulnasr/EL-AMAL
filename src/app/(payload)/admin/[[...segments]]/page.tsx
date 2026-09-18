import {cmsEnabled} from '@/lib/cms-runtime';
import {importMap} from '../importMap';

export const dynamic = 'force-dynamic';
export const metadata = {title:'EL AMAL administration',robots:{index:false,follow:false}};
type Props = {params:Promise<{segments:string[]}>;searchParams:Promise<Record<string,string|string[]>>};
export default async function Page(props:Props) {
  const {segments=[]} = await props.params;
  if (!cmsEnabled() || segments[0] === 'create-first-user') {
    return <main style={{maxWidth:640,margin:'12vh auto',padding:32}}><h1>EL AMAL administration</h1><p>Staff access requires environment configuration and a trusted owner setup. Public registration is unavailable.</p><a href="/en">Return to the website preview</a></main>;
  }
  const [{RootPage},{default:config}] = await Promise.all([import('@payloadcms/next/views'),import('@/payload.config')]);
  return RootPage({...props,config,importMap});
}
