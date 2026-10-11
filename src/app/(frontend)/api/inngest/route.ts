import {createDeliveryScheduler} from '@/lib/delivery-scheduler';
import {runConfiguredDelivery} from '@/lib/delivery-runtime';

export const dynamic='force-dynamic';
export const maxDuration=60;
export const {GET,POST,PUT}=createDeliveryScheduler(process.env,runConfiguredDelivery);
export const HEAD=()=>new Response(null,{status:405,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
