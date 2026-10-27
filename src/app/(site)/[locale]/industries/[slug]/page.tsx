import {pageMetadata} from '@/lib/page-metadata';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/catalogue';
import {industries} from '@/content/industry-pages';
import {siteOrigin} from '@/lib/site-policy.mjs';
import {buildIndustryPageSchema} from '@/lib/seo-page-schema';
export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}){const {locale,slug}=await params;const item=industries.find(x=>x.id===slug);if(!item||!isLocale(locale))notFound();const t=item[locale];return pageMetadata(locale,`/industries/${slug}`,t.title,t.intro);}
export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){
 const {locale,slug}=await params;const item=industries.find(x=>x.id===slug);if(!isLocale(locale)||!item)notFound();const t=item[locale],ar=locale==='ar';
 const schema=buildIndustryPageSchema({locale,origin:siteOrigin(),industry:item});
 return <><section className="industry-hero"><nav className="breadcrumb" aria-label={ar?'مسار الصفحة':'Breadcrumb'}><Link href={`/${locale}`}>{ar?'الرئيسية':'Home'}</Link><span aria-hidden="true"> / </span><span aria-current="page">{t.title}</span></nav><p className="section-kicker">{t.title}</p><h1>{t.headline}</h1><p className="page-intro">{t.intro}</p><Link className="button button-light" href={`/${locale}/rfq`}>{ar?'طلب عرض سعر':'Request a quotation'}</Link></section><section className="section industry-requirements"><h2>{ar?'ما الذي يتطلبه تطبيقك؟':'What does your application need?'}</h2><div className="industry-checks">{t.checks.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div><p className="industry-note">{ar?'تخضع ملاءمة الأدوات والشهادات المطلوبة للمراجعة الفنية لكل طراز وتطبيق.':'Instrument suitability and required certifications must be reviewed for each model and application.'}</p><Link className="text-link" href={`/${locale}/products?application=${slug}`}>{ar?'تصفح الأدوات حسب التطبيق':'Browse instruments by application'}<span aria-hidden="true">↗</span></Link></section><section className="section seo-faq" aria-labelledby="industry-faq-heading"><h2 id="industry-faq-heading">{ar?'أسئلة شائعة':'Frequently asked questions'}</h2><div>{t.faqs.map(faq=><details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\u003c')}}/></>;
}
