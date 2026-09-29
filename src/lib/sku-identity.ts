import type {CollectionBeforeChangeHook} from 'payload';

function canonical(value:unknown):unknown {
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,canonical(item)]));
  return value;
}
function identityValue(field:string,value:unknown){
  if(field==='product'&&value&&typeof value==='object'&&'id' in value)return value.id;
  if(field==='manufacturerPartNumber')return value??'';
  return canonical(value);
}
// Identity is fixed from creation, so an admin edit can never race the first
// receipt and silently reassign physical units to a different configuration.
export const protectSkuIdentity:CollectionBeforeChangeHook=({operation,data,originalDoc})=>{
  if(operation==='update')for(const field of ['skuCode','product','manufacturerPartNumber','configuration']){
    if(field in data&&JSON.stringify(identityValue(field,data[field]))!==JSON.stringify(identityValue(field,originalDoc[field])))throw new Error('SKU identity is immutable. Create a new SKU for a different product, part number or configuration; the existing SKU can be deactivated.');
  }
  return data;
};
