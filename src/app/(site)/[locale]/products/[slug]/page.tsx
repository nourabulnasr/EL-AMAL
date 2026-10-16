import Link from 'next/link';
import {notFound} from 'next/navigation';
import {BidiText} from '@/components/bidi-text';
import {ProductImage} from '@/components/product-image';
import {ProductAvailability} from '@/components/product-availability';
import {AddToQuote} from '@/components/add-to-quote';
import {RelatedProducts} from '@/components/related-products';
import {ProductDetailSearch} from '@/components/product-detail-search';
import {productSchema,schemaJson} from '@/lib/product-schema';
import {pageMetadata} from '@/lib/page-metadata';
import {loadCatalogue} from '@/lib/load-catalogue';
import {isLocale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {industries} from '@/content/product-options';
import {getIndustryUseNote} from '@/lib/product-industries';
import '@/components/product-detail.css';

export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}){
 const {products}=await loadCatalogue();
 const {locale,slug}=await params;
 const p=products.find(product=>product.id===slug);
 if(!isLocale(locale)||!p)notFound();
 return pageMetadata(locale,`/products/${p.id}`,`${p.model} · ${p.name[locale]}`,p.description[locale]);
}

export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){
 const {products,categories,source}=await loadCatalogue();
 const {locale,slug}=await params;
 const p=products.find(product=>product.id===slug);
 if(!isLocale(locale)||!p)notFound();
 const t=copy[locale];
 const category=categories.find(item=>item.id===p.category);
 // Keep the same concise, unabridged facts in both languages; the full table remains below.
 const keySpecifications=p.details?.specifications.filter(spec=>spec.value.en.length<=180&&spec.value.ar.length<=180).slice(0,2)??[];
 const scopes=industries.filter(industry=>p.applications?.includes(industry.id));
 const industryNotes=[...new Set(scopes.filter(industry=>industry.id==='pharmaceuticals'||industry.id==='food-beverage').map(industry=>getIndustryUseNote(p,industry.id,locale)).filter(Boolean))];

 return <div className="product-page product-page-compact" data-interest-product={source==='cms'?p.id:undefined} data-interest-locale={locale} data-interest-list="detail">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:schemaJson(productSchema(p,locale,source))}}/>
  <p className="breadcrumb"><Link href={`/${locale}`}>{t.home}</Link> / <Link href={`/${locale}/products`}>{t.catalogue}</Link> / <bdi>{p.model}</bdi></p>
  <ProductDetailSearch locale={locale}/>
  <div className="product-detail detail-layout">
   <header className="detail-copy detail-overview">
    <Link className="section-kicker" href={`/${locale}/categories/${p.category}`}>{category?.name[locale]}</Link>
    <p className="model"><bdi dir="ltr">{p.model}</bdi></p>
    <h1 data-interest-observe="">{p.name[locale]}</h1>
    <p className="detail-description"><BidiText>{p.description[locale]}</BidiText></p>
    {keySpecifications.length>0&&<dl className="detail-key-specifications" aria-label={locale==='ar'?'مواصفات مختصرة':'Specifications at a glance'}>
     {keySpecifications.map((spec,index)=><div key={index}><dt>{spec.label[locale]}</dt><dd dir="auto"><BidiText>{spec.value[locale]}</BidiText></dd></div>)}
    </dl>}
    <a className="detail-specification-link" href="#technical-specifications">{locale==='ar'?'عرض جميع المواصفات والمستندات الفنية':'View all specifications and technical documents'}<span aria-hidden="true">↓</span></a>
   </header>
   <figure className="detail-visual detail-photo">
    <ProductImage product={p} locale={locale} sizes="(max-width: 899px) 280px, (max-width: 1199px) 32vw, 360px"/>
    <figcaption>{p.details?(locale==='ar'?'صورة المنتج من المصنّع':'Manufacturer product image'):t.illustration}</figcaption>
   </figure>
   <div className="detail-copy detail-purchase">
    <ProductAvailability product={p} locale={locale}/>
    <AddToQuote id={p.id} locale={locale} options={p.details?.options}/>
    <div className="product-assurance">
     <p>{locale==='en'?'Select the model. Confirm the configuration.':'اختر الطراز. وأكد التكوين.'}</p>
     <span>{locale==='en'?'Adding to your basket does not reserve stock or place an order.':'الإضافة إلى السلة لا تحجز مخزوناً ولا تنشئ طلب شراء.'}</span>
    </div>
    <p className="detail-notice">{source==='cms'?(locale==='en'?'Supplied configuration and current availability are confirmed during quotation.':'يُؤكَّد التكوين المورَّد والتوفر الحالي عند إعداد عرض السعر.'):locale==='en'?'This is a sample record, not a product offered for sale. No factory stock is represented.':'هذا سجل تجريبي وليس منتجاً معروضاً للبيع. لا يمثل مخزوناً فعلياً.'}</p>
   </div>
  </div>
  <section className="technical-section" id="technical-specifications" aria-labelledby="technical-heading" tabIndex={-1}>
   <h2 id="technical-heading">{t.technical}</h2>
   {p.details&&<p className="technical-note">{locale==='ar'?'تعرض المواصفات نطاقات وخيارات عائلة الطراز. راجع المستند الفني لتحديد التكوين والاعتمادات المناسبة لتطبيقك.':'Specifications describe the model family’s ranges and options. Refer to the technical document to select the configuration and approvals suitable for your application.'}</p>}
   {p.details?.datasheets.length?<div className="datasheet-links">{p.details.datasheets.map((sheet,index)=><a key={`${sheet.url}-${index}`} className="button button-dark" href={sheet.url} target="_blank" rel="noopener noreferrer" data-interest-kind="datasheet">{locale==='ar'?'المستند الفني':'Technical document'}: {sheet.title} ↗</a>)}</div>:p.datasheetUrl?<a className="button button-dark" href={p.datasheetUrl} target="_blank" rel="noopener noreferrer" data-interest-kind="datasheet">{locale==='ar'?'فتح ورقة البيانات الفنية (المصنّع)':'Open manufacturer datasheet'} ↗</a>:<p>{locale==='ar'?'لم تُرفق ورقة البيانات الفنية لهذا الطراز بعد.':'A datasheet has not been attached to this model yet.'}</p>}
   <dl>
    <div><dt>{locale==='en'?'Model reference':'مرجع الطراز'}</dt><dd><bdi>{p.model}</bdi></dd></div>
    <div><dt>{t.category}</dt><dd>{category?.name[locale]}</dd></div>
    {scopes.length>0&&<div><dt>{locale==='en'?'Industries':'القطاعات'}</dt><dd><nav className="detail-industries" aria-label={locale==='ar'?'منتجات للقطاع نفسه':'Products for the same industry'}>{scopes.map(industry=><Link key={industry.id} href={`/${locale}/products?application=${industry.id}`}>{industry[locale]}</Link>)}</nav>{industryNotes.map(note=><p className="detail-industry-note" key={note}>{note}</p>)}</dd></div>}
    <div><dt>{locale==='en'?'Source status':'حالة المصدر'}</dt><dd>{source==='demo'?t.sample:(locale==='en'?'Reviewed catalogue record':'سجل كتالوج تمت مراجعته')}</dd></div>
    {p.details?.specifications.map((spec,index)=><div key={index}><dt>{spec.label[locale]}</dt><dd dir="auto"><BidiText>{spec.value[locale]}</BidiText></dd></div>)}
   </dl>
  </section>
  <RelatedProducts product={p} products={products} locale={locale} demo={source==='demo'}/>
  <Link className="text-link" href={`/${locale}/products`}>{t.back}</Link>
 </div>;
}
