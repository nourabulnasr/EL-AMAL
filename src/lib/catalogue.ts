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
// Fixed merchandising order requested for the page-three groups on 23 October 2026.
// Model keys remain stable across preview and production; unlisted products retain source order.
const preferredCategoryModels:Record<string,readonly string[]> = {
  "pressure": [
    "212.20",
    "213.40",
    "113.53, 213.53",
    "232.50, 233.50",
    "232.30, 233.30",
    "422.12, 423.12",
    "432.50, 433.50, 432.30, 433.30, 452.50, 453.50, 452.30, 453.30",
    "432.56, 433.56, 432.36, 433.36",
    "700.01, 700.02",
    "711.12, 731.12",
    "DPG40"
  ],
  "temperature": [
    "TR53",
    "TR75",
    "TR55",
    "TR81",
    "TR50",
    "TR60",
    "TR95",
    "TF35",
    "TF-2000",
    "TF37",
    "TF44",
    "TF41",
    "TF45",
    "T15",
    "T32",
    "T16",
    "T91",
    "T38",
    "TIF50, TIF52",
    "TSD-30",
    "TXS, TXA",
    "TFS35",
    "TCS, TCA",
    "TFS135"
  ]
};
const categoryRanks=new Map(Object.entries(preferredCategoryModels).map(([category,models])=>[category,new Map(models.map((model,index)=>[normalise(model),index]))]));
export function searchProducts<T extends Product>(products:T[], query:string, category:string, instrumentType="", application=""):T[] {
  const q = normalise(query.trim().slice(0,120));
  const ranks=categoryRanks.get(category);
  const rank=(product:Product)=>ranks?.get(normalise(product.model))??Number.MAX_SAFE_INTEGER;
  return products.filter(p => (!category || p.category === category) && (!instrumentType || p.instrumentType === instrumentType) && (!application || p.applications?.includes(application)) && (!q || normalise([p.model,...Object.values(p.name),...Object.values(p.description)].join(' ')).includes(q)))
    .sort((a,b) => Number(normalise(b.model) === q) - Number(normalise(a.model) === q) || rank(a)-rank(b));
}
