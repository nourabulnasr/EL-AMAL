import {notificationTransport} from './mail-transport';
import {DELIVERY_START_BUDGET_MS} from './delivery-operations';

/** Shared by the authenticated daily maintenance route and the signed schedule. */
export async function runConfiguredDelivery(){
 const deadlineAt=Date.now()+DELIVERY_START_BUDGET_MS;
 const [{getPayload},{default:config},{runDeliveryOperations},{expireInventoryHolds}]=await Promise.all([
  import('payload'),import('@/payload.config'),import('./delivery-runner'),import('./inventory-service'),
 ]);
 const payload=await getPayload({config});
 const transport=process.env.VERIFICATION_DELIVERY_ENABLED==='true'?notificationTransport():undefined;
 return runDeliveryOperations(payload,{
  secret:process.env.PAYLOAD_SECRET??'',transport,deadlineAt,
  retentionEnabled:process.env.DELIVERY_RETENTION_ENABLED==='true',
  maintenance:async options=>{
   await expireInventoryHolds(payload,options);
   if(Date.now()<deadlineAt){const {removeExpiredProductInterest}=await import('./product-interest-service');await removeExpiredProductInterest(payload);}
  },
 });
}
