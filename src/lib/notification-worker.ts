import {randomUUID} from 'node:crypto';
import type {Payload} from 'payload';
import {maintainNotifications} from './delivery-store.ts';
import {notificationOptionSummary} from './notification-options.ts';
import {rfqEmail} from './rfq-email.ts';
import {notificationKey} from './notification-key.ts';
export type NotificationTransport={send:(message:{from?:string;to:string;subject:string;text:string;html?:string;replyTo?:string;idempotencyKey:string})=>Promise<{id:string}>};
export function retryDelay(attempt:number){return Math.min(3600,60*2**Math.max(0,attempt-1));}
// No transport is configured by default. A protected caller supplies the transport.
// Transport implementations must deduplicate on idempotencyKey, including after an ambiguous timeout.
export async function deliverNextNotification(payload:Payload,transport?:NotificationTransport){
 if(!transport)return {outcome:'disabled' as const};
 const pool=payload.db.pool;
 // Provider deduplication expires after 24 hours. Never retry across that boundary.
 // Use queue creation as a conservative lower bound on the first possible send.
 await maintainNotifications(payload);
 // The same atomic claim enforces customer confirmation for first sends and retries.
 // Demo/test confirmations never qualify. Verification is immutable once recorded.
 const lease=randomUUID();
 const claimed=await pool.query(`UPDATE notifications SET status='processing', attempts=attempts+1, lease_token=$1,
 lease_expires_at=now()+interval '5 minutes', updated_at=now() WHERE id=(
 SELECT n.id FROM notifications n WHERE n.source='cms'
 AND EXISTS (SELECT 1 FROM enquiries e WHERE e.id=n.enquiry_id AND e.source='cms' AND e.verification_status='verified' AND e.verified_at IS NOT NULL
 AND (e.request_kind='products' OR e.quotation_submitted_at IS NOT NULL))
 AND attempts<5 AND created_at>now()-interval '23 hours' AND
 ((status='pending' AND next_attempt_at<=now()) OR (status='processing' AND lease_expires_at<=now()))
 ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING id,reference,recipient,delivery_key,attempts,enquiry_id`,[lease]);
 const row=claimed.rows[0];if(!row)return {outcome:'empty' as const};
 try{
   const items=await pool.query('SELECT model,quantity,range,option_id,option_name_en,option_name_ar,option_model,name_en FROM enquiries_items WHERE _parent_id=$1 ORDER BY _order LIMIT 100',[row.enquiry_id]);
   const configurations=items.rows.map(item=>notificationOptionSummary([{model:item.model,quantity:Number(item.quantity),range:item.range,optionId:item.option_id,optionNameEn:item.option_name_en,optionNameAr:item.option_name_ar,optionModel:item.option_model}]));
   let outgoing: Parameters<NotificationTransport['send']>[0];
   if(row.delivery_key!==notificationKey(row.reference)){
     const summary=configurations.filter(Boolean).join('\n');
     outgoing={
       to:row.recipient,idempotencyKey:row.delivery_key,subject:`EL AMAL enquiry ${row.reference}`,
       text:`Enquiry ${row.reference} is available in the EL AMAL admin inbox. Sign in to review its details.${summary?'\n\nProduct configuration selections:\n'+summary:''}`,
     };
   }else{
   const details=await pool.query('SELECT name,email,company,locale,request_kind FROM enquiries WHERE id=$1',[row.enquiry_id]);
   const enquiry=details.rows[0];
   if(!enquiry)throw new Error('Missing enquiry');
   const file=enquiry.request_kind==='quotation';
   const heading=file?'Existing quotation submitted':'New request for quotation';
   const lines=items.rows.map((item,index)=>{
     const configuration=configurations[index];
     return `${item.name_en || item.model}\n${configuration || `${item.model} | Quantity: ${item.quantity}`}`;
   });
   const message=rfqEmail({
     locale:'en',heading,
     paragraphs:[
       `Reference: ${row.reference}`,
       `Requested by: ${enquiry.name}\nCompany: ${enquiry.company}\nEmail: ${enquiry.email}\nPreferred language: ${enquiry.locale==='ar'?'Arabic':'English'}`,
       ...(file?['The customer uploaded a quotation. Sign in to review the file and any notes.']:['Requested products',...lines,'Sign in to review any notes and manage this request.']),
     ],
     action:{label:'Open this request in EL AMAL',url:`https://www.al-amaleg.com/admin/collections/enquiries/${encodeURIComponent(row.enquiry_id)}`},
   });
   outgoing={to:row.recipient,subject:`${heading} | EL AMAL | ${row.reference}`,...message,replyTo:enquiry.email,idempotencyKey:row.delivery_key};
   }
   const sent=await transport.send(outgoing);
   if(typeof sent.id!=='string'||!sent.id||sent.id.length>200)throw new Error('Invalid delivery receipt');
   const result=await pool.query("UPDATE notifications SET status='sent',sent_at=now(),provider_message_id=$1,last_error=NULL,lease_token=NULL,lease_expires_at=NULL,updated_at=now() WHERE id=$2 AND lease_token=$3 AND status='processing'",[sent.id,row.id,lease]);
   return {outcome:result.rowCount?'sent' as const:'stale' as const};
 }catch{
   const result=await pool.query(`UPDATE notifications SET status=$1,next_attempt_at=now()+($2*interval '1 second'),last_error='Delivery failed; details withheld',lease_token=NULL,lease_expires_at=NULL,updated_at=now() WHERE id=$3 AND lease_token=$4 AND status='processing'`,[row.attempts>=5?'failed':'pending',retryDelay(row.attempts),row.id,lease]);
   return {outcome:result.rowCount?(row.attempts>=5?'failed' as const:'retry' as const):'stale' as const};
 }
}
