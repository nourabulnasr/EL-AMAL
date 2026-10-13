import type {CatalogueOption} from './catalogue-details.ts';
export type BasketLine = {productId:string; quantity:number;optionId?:string};
export type BasketProduct = {id:string;options?:CatalogueOption[]};
const validQuantity = (q:unknown):q is number => typeof q === 'number' && Number.isSafeInteger(q) && q > 0 && q <= 9999;
const validOption = (id:unknown):id is string => typeof id==='string'&&/^[a-z][a-z0-9-]{0,79}$/.test(id);
export const basketLineKey=(line:Pick<BasketLine,'productId'|'optionId'>)=>JSON.stringify([line.productId,line.optionId??null]);
export function readBasket(raw:string|null):BasketLine[] {
 try {
  const value:unknown=JSON.parse(raw??'[]');
  if(!Array.isArray(value)||value.length>100)return [];
  const result:BasketLine[]=[];
  for(const line of value){
   if(!line||typeof line.productId!=='string'||!line.productId||line.productId.length>100||!validQuantity(line.quantity)||(line.optionId!==undefined&&!validOption(line.optionId)))return [];
   const entry={productId:line.productId,quantity:line.quantity,...line.optionId!==undefined?{optionId:line.optionId}:{}};
   if(result.some(existing=>basketLineKey(existing)===basketLineKey(entry)))return [];
   result.push(entry);
  }
  return result;
 }catch{return [];}
}
export function addLine(lines:BasketLine[],productId:string,quantity:number,optionId?:string):BasketLine[]{
 if(!productId||!validQuantity(quantity)||(optionId!==undefined&&!validOption(optionId)))throw new Error('Invalid quantity, product or option');
 const entry={productId,quantity,...optionId!==undefined?{optionId}:{}};
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
 return lines.filter(line=>products.some(product=>product.id===line.productId));
}
export function basketSelectionRequired(line:BasketLine,product:BasketProduct):boolean{
 return product.options?.length? !product.options.some(option=>option.id===line.optionId):line.optionId!==undefined;
}
export function selectBasketOption(lines:BasketLine[],line:BasketLine,optionId:string):BasketLine[]{
 const current=lines.find(existing=>basketLineKey(existing)===basketLineKey(line));
 if(!current)return lines;
 const remaining=lines.filter(existing=>basketLineKey(existing)!==basketLineKey(line));
 return addLine(remaining,current.productId,current.quantity,optionId);
}
