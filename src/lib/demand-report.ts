export type DemandActor={id:number;collection:'staff';role:'owner'|'sales'};
export type DemandCohort='verified'|'unverified'|'test'|'demo';
export type DemandQuery={start:string;end:string;cohort:DemandCohort|'customers'|'all';model:string;range:string;page:number;pageSize:number;format:'json'|'csv'};
export type DemandLine={enquiryId:number;cohort:DemandCohort;productId:string;model:string;range:string|null;quantity:number};
export type DemandRow={model:string;range:string;cohort:DemandCohort;requests:number;units:number};
export type DemandReport={filters:DemandQuery;rows:DemandRow[];totalRows:number;totalPages:number;totals:{requests:number;units:number;verifiedRequests:number;unverifiedRequests:number;testRequests:number;demoRequests:number}};
export const DEMAND_SOURCE_LIMIT=20000;
export const DEMAND_EXPORT_LIMIT=2000;
export const demandCohortLabels:Record<DemandCohort,string>={verified:'Verified customer',unverified:'Unverified customer',test:'Test verification',demo:'Demo'};
export class DemandError extends Error {
  status:number;
  constructor(message:string,status=400){super(message);this.status=status;}
}
export function canReadDemand(user:unknown):user is DemandActor {
  if(!user||typeof user!=='object')return false;
  const value=user as Record<string,unknown>;
  return value.collection==='staff'&&Number.isSafeInteger(value.id)&&Number(value.id)>0&&Number(value.id)<=2147483647&&['owner','sales'].includes(String(value.role));
}
function dateOnly(value:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'2000-01-01')throw new DemandError('Choose valid dates from the year 2000 onwards.');
  const time=Date.parse(`${value}T00:00:00Z`);
  if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value)throw new DemandError('Choose a valid calendar date.');
  return time;
}
export function parseDemandQuery(params:URLSearchParams,now=new Date()):DemandQuery {
  const allowed=['start','end','cohort','model','range','page','pageSize','format'];
  if(params.toString().length>2048)throw new DemandError('Report filters are too long.');
  for(const key of params.keys())if(!allowed.includes(key)||params.getAll(key).length!==1)throw new DemandError('Use each supported report filter only once.');
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part=(key:string)=>parts.find(value=>value.type===key)!.value;
  const today=`${part('year')}-${part('month')}-${part('day')}`;
  const end=params.get('end')||today;
  const endTime=dateOnly(end);
  const start=params.get('start')||new Date(endTime-29*86400000).toISOString().slice(0,10);
  const days=(endTime-dateOnly(start))/86400000+1;
  if(days<1||days>93||end>today)throw new DemandError('Choose up to 93 calendar days, ending today or earlier.');
  const cohort=params.get('cohort')||'customers';
  if(!['customers','all','verified','unverified','test','demo'].includes(cohort))throw new DemandError('Choose a supported enquiry group.');
  const format=params.get('format')||'json';
  if(!['json','csv'].includes(format))throw new DemandError('Choose JSON or CSV format.');
  const integer=(key:string,fallback:number,max:number)=>{
    const value=params.get(key)??String(fallback);
    if(!/^[1-9]\d*$/.test(value)||Number(value)>max)throw new DemandError(`Choose a ${key==='page'?'page':'page size'} from 1 to ${max}.`);
    return Number(value);
  };
  const text=(key:string,max:number)=>{
    const value=(params.get(key)||'').trim();
    if(value.length>max||/[\x00-\x1f\x7f]/.test(value))throw new DemandError('Use shorter model and range filters without control characters.');
    return value;
  };
  return {start,end,cohort:cohort as DemandQuery['cohort'],model:text('model',120),range:text('range',160),page:integer('page',1,DEMAND_SOURCE_LIMIT),pageSize:integer('pageSize',25,100),format:format as DemandQuery['format']};
}

