import type {Product, Translated} from './catalogue.ts';
import {canPublish} from './access.ts';

export type Category = {id:string;name:Translated;description:Translated};
export type Catalogue = {source:'demo'|'cms';products:Product[];categories:Category[]};
type CategoryRecord = {id:number;key:string;name:Translated;description:Translated};
type ProductRecord = {
 instrumentType?:string|null;applications?:string[]|null;datasheetUrl?:string|null;
 id:number;model:string;category:number|CategoryRecord;name:Translated;description:Translated;
 _status?:'draft'|'published'|null;sourceRef:string;reviewedBy?:unknown;
 reviewedAt?:string|null;rightsConfirmed?:boolean|null;
};

export function catalogueSource(value:string|undefined):Catalogue['source'] {
 if(!value||value==='demo') return 'demo';
 if(value==='cms') return 'cms';
 throw new Error('CATALOGUE_SOURCE must be demo or cms');
}

// Deliberately project a small public DTO. Never pass raw CMS documents to clients.
export function toPublicCatalogue(records:ProductRecord[],categoryRecords:CategoryRecord[]):Catalogue {
 const categoriesById=new Map(categoryRecords.map(c=>[c.id,c]));
 const products:Product[]=[];
 for(const record of records){
  if(record._status!=='published'||!canPublish({...record,reviewedAt:record.reviewedAt??undefined,rightsConfirmed:record.rightsConfirmed??undefined}))continue;
  const category=categoriesById.get(typeof record.category==='number'?record.category:record.category.id);
  if(!category||!category.key||!category.name.en?.trim()||!category.name.ar?.trim())continue;
  products.push({id:`cms-${record.id}`,model:record.model,category:category.key,
   ...(record.instrumentType?{instrumentType:record.instrumentType}:{}),...(record.applications?.length?{applications:record.applications}:{}),...(safeDatasheetUrl(record.datasheetUrl)?{datasheetUrl:safeDatasheetUrl(record.datasheetUrl)!}:{}),
   name:{en:record.name.en,ar:record.name.ar},description:{en:record.description.en,ar:record.description.ar}});
 }
 const used=new Set(products.map(p=>p.category));
 return {source:'cms',products,categories:categoryRecords.filter(c=>used.has(c.key)).map(c=>({
  id:c.key,name:{en:c.name.en,ar:c.name.ar},description:{en:c.description.en,ar:c.description.ar},
 }))};
}

export function safeDatasheetUrl(value:unknown):string|undefined {
 if(typeof value!=='string')return;
 try{const url=new URL(value);if(url.protocol==='https:'&&!url.username&&!url.password)return url.href;}catch{}
}
