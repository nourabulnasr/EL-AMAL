import type {Payload, Where} from 'payload';
import {canReadDemand} from '@/lib/demand-report';
import {parseInterestQuery} from '@/lib/product-interest';
import {interestSettings} from '@/lib/product-interest-runtime';
import {readProductInterest} from '@/lib/product-interest-service';

export async function InventoryAdminLink({payload,user}:{payload:Payload;user:unknown}){
  if(!canReadDemand(user))return null;
  const ready:Where={and:[{source:{equals:'cms'}},{verificationStatus:{equals:'verified'}},{verifiedAt:{exists:true}},{or:[{requestKind:{equals:'products'}},{quotationSubmittedAt:{exists:true}}]}]};
  const inbox=(statuses:string[])=>{
    const params=new URLSearchParams();
    params.set('where[and][0][source][equals]','cms');
    params.set('where[and][1][verificationStatus][equals]','verified');
    params.set('where[and][2][verifiedAt][exists]','true');
    params.set('where[and][3][or][0][requestKind][equals]','products');
    params.set('where[and][3][or][1][quotationSubmittedAt][exists]','true');
    statuses.forEach((status,index)=>params.set(`where[and][4][status][in][${index}]`,status));
    return `/admin/collections/enquiries?${params}`;
  };
  const count=async(status:string[])=>{
    try{return (await payload.count({collection:'enquiries',where:{and:[ready,{status:{in:status}}]},overrideAccess:false,user})).totalDocs;}
    catch{return null;}
  };
  const [newCount,activeCount,recent,interest]=await Promise.all([
    count(['new']),count(['reviewing','awaiting-customer']),
    payload.find({collection:'enquiries',where:{and:[ready,{status:{not_equals:'closed'}}]},sort:'-createdAt',limit:5,depth:0,overrideAccess:false,user}).catch(()=>null),
    readProductInterest(payload,user,parseInterestQuery(new URLSearchParams()),!!interestSettings()).catch(()=>null),
  ]);
  return <section className="owner-dashboard" aria-labelledby="owner-dashboard-title">
    <header><div><p>EL AMAL · Owner overview</p><h1 id="owner-dashboard-title">Your business, at a glance.</h1><p>Review requests, follow up customers and see which products attract interest.</p></div><a href="/admin">Refresh overview ↻</a></header>
    <div className="owner-dashboard__summary"><a href={inbox(['new'])}><strong>{newCount??'Unavailable'}</strong><span>New confirmed requests</span></a><a href={inbox(['reviewing','awaiting-customer'])}><strong>{activeCount??'Unavailable'}</strong><span>Requests being handled</span></a><a href="/admin/collections/enquiry-attachments"><strong>Customer files ↗</strong><span>Uploaded quotations and technical photos</span></a></div>
    <div className="owner-dashboard__columns"><section><h2>Recent confirmed requests</h2><p>Open a request for customer details, quantities, selected specifications and files.</p>{recent?recent.docs.length?<ul>{recent.docs.map(request=><li key={request.id}><a href={`/admin/collections/enquiries/${request.id}`}><strong>{request.company||request.name}</strong><span>{request.requestKind==='quotation'?'Uploaded quotation':'Product request'} · {request.status}</span><small>{request.reference}</small></a></li>)}</ul>:<p>No confirmed requests yet.</p>:<p role="status">Requests are temporarily unavailable.</p>}<a href="/admin/collections/enquiries">Open all customer requests →</a></section>
    <section><h2>Most clicked products</h2><p>Last 30 days · product-list clicks counted once per session.</p>{interest?.enabled?interest.rows.length?<ol>{interest.rows.slice(0,5).map(row=><li key={row.productId}><a href={`/en/products/${row.productId}`}>{row.model}</a><span>{row.selections} clicks · CTR {row.ctr===null?'—':`${row.ctr}%`}{row.smallSample?' · small sample':''}</span></li>)}</ol>:<p>No product clicks recorded in this period.</p>:<p>Product figures are unavailable or collection is disabled.</p>}<a href="/staff/products">Open live product report →</a><p><small>CTR: the share of visible product sessions that led to a click. The full report offers automatic updates every 30 seconds.</small></p></section></div>
    <nav aria-label="Owner tools"><a href="/staff/inventory">Manage stock</a><a href="/staff/reports">Most requested products</a><a href="/admin/collections/notifications">Sales email delivery</a><a href="/admin/collections/verification-emails">Confirmation email delivery</a><a href="/staff">All owner tools</a></nav><p><small>Loaded {new Date().toLocaleString('en-GB',{timeZone:'Africa/Cairo'})} (Cairo). Counts cover all dates. Refresh for the latest records.</small></p>
  </section>;
}
