import type {Translated} from './catalogue.ts';
export type CatalogueDetails = {
 manufacturer:'WIKA';
 image:{src:string;width:number;height:number;alt:Translated;sourceUrl:string};
 specifications:{label:Translated;value:Translated}[];
 availability:'in-stock'|'out-of-stock'|'check';
 availabilityReportedAt:string;
 datasheets:{title:string;url:string}[];
};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const text=(value:unknown,max:number):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
function translated(value:unknown,max:number):Translated|undefined {
 if(object(value)&&text(value.en,max)&&text(value.ar,max))return {en:value.en,ar:value.ar};
}
function https(value:unknown):string|undefined {
 if(!text(value,2048))return;
 try{const url=new URL(value);if(url.protocol==='https:'&&!url.username&&!url.password)return url.href;}catch{}
}
// Shared CMS validation and public allowlist: unknown keys never escape.
export function parseCatalogueDetails(value:unknown,now=new Date()):CatalogueDetails|undefined {
 if(!object(value)||value.manufacturer!=='WIKA'||!object(value.image))return;
 const image=value.image,alt=translated(image.alt,300),sourceUrl=https(image.sourceUrl);
 if(typeof image.src!=='string'||!/^\/images\/products\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}\.(?:jpg|jpeg|png|webp|avif)$/.test(image.src)||!alt||!sourceUrl)return;
 if(typeof image.width!=='number'||typeof image.height!=='number'||![image.width,image.height].every(x=>Number.isInteger(x)&&x>=1&&x<=10000))return;
 if(value.availability!=='in-stock'&&value.availability!=='out-of-stock'&&value.availability!=='check')return;
 if(typeof value.availabilityReportedAt!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value.availabilityReportedAt))return;
 const date=new Date(`${value.availabilityReportedAt}T00:00:00Z`);
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value.availabilityReportedAt||value.availabilityReportedAt>now.toISOString().slice(0,10))return;
 if(!Array.isArray(value.specifications)||value.specifications.length>80||!Array.isArray(value.datasheets)||value.datasheets.length>20)return;
 const specifications:CatalogueDetails['specifications']=[],datasheets:CatalogueDetails['datasheets']=[];
 for(const row of value.specifications){if(!object(row))return;const label=translated(row.label,200),entry=translated(row.value,4000);if(!label||!entry)return;specifications.push({label,value:entry});}
 for(const row of value.datasheets){if(!object(row)||!text(row.title,200))return;const url=https(row.url);if(!url)return;datasheets.push({title:row.title,url});}
 return {manufacturer:'WIKA',image:{src:image.src,width:image.width,height:image.height,alt,sourceUrl},specifications,availability:value.availability,availabilityReportedAt:value.availabilityReportedAt,datasheets};
}
export function validateCatalogueDetails(value:unknown):true|string {
 return value===null||value===undefined||!!parseCatalogueDetails(value)||'Enter valid bilingual catalogue details, a local raster image and a non-future availability date (YYYY-MM-DD).';
}
