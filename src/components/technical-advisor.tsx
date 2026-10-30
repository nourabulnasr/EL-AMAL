import type {Locale} from '@/lib/catalogue';
import {technicalAdvisorHiddenFields,type TechnicalFacetGroup,type TechnicalFilters} from '@/lib/technical-facets';

export function TechnicalAdvisor({locale,groups,selected,query,category,instrumentType,application,preserveBase=true}:{
 locale:Locale;groups:TechnicalFacetGroup[];selected:TechnicalFilters;query:string;category:string;instrumentType:string;application:string;preserveBase?:boolean;
}){
 const ar=locale==='ar';
 return <div className="technical-advisor">
  {preserveBase&&<>{technicalAdvisorHiddenFields({query,category,instrumentType,application}).map(field=><input key={field.name} type="hidden" name={field.name} value={field.value}/>)}</>}
  <div className="advisor-heading"><span aria-hidden="true">⌁</span><div><h3>{ar?'المستشار الفني':'Technical advisor'}</h3><p>{ar?'اعرض فقط المواصفات المؤكدة في بيانات كل منتج.':'Narrow by specifications verified in each product record.'}</p></div></div>
  {groups.length?<div className="advisor-groups">{groups.map(group=>{const featured=['material','unit','size'].includes(group.id);return <details key={group.id} className={featured?'advisor-featured':'advisor-secondary'} open={featured}>
   <summary>{group.label[locale]}<span>{group.options.length}</span></summary>
   <div className="advisor-options">{group.options.map(option=><label key={option.id}>
    <input type="checkbox" name={`f-${group.id}`} value={option.id} defaultChecked={selected[group.id]?.includes(option.id)} disabled={option.count===0}/>
    <span>{option.label[locale]}</span><b>{option.count||'—'}</b>
   </label>)}</div>
  </details>})}</div>:<p className="advisor-empty">{ar?'اختر فئة أو نوع أداة لعرض مواصفات فنية متاحة.':'Choose a category or instrument type to reveal available technical criteria.'}</p>}
  {groups.length>0&&<p className="advisor-source-note">{ar?'تعتمد معايير الاختيار على تصنيفات منتجات WIKA الرسمية. الخيارات غير المتاحة في بيانات كتالوج الأمل تظهر معطلة.':'Selection criteria follow the official WIKA product taxonomy. Choices not supported by EL AMAL catalogue records remain visible but disabled.'}</p>}
 </div>;
}
