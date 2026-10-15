import {normalise, type Product} from './catalogue.ts';

type RelatedProductOptions = {limit?:number; now?:Date};

// A stable shuffle avoids client hydration changes and does not use visitor data.
function hash(value:string) {
 let result=2166136261;
 for(const character of value){result^=character.charCodeAt(0);result=Math.imul(result,16777619);}
 // Avalanche similar model references so neighbouring catalogue IDs do not cluster.
 result^=result>>>16;result=Math.imul(result,0x85ebca6b);
 result^=result>>>13;result=Math.imul(result,0xc2b2ae35);
 return (result^(result>>>16))>>>0;
}

/** Discovery suggestions, never a claim that two instruments are interchangeable. */
export function selectRelatedProducts<T extends Product>(product:Product,products:readonly T[],{limit=3,now=new Date()}:RelatedProductOptions={}):T[] {
 const count=Number.isFinite(limit)?Math.max(0,Math.min(3,Math.floor(limit))):3;
 if(!count||!product.category)return [];
 const currentModel=normalise(product.model);
 const applications=new Set(product.applications??[]);
 const day=Number.isFinite(now.getTime())?now.toISOString().slice(0,10):'catalogue';
 const seed=`${product.id}:${currentModel}:${day}`;
 const ranked=products.filter(candidate=>candidate.id!==product.id&&candidate.category===product.category&&normalise(candidate.model)!==currentModel)
  .map(candidate=>({
   product:candidate,
   relevance:Number(!!product.instrumentType&&candidate.instrumentType===product.instrumentType)*100+
    Math.min(9,new Set(candidate.applications?.filter(application=>applications.has(application))??[]).size)*10,
   order:hash(`${seed}:${normalise(candidate.model)}:${candidate.id}`),
  }))
  .sort((a,b)=>b.relevance-a.relevance||a.order-b.order||(a.product.id<b.product.id?-1:a.product.id>b.product.id?1:0));
 const selected:T[]=[],seenIds=new Set<string>(),seenModels=new Set<string>();
 for(const candidate of ranked){
  const model=normalise(candidate.product.model);
  if(seenIds.has(candidate.product.id)||seenModels.has(model))continue;
  selected.push(candidate.product);seenIds.add(candidate.product.id);seenModels.add(model);
  if(selected.length===count)break;
 }
 return selected;
}
