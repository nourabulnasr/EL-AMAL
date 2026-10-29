import {headers} from 'next/headers';
import {cmsEnabled} from '@/lib/cms-runtime';
import {canAccessStaffWorkspace,staffWorkspaceSections} from '@/lib/staff-workspace';

export const dynamic='force-dynamic';
export const metadata={title:'Owner workspace | EL AMAL',robots:{index:false,follow:false}};

export default async function StaffWorkspacePage(){
 if(!cmsEnabled())return <section><h1>Owner workspace unavailable</h1><p>Administration must be configured before the private workspace can be opened.</p></section>;
 try{
  const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);
  const payload=await getPayload({config}),{user}=await payload.auth({headers:await headers()});
  if(!canAccessStaffWorkspace(user))return <section className="workspace-gate"><p className="workspace-kicker">Private operations</p><h1>Sign in to the owner workspace.</h1><p>Only owner and sales accounts can open customer enquiries, quotation files, delivery queues and demand reports.</p><a className="button" href="/admin/login?redirect=%2Fstaff">Sign in</a></section>;
  const sections=staffWorkspaceSections();
  return <>
   <section className="workspace-hero"><div><p className="workspace-kicker">EL AMAL · private operations</p><h1>From request<br/>to response.</h1></div><div className="workspace-intro"><p>Start here when a customer submits an RFQ or an existing quotation. Each destination below is the authoritative screen for that part of the workflow.</p><p><strong>Signed in:</strong> {user.email} · {user.role}</p></div></section>
   <ol className="workspace-flow">{sections.map(section=><li key={section.id} id={section.id}><span className="workspace-step">{section.step}</span><div className="workspace-section-copy"><h2>{section.title}</h2><p>{section.guidance}</p></div><div className="workspace-actions">{section.actions.map(action=><a key={action.href} href={action.href}><strong>{action.label}</strong><span>{action.description}</span><b aria-hidden="true">↗</b></a>)}</div></li>)}</ol>
   <aside className="workspace-safety"><p className="workspace-kicker">File safety</p><h2>Scan document uploads before opening.</h2><p>Customer PDF and XLSX files are private and encrypted at rest, but they do not have automatic malware scanning. Download only through the protected file screen, acknowledge the warning, scan locally, and keep macros and external content disabled.</p></aside>
  </>;
 }catch{return <section><h1>Owner workspace</h1><p role="alert">The private workspace is temporarily unavailable. Use Administration to sign in or try again.</p><a className="button secondary" href="/admin">Open administration</a></section>}
}
