import {cmsEnabled} from '@/lib/cms-runtime';
import {notificationTransport} from '@/lib/mail-transport';
import {notificationHandler} from '@/lib/notification-http';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=30;
// POST only; no public GET or unconfigured automatic scheduler can send mail.
export const POST=notificationHandler({
  secret:()=>process.env.NOTIFICATION_WORKER_SECRET,
  enabled:()=>cmsEnabled()&&!!notificationTransport(),
  run:async()=>{
    const [{getPayload},{default:config},{deliverNextNotification}]=await Promise.all([import('payload'),import('@/payload.config'),import('@/lib/notification-worker')]);
    return deliverNextNotification(await getPayload({config}),notificationTransport());
  },
});
