import {cmsEnabled} from '@/lib/cms-runtime';
import {notificationTransport} from '@/lib/mail-transport';
import {deliveryOperationsHandler,DELIVERY_START_BUDGET_MS} from '@/lib/delivery-operations';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;
const handler=deliveryOperationsHandler({
 secret:()=>process.env.CRON_SECRET,
 enabled:()=>cmsEnabled()&&process.env.DELIVERY_OPERATIONS_ENABLED==='true',
 run:async()=>{
  const deadlineAt=Date.now()+DELIVERY_START_BUDGET_MS;
  const [{getPayload},{default:config},{runDeliveryOperations},{expireInventoryHolds}]=await Promise.all([import('payload'),import('@/payload.config'),import('@/lib/delivery-runner'),import('@/lib/inventory-service')]);
  const payload=await getPayload({config});
  const transport=process.env.VERIFICATION_DELIVERY_ENABLED==='true'?notificationTransport():undefined;
  return runDeliveryOperations(payload,{
   secret:process.env.PAYLOAD_SECRET??'',transport,deadlineAt,
   retentionEnabled:process.env.DELIVERY_RETENTION_ENABLED==='true',
   maintenance:async options=>{await expireInventoryHolds(payload,options);},
  });
 },
});
export const GET=handler;
export const POST=handler;
// Next automatically dispatches HEAD to GET unless explicitly overridden.
export const HEAD=()=>new Response(null,{status:405,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
