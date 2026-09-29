import {headers} from 'next/headers';
import {cmsEnabled} from '@/lib/cms-runtime';
import {canUseInventory} from '@/lib/inventory';
import {InventoryConsole} from '@/components/inventory-console';
export const dynamic='force-dynamic';
export default async function InventoryPage(){
  if(!cmsEnabled())return <section><h1>Stock control unavailable</h1><p>Administration must be configured before stock can be recorded.</p></section>;
  const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
  const payload=await getPayload({config});const {user}=await payload.auth({headers:await headers()});
  if(!canUseInventory(user))return <section><h1>Staff stock control</h1><p>Sign in with an owner, sales or warehouse account to continue.</p><a className="button" href="/admin/login?redirect=%2Fstaff%2Finventory">Sign in</a></section>;
  return <InventoryConsole actorId={user.id}/>;
}
