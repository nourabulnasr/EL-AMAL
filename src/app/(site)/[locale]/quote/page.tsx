import {pageMetadata} from '@/lib/page-metadata';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {QuoteBasket} from '@/components/quote-basket';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return pageMetadata(locale,'/quote',locale==='ar'?'سلة عرض السعر':'Quote basket',locale==='ar'?'راجع الأدوات والكميات التي اخترتها.':'Review your selected instruments and quantities.');}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <section className="quote-page"><h1>{copy[locale].quote}</h1><p className="page-intro">{copy[locale].basketIntro}</p><p><Link className="text-link" href={`/${locale}/rfq`}>{locale==='ar'?'تعرف الطراز؟ ابدأ طلباً مباشراً':'Know your model? Start a direct RFQ'}</Link></p><QuoteBasket locale={locale}/></section>;}
