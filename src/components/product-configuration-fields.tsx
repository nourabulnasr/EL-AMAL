'use client';
import {useId} from 'react';
import type {Locale} from '@/lib/catalogue';
import {configurationFields,resolveConfiguration,type Configuration,type ConfigProduct} from '@/lib/product-configuration';

export function ProductConfigurationFields({product,locale,value,onChange}:{product:ConfigProduct;locale:Locale;value:Configuration;onChange:(value:Configuration)=>void}){
 const id=useId(),fields=configurationFields(product,value),resolved=resolveConfiguration(product,value),ar=locale==='ar';
 const stale=Object.entries(value).some(([key,selected])=>!fields.some(f=>f.id===key&&f.choices.some(c=>c.id===selected)));
 if(!fields.length)return null;
 return <fieldset className="product-configuration"><legend>{ar?'حدد مواصفات الجهاز':'Configure your instrument'}</legend>
  {stale&&<div role="alert"><p>{ar?'تغيرت المواصفات المتاحة منذ حفظ اختيارك. أعد الاختيار قبل الإرسال.':'Available specifications have changed since this selection was saved. Reconfigure before submitting.'}</p><button type="button" className="text-link" onClick={()=>onChange(resolveConfiguration(product,{}))}>{ar?'إعادة اختيار المواصفات':'Reset configuration'}</button></div>}
  {fields.map((f,index)=>{
   const fixed=f.choices.length===1,disabled=fields.slice(0,index).some(previous=>previous.choices.length>1&&!resolved[previous.id]);
   return <div className="configuration-field" key={f.id}>
    {fixed?<><span>{f.label[locale]}</span><strong><bdi>{f.choices[0].label[locale]}</bdi></strong></>:<><label htmlFor={id+f.id}>{f.label[locale]} <span aria-hidden="true">*</span></label>
    <select id={id+f.id} value={resolved[f.id]??''} required disabled={disabled} onChange={event=>{
     // Reset dependent fields when model/size changes; never silently substitute a different configuration.
     const next:Configuration={};for(const previous of fields.slice(0,index))if(resolved[previous.id])next[previous.id]=resolved[previous.id];
     next[f.id]=event.target.value;onChange(resolveConfiguration(product,next));
    }}><option value="" disabled>{disabled?(ar?'اختر المواصفة السابقة أولاً':'Choose the previous specification first'):(ar?'اختر':'Select')}</option>{f.choices.map(c=><option key={c.id} value={c.id}>{c.label[locale]}</option>)}</select></>}
   </div>;
  })}
  <p className="configuration-hint">{ar?'اختياراتك ستظهر في طلب عرض السعر. أكد التوفر والتوافق الفني مع فريقنا.':'Your choices will appear in the quotation request. Availability and application suitability are confirmed by our team.'}</p>
 </fieldset>;
}
