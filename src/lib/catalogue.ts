import type {CatalogueDetails} from './catalogue-details.ts';
export type Locale = 'en' | 'ar';
export type Translated = Record<Locale, string>;
export type Product = { id:string; model:string; category:string; name:Translated; description:Translated; instrumentType?:string; applications?:string[]; datasheetUrl?:string; details?:CatalogueDetails; };
export const isLocale = (value:string): value is Locale => value === 'en' || value === 'ar';
export function normalise(value:string) {
  return value.normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/[^\p{L}\p{N}]/gu,'');
}
export function paginateProducts<T>(items:T[],requested:unknown){
 const total=items.length,pages=Math.max(1,Math.ceil(total/24));
 const candidate=typeof requested==='string'&&/^[1-9]\d*$/.test(requested)?Number(requested):1;
 const page=Number.isSafeInteger(candidate)&&candidate<=pages?candidate:1;
 const offset=(page-1)*24;
 return {items:items.slice(offset,offset+24),page,pages,total,start:total?offset+1:0,end:Math.min(offset+24,total)};
}
export function searchProducts<T extends Product>(products:T[], query:string, category:string, instrumentType="", application=""):T[] {
  const q = normalise(query.trim().slice(0,120));
  return products.filter(p => (!category || p.category === category) && (!instrumentType || p.instrumentType === instrumentType) && (!application || p.applications?.includes(application)) && (!q || normalise([p.model,...Object.values(p.name),...Object.values(p.description)].join(' ')).includes(q)))
    .sort((a,b) => Number(normalise(b.model) === q) - Number(normalise(a.model) === q));
}
