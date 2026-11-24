import {canReadDemand} from './demand-report.ts';

export type StaffWorkspaceAction={label:string;href:string;description:string};
export type StaffWorkspaceSection={id:string;step:string;title:string;guidance:string;actions:StaffWorkspaceAction[]};

export const canAccessStaffWorkspace=canReadDemand;

export function staffWorkspaceSections():StaffWorkspaceSection[]{return [
 {id:'enquiries',step:'01',title:'Customer quotation requests',guidance:'Open a request to see the customer’s submitted details, products, quantities and selected specifications. Update its Status and Internal notes as you follow up. For uploaded quotation files, match the same request reference.',actions:[
  {label:'View customer requests',href:'/admin/collections/enquiries',description:'See who contacted you, what they need and which requests need a reply.'},
  {label:'View uploaded quotations',href:'/admin/collections/enquiry-attachments',description:'Open customer files for the matching request. Files are available for 30 days; scan PDF and Excel files before opening.'},
 ]},
 {id:'delivery',step:'02',title:'Check email delivery',guidance:'Sent means the email provider accepted the message; it does not prove Inbox placement. Verification emails confirm the customer address. Notification queue records the owner alert after a verified request is ready.',actions:[
  {label:'Customer confirmation emails',href:'/admin/collections/verification-emails',description:'Check whether the customer’s confirmation email was sent.'},
  {label:'Emails to your sales inbox',href:'/admin/collections/notifications',description:'Check alerts sent to elamal4supplies@gmail.com after customer confirmation.'},
 ]},
 {id:'operations',step:'03',title:'Products, requests and stock',guidance:'See which products visitors click, compare actual quotation requests, and manage counted stock. Product clicks show interest; customer requests show what people have asked you to quote.',actions:[
  {label:'Manage stock',href:'/staff/inventory',description:'Record received stock, adjustments, reservations and dispatches.'},
  {label:'Most requested products',href:'/staff/reports',description:'Compare products, quantities and measurement ranges in saved requests.'},
  {label:'Product clicks and CTR',href:'/staff/products',description:'See the most clicked products, views and basket additions. Refreshes every 30 seconds while open.'},
 ]},
]}
