import {DemandError,parseDemandQuery} from './demand-report.ts';

export const interestKinds=['impression','selection','view','basket','datasheet'] as const;
export const interestLists=['catalogue','category','search','home','related','detail'] as const;
export type InterestKind=typeof interestKinds[number];
export type InterestList=typeof interestLists[number];
export type InterestDevice='mobile'|'desktop';
export type InterestEvent={kind:InterestKind;productId:string;locale:'en'|'ar';list:InterestList};
export type InterestQuery={start:string;end:string;locale:'all'|'en'|'ar';device:'all'|InterestDevice;list:'all'|InterestList;sort:'selections'|'impressions'|'ctr'|'views'|'basketAdds';format:'json'|'csv'};
export type InterestRow={productId:string;model:string;impressions:number;selections:number;views:number;basketAdds:number;datasheets:number;ctr:number|null;smallSample:boolean};
export type InterestReport={filters:InterestQuery;rows:InterestRow[];updatedAt:string;enabled:boolean};

export function parseInterestEvents(input:unknown):InterestEvent[]{
  if(!input||typeof input!=='object'||Object.keys(input).join()!=='events')throw new DemandError('Invalid measurements.');
  const events=(input as {events:unknown}).events;
  if(!Array.isArray(events)||events.length<1||events.length>32)throw new DemandError('Use a batch of 1 to 32 measurements.');
  return events.map(value=>{
    if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join()!=='kind,list,locale,productId')throw new DemandError('Invalid measurement fields.');
    const {kind,productId,locale,list}=value;
    if(!interestKinds.includes(kind)||!interestLists.includes(list)||!['en','ar'].includes(locale)||typeof productId!=='string'||!/^cms-[1-9]\d{0,9}$/.test(productId)||Number(productId.slice(4))>2147483647)throw new DemandError('Invalid measurement.');
    if((kind==='impression'||kind==='selection')===(list==='detail'))throw new DemandError('Invalid measurement context.');
    return {kind,productId,locale,list};
  });
}

export function parseInterestQuery(params:URLSearchParams,now=new Date()):InterestQuery{
  const allowed=['start','end','locale','device','list','sort','format'];
  if(params.toString().length>512)throw new DemandError('Report filters are too long.');
  for(const key of params.keys())if(!allowed.includes(key)||params.getAll(key).length!==1)throw new DemandError('Use each supported filter only once.');
  const dates=new URLSearchParams();for(const key of ['start','end'])if(params.has(key))dates.set(key,params.get(key)!);
  const {start,end}=parseDemandQuery(dates,now);
  const choose=(key:string,values:readonly string[],fallback:string)=>{const value=params.get(key)||fallback;if(!values.includes(value))throw new DemandError('Choose a supported report filter.');return value;};
  return {start,end,locale:choose('locale',['all','en','ar'],'all'),device:choose('device',['all','mobile','desktop'],'all'),list:choose('list',['all',...interestLists],'all'),sort:choose('sort',['selections','impressions','ctr','views','basketAdds'],'selections'),format:choose('format',['json','csv'],'json')} as InterestQuery;
}

export function interestMetrics(impressions:number,selections:number){
  if(!Number.isSafeInteger(impressions)||!Number.isSafeInteger(selections)||impressions<0||selections<0||selections>impressions)throw new DemandError('Measurement counts need review.',503);
  return {ctr:impressions?Math.round(selections/impressions*10000)/100:null,smallSample:impressions<30};
}
export function interestCsv(report:InterestReport){
  const cell=(value:unknown)=>{let text=String(value??'');if(/^[\s\x00-\x1f\x7f\ufeff]*[=+\-@＝＋－＠]/u.test(text))text=`'${text}`;return `"${text.replaceAll('"','""')}"`;};
  const rows:unknown[][]=[['From (Cairo)','Through (Cairo)','Product','Model','Visible sessions','Selected sessions','CTR (%)','Product view sessions','Basket sessions','Datasheet sessions','Sample']];
  for(const row of report.rows)rows.push([report.filters.start,report.filters.end,row.productId,row.model,row.impressions,row.selections,row.ctr,row.views,row.basketAdds,row.datasheets,row.smallSample?'Small sample':'30+ impressions']);
  return '\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
