import {cmsEnabled} from '@/lib/cms-runtime';
import {inventoryHandlers} from '@/lib/inventory-http';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=30;
async function cms(){const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);return getPayload({config});}
const handlers=inventoryHandlers({
  enabled:()=>cmsEnabled(),
  authenticate:async headers=>(await(await cms()).auth({headers})).user,
  read:async(actor,url)=>{const {readInventory}=await import('@/lib/inventory-service');return readInventory(await cms(),actor,url);},
  execute:async(actor,command)=>{const {executeInventory}=await import('@/lib/inventory-service');return executeInventory(await cms(),actor,command);},
});
export const GET=handlers.GET;
export const POST=handlers.POST;
