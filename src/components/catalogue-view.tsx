import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {searchProducts} from '@/lib/catalogue';
import {loadCatalogue} from '@/lib/load-catalogue';
import {copy} from '@/content/copy';
import {ProductCard} from './product-card';

export async function CatalogueView({locale,query='',category=''}:{locale:Locale;query?:string;category?:string}){
 const {products,categories,source}=await loadCatalogue();
 const t=copy[locale],ar=locale==='ar',results=searchProducts(products,query,category);
 const selected=categories.find(c=>c.id===category);
 const link=(q:string,c:string)=>`/${locale}/products?${new URLSearchParams({...q?{q}:{},...c?{category:c}:{}})}`;
 return <>
  <div className="catalogue-heading"><p className="breadcrumb"><Link href={`/${locale}`}>{t.home}</Link> / {t.catalogue}</p>
   <div className="catalogue-title-row"><h1>{selected?.name[locale]??(ar?'لكل قياس،\nأداته.':'For every measure,\nan instrument.')}</h1><p>{ar?'ابدأ بالطراز أو فئة القياس. اجمع متطلباتك، ثم أكد التفاصيل الفنية.':'Start with a model or a measurement category. Build your requirement, then confirm the technical details.'}</p></div>
   <nav className="category-tabs" aria-label={ar?'فئات المنتجات':'Product categories'}><Link href={link(query,'')} aria-current={!category?'page':undefined}>{t.all}<span>{products.length}</span></Link>{categories.map(c=><Link key={c.id} href={link(query,c.id)} aria-current={category===c.id?'page':undefined}>{c.name[locale]}<span>{products.filter(p=>p.category===c.id).length}</span></Link>)}</nav>
  </div>
  <section className="catalogue-layout">
   <form className="catalogue-filter" action={`/${locale}/products`}><h2>{ar?'حدد ما تحتاجه':'Find your instrument'}</h2><label htmlFor="catalogue-query">{t.search}</label><input type="search" id="catalogue-query" name="q" defaultValue={query} maxLength={120} placeholder={ar?'مثال: DEMO-P1':'e.g. DEMO-P1'}/><label htmlFor="category">{t.category}</label><select id="category" name="category" defaultValue={category}><option value="">{t.all}</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name[locale]}</option>)}</select><button className="button button-dark">{t.apply}<span aria-hidden="true">↗</span></button>{(query||category)&&<Link className="reset-link" href={`/${locale}/products`}>{t.reset}</Link>}<p className="filter-note">{ar?'لديك متطلبات خاصة؟ اختر أقرب طراز وأضف تفاصيل التطبيق في معاينة الاستفسار.':'Have a specific application? Select the closest model and add your requirements in the enquiry preview.'}</p></form>
   <div><div className="results-toolbar"><p className="result-count" role="status">{results.length} {ar?t.results:results.length===1?'instrument':'instruments'}{query&&<> · “{query}”</>}</p><span>{ar?'التوفر يحتاج إلى تأكيد':'Availability on enquiry'}</span></div>
    {(query||category)&&<div className="active-filters" aria-label={ar?'الفلاتر الحالية':'Active filters'}>{query&&<Link href={link('',category)} aria-label={`${ar?'إزالة البحث':'Remove search'}: ${query}`}>{query} <span aria-hidden="true">×</span></Link>}{category&&<Link href={link(query,'')} aria-label={ar?'إزالة فلتر الفئة':'Remove category filter'}>{selected?.name[locale]??category} <span aria-hidden="true">×</span></Link>}</div>}
    {results.length?<div className="product-grid">{results.map(p=><ProductCard key={p.id} product={p} locale={locale} demo={source==='demo'}/>)}</div>:<div className="empty-state catalogue-empty"><span className="empty-symbol" aria-hidden="true">⌕</span><h2>{products.length?t.empty:(ar?'الكتالوج قيد الإعداد.':'The catalogue is being prepared.')}</h2><p>{products.length?(ar?'جرب رقم طراز أقصر أو أزل فلتر الفئة لعرض المزيد من الأدوات.':'Try a shorter model reference or remove a category filter to broaden your search.'):(ar?'ستظهر الأدوات هنا بعد مراجعة معلوماتها ونشرها.':'Instruments will appear here after their information has been reviewed and published.')}</p>{products.length>0&&<Link href={`/${locale}/products`} className="button button-dark">{t.reset}</Link>}</div>}
   </div>
  </section>
 </>;
}
