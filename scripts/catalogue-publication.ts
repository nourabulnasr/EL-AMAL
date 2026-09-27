import {parseCatalogueDetails,type CatalogueDetails} from '../src/lib/catalogue-details.ts';
import type {Translated} from '../src/lib/catalogue.ts';
import {canPublish} from '../src/lib/access.ts';
import {instrumentTypes,applications} from '../src/content/product-options.ts';
export type PublicationProduct={externalId:string;model:string;category:string;name:Translated;description:Translated;instrumentType:string;applications:string[];datasheetUrl?:string;sourceRef:string;catalogueDetails:CatalogueDetails};
export type Publication={categories:{key:string;name:Translated;description:Translated}[];products:PublicationProduct[]};
export type SourceCard={model:string;sourceId:string;availability:string};
function bilingual(value:Translated){return typeof value?.en==='string'&&value.en.trim()&&typeof value?.ar==='string'&&/[\u0600-\u06ff]/.test(value.ar);}
export function validatePublication(data:Publication,source:SourceCard[]):true{
 if(!Array.isArray(data.products)||data.products.length!==source.length)throw new Error('Catalogue coverage does not match source count');
 const categories=new Set(data.categories.map(c=>c.key));
 if(categories.size!==data.categories.length||data.categories.some(c=>!bilingual(c.name)||!bilingual(c.description)))throw new Error('Invalid categories');
 const expected=new Map(source.map(s=>[s.model,s])),seen=new Set<string>();
 for(const p of data.products){
  const card=expected.get(p.model);
  if(!card||!p.sourceRef.includes(card.sourceId))throw new Error(`Missing source evidence: ${p.model}`);
  if(!/^wika-[a-z0-9-]+$/.test(p.externalId)||seen.has(p.externalId))throw new Error('Invalid or duplicate external ID');
  seen.add(p.externalId);expected.delete(p.model);
  if(!categories.has(p.category)||!bilingual(p.name)||!bilingual(p.description))throw new Error(`Incomplete bilingual product: ${p.model}`);
  if(!instrumentTypes.some(t=>t.id===p.instrumentType)||p.applications.some(a=>!applications.some(t=>t.id===a)))throw new Error(`Invalid taxonomy: ${p.model}`);
  const details=parseCatalogueDetails(p.catalogueDetails);
  if(!details||!details.specifications.length||!details.datasheets.length||details.availability!==card.availability)throw new Error(`Invalid photo/specification/stock details: ${p.model}`);
 }
 if(expected.size)throw new Error('Incomplete model coverage');
 return true;
}
const keys=['externalId','model','category','name','description','instrumentType','applications','datasheetUrl','sourceRef','catalogueDetails'] as const;
function stable(value:unknown):unknown{
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,stable(v)]));
 return value??null;
}
export function publicationUnchanged(existing:Record<string,unknown>,desired:Record<string,unknown>):boolean{
 if(existing._status!=='published'||!canPublish(existing))return false;
 return keys.every(k=>JSON.stringify(stable(existing[k]))===JSON.stringify(stable(desired[k])));
}
