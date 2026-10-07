'use client';
import {DemandReportView} from './demand-report-view';
import {useLiveReport} from './use-live-report';
import type {DemandReport} from '@/lib/demand-report';
export function LiveDemandReport({initial,updatedAt}:{initial:DemandReport;updatedAt:string}){
  const params=new URLSearchParams(Object.entries(initial.filters).map(([key,value])=>[key,String(value)]));
  const live=useLiveReport(initial,`/api/staff/demand-report?${params}`,updatedAt);
  return <><div className="interest-refresh"><label><input type="checkbox" checked={live.automatic} onChange={event=>live.setAutomatic(event.target.checked)}/> Update demand every 30 seconds</label><button type="button" className="secondary" disabled={live.loading} onClick={()=>void live.refresh()}>{live.loading?'Refreshing…':'Refresh demand'}</button></div><p className="muted">Last successful update: <time dateTime={live.updatedAt}>{new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'medium',timeZone:'Africa/Cairo'}).format(new Date(live.updatedAt))}</time> (Cairo). Updates pause in a hidden tab.</p>{live.error&&<p className="interest-warning" role="alert">{live.error} <a href="/admin/login?redirect=%2Fstaff%2Freports">Staff sign in</a></p>}<DemandReportView report={live.data}/></>;
}
