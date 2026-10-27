import Link from 'next/link';
import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/catalogue';
import {pageMetadata} from '@/lib/page-metadata';
import {siteOrigin} from '@/lib/site-policy.mjs';
import {seoGuides} from '@/content/seo-guides';

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();
 return pageMetadata(locale,'/solutions',locale==='ar'?'حلول قياس الضغط والحرارة في مصر':'Pressure & temperature measurement solutions in Egypt',locale==='ar'?'أدلة عملية لاختيار أجهزة قياس الضغط والحرارة والوصول إلى منتجات WIKA وطلب عروض الأسعار من الأمل في مصر.':'Practical guides to pressure and temperature instruments, WIKA product discovery and reviewed quotation enquiries from EL AMAL in Egypt.');
}

export default async function Solutions({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const ar=locale==='ar',origin=siteOrigin();
 const schema={'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':`${origin}/${locale}/solutions#page`,url:`${origin}/${locale}/solutions`,name:ar?'حلول القياس الصناعي':'Industrial measurement solutions',description:ar?'أدلة أجهزة الضغط والحرارة ومنتجات WIKA في مصر.':'Guides to pressure, temperature and WIKA instrumentation in Egypt.',inLanguage:ar?'ar-EG':'en-EG',mainEntity:{'@type':'ItemList',itemListElement:seoGuides.map((guide,index)=>({'@type':'ListItem',position:index+1,url:`${origin}/${locale}/solutions/${guide.id}`,name:guide[locale].metaTitle}))}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:ar?'الرئيسية':'Home',item:`${origin}/${locale}`},{'@type':'ListItem',position:2,name:ar?'حلول القياس':'Measurement solutions',item:`${origin}/${locale}/solutions`}]}]};
 return <><section className="industry-hero"><nav className="breadcrumb" aria-label={ar?'مسار الصفحة':'Breadcrumb'}><Link href={`/${locale}`}>{ar?'الرئيسية':'Home'}</Link><span aria-hidden="true"> / </span><span aria-current="page">{ar?'حلول القياس':'Measurement solutions'}</span></nav><p className="section-kicker">{ar?'أدلة فنية وتجارية':'Technical and commercial guides'}</p><h1>{ar?'اعثر على الأداة من خلال مهمة القياس.':'Find the instrument through the measurement duty.'}</h1><p className="page-intro">{ar?'ابدأ بنوع القياس أو مرجع WIKA، ثم انتقل من معلومات الطراز إلى طلب عرض سعر منظم تراجع فيه الأمل التكوين والتوفر والتفاصيل التجارية.':'Start with the measurement type or a WIKA reference, then move from model information to a structured quotation enquiry where EL AMAL reviews configuration, availability and commercial details.'}</p></section><section className="section industry-requirements"><h2>{ar?'اختر نقطة البداية':'Choose where to begin'}</h2><div className="industry-checks solution-index">{seoGuides.map(guide=><article key={guide.id}><h3>{guide[locale].metaTitle}</h3><div><p>{guide[locale].metaDescription}</p><Link className="text-link" href={`/${locale}/solutions/${guide.id}`}>{ar?'اقرأ الدليل':'Read the guide'}<span aria-hidden="true">↗</span></Link></div></article>)}</div></section><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\u003c')}}/></>;
}
