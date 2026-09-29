import type {Payload} from 'payload';
import {deliverNextNotification,type NotificationTransport} from './notification-worker.ts';
import {deliverNextVerification} from './verification-email-worker.ts';
import {DELIVERY_START_BUDGET_MS,runDeliveryBatch} from './delivery-operations.ts';
import {claimDeliveryLease,completeDeliveryLease,maintainDeliveryData} from './delivery-store.ts';

export async function runDeliveryOperations(payload:Payload,options:{secret:string;transport?:NotificationTransport;deadlineAt?:number;retentionEnabled?:boolean;maintenance?:(options:{deadlineAt:number;maxItems:number})=>Promise<void>}){
 const deadlineAt=options.deadlineAt??Date.now()+DELIVERY_START_BUDGET_MS;
 const lease=await claimDeliveryLease(payload);
 if(!lease)return {outcome:'overlap' as const};
 try{
  if(options.retentionEnabled){
   await maintainDeliveryData(payload);
   if(Date.now()<deadlineAt){
    const {removeExpiredPhotos}=await import('./attachment-service.ts');
    await removeExpiredPhotos(payload);
   }
  }
  if(options.maintenance&&Date.now()<deadlineAt)await options.maintenance({deadlineAt:Math.min(deadlineAt,Date.now()+5000),maxItems:25});
  const result=!options.transport
   ?{outcome:'maintenance' as const,processed:0,accepted:0,failures:0}
   :options.secret.length>=32
    ?await runDeliveryBatch({verification:()=>deliverNextVerification(payload,options.secret,options.transport),notification:()=>deliverNextNotification(payload,options.transport),deadlineAt})
    :{outcome:'disabled' as const,processed:0,accepted:0,failures:0};
  const recorded=await completeDeliveryLease(payload,'delivery',lease,result);
  return recorded?result:{outcome:'stale' as const};
 }catch{
  await completeDeliveryLease(payload,'delivery',lease,{outcome:'error',processed:0,failures:1}).catch(()=>{});
  throw new Error('Delivery operations unavailable');
 }
}
