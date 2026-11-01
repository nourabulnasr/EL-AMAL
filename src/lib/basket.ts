import type {CatalogueOption} from './catalogue-details.ts';
import {configurationKey,configurationIds,resolveConfiguration,validateConfiguration,type ConfigProduct,type Configuration} from './product-configuration.ts';
export type BasketLine = {productId:string; quantity:number;optionId?:string;configuration?:Configuration};
export type BasketProduct = {id:string;options?:CatalogueOption[];configurationProduct?:ConfigProduct};
const validQuantity = (q:unknown):q is number => typeof q === 'number' && Number.isSafeInteger(q) && q > 0 && q <= 9999;
const validOption = (id:unknown):id is string => typeof id==='string'&&/^[a-z][a-z0-9-]{0,79}$/.test(id);
export const basketLineKey=(line:Pick<BasketLine,'productId'|'optionId'|'configuration'>)=>JSON.stringify([line.productId,line.optionId??null,configurationKey(line.configuration)]);
export function readBasket(raw:string|null):BasketLine[] {
 try {
  const value:unknown=JSON.parse(raw??'[]');
  if(!Array.isArray(value)||value.length>100)return [];
  const result:BasketLine[]=[];
  for(const line of value){
   if(!line||typeof line.productId!=='string'||!line.productId||line.productId.length>100||!validQuantity(line.quantity)||(line.optionId!==undefined&&!validOption(line.optionId)))return [];
   if(line.configuration!==undefined&&(!line.configuration||typeof line.configuration!=='object'||Array.isArray(line.configuration)||Object.entries(line.configuration).some(([key,value])=>!['model','size','scale','thread'].includes(key)||typeof value!=='string'||value.length>120||!/^[A-Za-z0-9][A-Za-z0-9 ._:/+-]*$/.test(value))))return [];
   const config=line.configuration?Object.fromEntries(configurationIds.filter(k=>line.configuration[k]!==undefined).map(k=>[k,line.configuration[k]])):undefined;
   const entry={productId:line.productId,quantity:line.quantity,...line.optionId!==undefined?{optionId:line.optionId}:{},...config&&Object.keys(config).length?{configuration:config}:{}};
   if(result.some(existing=>basketLineKey(existing)===basketLineKey(entry)))return [];
   result.push(entry);
  }
  return result;
 }catch{return [];}
}
export function addLine(lines:BasketLine[],productId:string,quantity:number,optionId?:string,configuration?:Configuration):BasketLine[]{
 if(!productId||!validQuantity(quantity)||(optionId!==undefined&&!validOption(optionId)))throw new Error('Invalid quantity, product or option');
 const entry={productId,quantity,...optionId!==undefined?{optionId}:{},...configuration?{configuration}:{}};
 const key=basketLineKey(entry),existing=lines.find(line=>basketLineKey(line)===key);
 if(existing){
  if(!validQuantity(existing.quantity+quantity))throw new Error('Quantity limit reached');
  return lines.map(line=>basketLineKey(line)===key?{...line,quantity:line.quantity+quantity}:line);
 }
 if(lines.length>=100)throw new Error('Basket limit reached');
 return [...lines,entry];
}
// Retain legacy/stale selections so customers can explicitly choose again. Never pick an option for them.
export function normalizeBasket(lines:BasketLine[],products:BasketProduct[]):BasketLine[]{
 const result:BasketLine[]=[];
 for(const line of lines){const p=products.find(product=>product.id===line.productId);if(!p)continue;
  const config=p.configurationProduct?resolveConfiguration(p.configurationProduct,line.configuration??{}):line.configuration;
  const options=p.options?.filter(o=>!config?.model||!o.model||o.model===config.model),optionId=options?.length===1?options[0].id:line.optionId;
  try{result.splice(0,result.length,...addLine(result,line.productId,line.quantity,optionId,config&&Object.keys(config).length?config:undefined));}catch{return lines.filter(item=>products.some(product=>product.id===item.productId));}
 }return result;
}
export function basketSelectionRequired(line:BasketLine,product:BasketProduct):boolean{
 if(product.configurationProduct&&!validateConfiguration(product.configurationProduct,line.configuration??{}))return true;
 const chosen=product.options?.find(option=>option.id===line.optionId);
 if(chosen?.model&&line.configuration?.model&&chosen.model!==line.configuration.model)return true;
 return product.options?.length? !product.options.some(option=>option.id===line.optionId):line.optionId!==undefined;
}
export function selectBasketOption(lines:BasketLine[],line:BasketLine,optionId:string):BasketLine[]{
 const current=lines.find(existing=>basketLineKey(existing)===basketLineKey(line));
 if(!current)return lines;
 const remaining=lines.filter(existing=>basketLineKey(existing)!==basketLineKey(line));
 return addLine(remaining,current.productId,current.quantity,optionId,current.configuration);
}
