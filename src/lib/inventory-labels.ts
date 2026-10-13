/** Browser-safe labels preserve submitted connection snapshots for stock allocation. */
export function inventoryLineLabel(line:{model:string;quantity:number;range?:string|null;optionNameEn?:string|null;optionNameAr?:string|null;optionModel?:string|null}){
 const option=[line.optionNameEn,line.optionNameAr,line.optionModel?`Model \u2066${line.optionModel}\u2069`:null].filter(Boolean).join(' / ');
 return [line.model,option||null,`requested ${line.quantity}`,line.range||null].filter(Boolean).join(' · ');
}
