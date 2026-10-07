import {instrumentTypes,applications} from '@/content/product-options';
import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {searchProducts,paginateProducts} from '@/lib/catalogue';
import {loadCatalogue} from '@/lib/load-catalogue';
import {copy} from '@/content/copy';
import {ProductCard} from './product-card';
import {cataloguePath,collectionSchema} from '@/lib/seo-discovery';
import {schemaJson} from '@/lib/product-schema';

export async function CatalogueView({locale,query='',category='',instrumentType='',application='',page='',categoryRoute=false}:{locale:Locale;query?:string;category?:string;instrumentType?:string;application?:string;page?:string;categoryRoute?:boolean}){
 const {products,categories,source}=await loadCatalogue();
 const t=copy[locale],ar=locale==='ar',results=searchProducts(products,query,category,instrumentType,application);
 const pagination=paginateProducts(results,page);
 const selected=categories.find(c=>c.id===category);
 const link=(q:string,c:string,p=1)=>`/${locale}${cataloguePath({query:q,category:c,instrumentType,application,page:p})}`;
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:schemaJson(collectionSchema({locale,path:cataloguePath({query,category,instrumentType,application,page:pagination.page,categoryRoute}),title:selected?.name[locale]??t.catalogue,items:pagination.items,start:pagination.start}))}}/>
  <div className="catalogue-heading"><p className="breadcrumb"><Link href={`/${locale}`}>{t.home}</Link> / {t.catalogue}</p>
   <div className="catalogue-title-row"><h1>{selected?.name[locale]??(ar?'لكل قياس،\nأداته.':'For every measure,\nan instrument.')}</h1><p>{ar?'ابدأ بالطراز أو فئة القياس. اجمع متطلباتك، ثم أكد التفاصيل الفنية.':'Start with a model or a measurement category. Build your requirement, then confirm the technical details.'}</p></div>
   <nav className="category-tabs" aria-label={ar?'فئات المنتجات':'Product categories'}><Link href={link(query,'')} aria-current={!category?'page':undefined}>{t.all}<span>{products.length}</span></Link>{categories.map(c=><Link key={c.id} href={link(query,c.id)} aria-current={category===c.id?'page':undefined}>{c.name[locale]}<span>{products.filter(p=>p.category===c.id).length}</span></Link>)}</nav>
  </div>
  <section className="catalogue-layout">
   <form key={`${query}:${category}:${instrumentType}:${application}`} className="catalogue-filter" action={`/${locale}/products`}><h2>{ar?'حدد ما تحتاجه':'Find your instrument'}</h2><label htmlFor="catalogue-query">{t.search}</label><input type="search" id="catalogue-query" name="q" defaultValue={query} maxLength={120} placeholder={source==='cms'?(ar?'مثال: PSM01':'e.g. PSM01'):(ar?'مثال: DEMO-P1':'e.g. DEMO-P1')}/><label htmlFor="category">{t.category}</label><select id="category" name="category" defaultValue={category}><option value="">{t.all}</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name[locale]}</option>)}</select>{[{name:'type',label:ar?'نوع الأداة':'Instrument type',value:instrumentType,options:instrumentTypes},{name:'application',label:ar?'التطبيق':'Application',value:application,options:applications}].map(filter=><div className="extra-filter" key={filter.name}><label htmlFor={`filter-${filter.name}`}>{filter.label}</label><select id={`filter-${filter.name}`} name={filter.name} defaultValue={filter.value}><option value="">{t.all}</option>{filter.options.map(option=><option key={option.id} value={option.id}>{option[locale]}</option>)}</select></div>)}<button className="button button-dark">{t.apply}<span aria-hidden="true">↗</span></button>{(query||category||instrumentType||application)&&<Link className="reset-link" href={`/${locale}/products`}>{t.reset}</Link>}<Link className="text-link" href={`/${locale}/rfq`}>{ar?'تعرف الطراز؟ اطلب عرض سعر':'Know the model? Request a quote'}</Link><p className="filter-note">{ar?'الطراز غير موجود؟ أدخله مباشرة مع الكمية ونطاق القياس في طلب عرض السعر.':'Model not listed? Enter it directly with the quantity and measurement range in the RFQ.'}</p></form>
   <div><div className="results-toolbar"><p className="result-count" role="status">{pagination.start}–{pagination.end} {ar?'من':'of'} {results.length} {ar?t.results:results.length===1?'instrument':'instruments'}{query&&<> · “{query}”</>}</p><span>{ar?'التوفر يحتاج إلى تأكيد':'Availability on enquiry'}</span></div>
    {(query||category||instrumentType||application)&&<div className="active-filters" aria-label={ar?'الفلاتر الحالية':'Active filters'}>{instrumentType&&<span>{instrumentTypes.find(x=>x.id===instrumentType)?.[locale]??instrumentType}</span>}{application&&<span>{applications.find(x=>x.id===application)?.[locale]??application}</span>}{query&&<Link href={link('',category)} aria-label={`${ar?'إزالة البحث':'Remove search'}: ${query}`}>{query} <span aria-hidden="true">×</span></Link>}{category&&<Link href={link(query,'')} aria-label={ar?'إزالة فلتر الفئة':'Remove category filter'}>{selected?.name[locale]??category} <span aria-hidden="true">×</span></Link>}</div>}
    {results.length?<div className="product-grid">{pagination.items.map(p=><ProductCard key={p.id} product={p} locale={locale} demo={source==='demo'} list={query?'search':category?'category':'catalogue'}/>)}</div>:<div className="empty-state catalogue-empty"><span className="empty-symbol" aria-hidden="true">⌕</span><h2>{products.length?t.empty:(ar?'الكتالوج قيد الإعداد.':'The catalogue is being prepared.')}</h2><p>{products.length?(ar?'جرب رقم طراز أقصر أو أزل فلتر الفئة لعرض المزيد من الأدوات.':'Try a shorter model reference or remove a category filter to broaden your search.'):(ar?'ستظهر الأدوات هنا بعد مراجعة معلوماتها ونشرها.':'Instruments will appear here after their information has been reviewed and published.')}</p>{products.length>0&&<Link href={`/${locale}/products`} className="button button-dark">{t.reset}</Link>}</div>}
    {pagination.pages>1&&<nav className="catalogue-pagination" aria-label={ar?'صفحات الكتالوج':'Catalogue pages'}>{pagination.page>1&&<Link href={link(query,category,pagination.page-1)} rel="prev">{ar?'السابق':'Previous'}</Link>}<span>{ar?'الصفحة':'Page'} {pagination.page} {ar?'من':'of'} {pagination.pages}</span>{pagination.page<pagination.pages&&<Link href={link(query,category,pagination.page+1)} rel="next">{ar?'التالي':'Next'}</Link>}</nav>}
   </div>
  </section>
 </>;
}