// Direct requests accept arbitrary customer text. Only a narrow numeric measurement
// grammar is safe for aggregate output; other details remain in the private inbox.
const measurement=/^[+−-]?\d{1,6}(?:[.,]\d{1,4})?(?:\s*(?:to|\.\.\.?|[–—−-])\s*[+−-]?\d{1,6}(?:[.,]\d{1,4})?)?\s*(?:bar|mbar|Pa|hPa|kPa|MPa|psi|kpsi|°\s?[CF]|K|%|mmH2O|mH2O|inH2O)$/i;
function safeRange(raw:string|null){
  const value=(raw||'').trim();
  if(!value)return 'Range not specified';
  return value.length<=80&&measurement.test(value)?value:'Range requires staff review';
}
export function aggregateDemand(lines:DemandLine[],filters:DemandQuery):DemandReport {
  if(lines.length>DEMAND_SOURCE_LIMIT)throw new DemandError('This period contains too many enquiry lines. Choose a shorter date range.',413);
  const groups=new Map<string,{row:DemandRow;enquiries:Set<number>}>();
  const distinct=new Set<number>();
  const cohorts:Record<DemandCohort,Set<number>>={verified:new Set(),unverified:new Set(),test:new Set(),demo:new Set()};
  let units=0;
  for(const line of lines){
    if(!Number.isSafeInteger(line.enquiryId)||line.enquiryId<1||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>9999||!Object.hasOwn(cohorts,line.cohort))throw new DemandError('Saved demand data needs review before a report can be produced.',503);
    if(filters.cohort==='customers'&&!['verified','unverified'].includes(line.cohort))continue;
    if(!['customers','all'].includes(filters.cohort)&&filters.cohort!==line.cohort)continue;
    const trustedModel=/^cms-[1-9]\d*$/.test(line.productId)||(line.cohort==='demo'&&/^demo-[pta][1-9]\d*$/.test(line.productId));
    const model=trustedModel?line.model.trim():'Customer-specified model';
    const range=safeRange(line.range);
    if(!model||model.length>240)throw new DemandError('Saved demand data needs review before a report can be produced.',503);
    if(!model.toLowerCase().includes(filters.model.toLowerCase())||!range.toLowerCase().includes(filters.range.toLowerCase()))continue;
    distinct.add(line.enquiryId);cohorts[line.cohort].add(line.enquiryId);units+=line.quantity;
    const key=JSON.stringify([model,range,line.cohort]);
    let group=groups.get(key);
    if(!group){group={row:{model,range,cohort:line.cohort,requests:0,units:0},enquiries:new Set()};groups.set(key,group);}
    group.enquiries.add(line.enquiryId);group.row.units+=line.quantity;group.row.requests=group.enquiries.size;
  }
  const ordered=[...groups.values()].map(group=>group.row).sort((a,b)=>b.units-a.units||a.model.localeCompare(b.model,'en')||a.range.localeCompare(b.range,'en')||a.cohort.localeCompare(b.cohort,'en'));
  if(filters.format==='csv'&&ordered.length>DEMAND_EXPORT_LIMIT)throw new DemandError('This export has more than 2,000 groups. Narrow the dates, model or range first.',413);
  return {filters,rows:filters.format==='csv'?ordered:ordered.slice((filters.page-1)*filters.pageSize,filters.page*filters.pageSize),totalRows:ordered.length,totalPages:Math.ceil(ordered.length/filters.pageSize),totals:{requests:distinct.size,units,verifiedRequests:cohorts.verified.size,unverifiedRequests:cohorts.unverified.size,testRequests:cohorts.test.size,demoRequests:cohorts.demo.size}};
}
function csvCell(value:string|number){
  let text=String(value);
  // Quote every cell; also neutralize spreadsheet formulas, including formulas
  // hidden behind whitespace, BOM, control characters, or fullwidth operators.
  if(/^[\s\x00-\x1f\x7f\ufeff]*[=+\-@＝＋－＠]/u.test(text)||/^[\t\r\n]/.test(text))text=`'${text}`;
  return `"${text.replaceAll('"','""')}"`;
}
export function demandCsv(report:DemandReport){
  if(report.filters.format!=='csv'||report.rows.length!==report.totalRows||report.totalRows>DEMAND_EXPORT_LIMIT)throw new DemandError('Request a complete CSV export before downloading.');
  const rows:(string|number)[][]=[['From (Cairo)','Through (Cairo)','Model','Range','Enquiry group','Requests','Units']];
  for(const row of report.rows)rows.push([report.filters.start,report.filters.end,row.model,row.range,demandCohortLabels[row.cohort],row.requests,row.units]);
  return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
