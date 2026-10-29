import {canReadDemand} from './demand-report.ts';

export type StaffWorkspaceAction={label:string;href:string;description:string};
export type StaffWorkspaceSection={id:string;step:string;title:string;guidance:string;actions:StaffWorkspaceAction[]};

export const canAccessStaffWorkspace=canReadDemand;

export function staffWorkspaceSections():StaffWorkspaceSection[]{return [
 {id:'enquiries',step:'01',title:'Review customer requests',guidance:'The enquiry record is the immutable source for submitted contact details, product lines, quantities, ranges and internal status. Existing-quotation files are stored separately; open the files action for the same reference.',actions:[
  {label:'Open enquiries',href:'/admin/collections/enquiries',description:'Customer details, requested models, quantities, ranges and workflow status.'},
  {label:'Open private files',href:'/admin/collections/enquiry-attachments',description:'Confirmed quotation uploads, available for 30 days. PDF and XLSX files are unscanned.'},
 ]},
 {id:'delivery',step:'02',title:'Check email delivery',guidance:'Sent means the email provider accepted the message; it does not prove Inbox placement. Verification emails confirm the customer address. Notification queue records the owner alert after a verified request is ready.',actions:[
  {label:'Verification email queue',href:'/admin/collections/verification-emails',description:'Confirmation-link delivery, retry state and expiry.'},
  {label:'Owner notification queue',href:'/admin/collections/notifications',description:'Delivery state for the enquiry alert sent to the business mailbox.'},
 ]},
 {id:'operations',step:'03',title:'Act on demand',guidance:'Use stock control for inventory movements, demand reports for requested quantities and ranges, and product interest for live product views, suggestion opens and enquiry intent.',actions:[
  {label:'Stock control',href:'/staff/inventory',description:'Review balances and create traceable inventory movements.'},
  {label:'Demand reports',href:'/staff/reports',description:'Verified request volume, quantities and requested ranges.'},
  {label:'Product interest',href:'/staff/products',description:'Live product attention and conversion signals by model.'},
 ]},
]}
