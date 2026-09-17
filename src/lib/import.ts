type ProductRow = {external_id:string; model:string; category_key:string; name_en:string; name_ar:string; description_en:string; description_ar:string; source_ref:string; review_status:string};
type SKURow = {sku_code:string; product_external_id:string; configuration_json:string; opening_on_hand:number; stock_checked_at:string};
export function validateImport(products:ProductRow[], skus:SKURow[], categories:string[]):string[] {
  const errors:string[] = [], ids = new Set<string>(), skuIds = new Set<string>();
  products.forEach((p,i)=>{
    const prefix = `Product row ${i+1}`;
    for(const field of ['external_id','model','name_en','name_ar','description_en','description_ar','source_ref'] as const) if(typeof p[field] !== 'string' || !p[field].trim()) errors.push(`${prefix}: missing ${field}`);
    if(ids.has(p.external_id)) errors.push(`${prefix}: duplicate external_id`);
    ids.add(p.external_id);
    if(!categories.includes(p.category_key)) errors.push(`${prefix}: unknown category`);
    if(!['draft','reviewed'].includes(p.review_status)) errors.push(`${prefix}: publication must go through staff review`);
  });
  skus.forEach((s,i)=>{
    const prefix=`SKU row ${i+1}`;
    if(!s.sku_code?.trim() || skuIds.has(s.sku_code)) errors.push(`${prefix}: missing or duplicate sku_code`);
    skuIds.add(s.sku_code);
    if(!ids.has(s.product_external_id)) errors.push(`${prefix}: unknown product`);
    if(!Number.isSafeInteger(s.opening_on_hand) || s.opening_on_hand < 0) errors.push(`${prefix}: invalid opening stock`);
    if(!s.stock_checked_at || !Number.isFinite(Date.parse(s.stock_checked_at))) errors.push(`${prefix}: invalid stock_checked_at`);
    try { const config=JSON.parse(s.configuration_json); if(!config || Array.isArray(config) || typeof config !== 'object') throw new Error(); } catch {errors.push(`${prefix}: invalid configuration_json`);}
  });
  return errors;
}
