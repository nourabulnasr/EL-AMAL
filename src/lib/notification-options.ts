type OptionSnapshot={model:string;quantity:number;optionId?:string|null;optionNameEn?:string|null;optionNameAr?:string|null;optionModel?:string|null};
const safe=(value:unknown,max:number):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value);
// Input is immutable, server-resolved enquiry history, never HTTP body or current product data.
// Only reviewed connection choices are summarized. Contact details, notes and files stay in admin.
export function notificationOptionSummary(items:OptionSnapshot[]):string{
 return items.slice(0,100).filter(item=>['bottom-connection','back-connection'].includes(item.optionId??'')&&safe(item.model,120)&&safe(item.optionNameEn,200)&&safe(item.optionNameAr,200)&&Number.isSafeInteger(item.quantity)&&item.quantity>0&&item.quantity<=9999&&(!item.optionModel||safe(item.optionModel,120)))
  .map(item=>(item.optionModel??item.model)+' | '+item.optionNameEn+' / '+item.optionNameAr+' | Quantity: '+item.quantity).join('\n');
}
