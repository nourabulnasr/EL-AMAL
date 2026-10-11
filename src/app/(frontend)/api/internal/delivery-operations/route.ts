import {cmsEnabled} from '@/lib/cms-runtime';
import {deliveryOperationsHandler} from '@/lib/delivery-operations';
import {runConfiguredDelivery} from '@/lib/delivery-runtime';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;
const handler=deliveryOperationsHandler({
 secret:()=>process.env.CRON_SECRET,
 enabled:()=>cmsEnabled()&&process.env.DELIVERY_OPERATIONS_ENABLED==='true',
 run:runConfiguredDelivery,
});
export const GET=handler;
export const POST=handler;
// Next automatically dispatches HEAD to GET unless explicitly overridden.
export const HEAD=()=>new Response(null,{status:405,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
