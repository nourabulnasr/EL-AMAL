import {cmsEnabled} from '@/lib/cms-runtime';
import {notificationTransport} from '@/lib/mail-transport';
import {notificationHandler} from '@/lib/notification-http';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=30;
export const POST=notificationHandler({
 secret:()=>process.env.NOTIFICATION_WORKER_SECRET,
 enabled:()=>cmsEnabled()&&process.env.VERIFICATION_DELIVERY_ENABLED==='true'&&(process.env.PAYLOAD_SECRET?.length??0)>=32&&!!notificationTransport(),
 run:async()=>{
  const [{getPayload},{default:config},{deliverNextVerification}]=await Promise.all([import('payload'),import('@/payload.config'),import('@/lib/verification-email-worker')]);
  return deliverNextVerification(await getPayload({config}),process.env.PAYLOAD_SECRET!,notificationTransport());
 },
});
