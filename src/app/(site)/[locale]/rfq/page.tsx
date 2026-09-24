import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/catalogue';
import {DirectRFQ} from '@/components/direct-rfq';
import {businessContact} from '@/lib/business-contact';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return {title:locale==='ar'?'طلب عرض سعر':'Request a quotation',alternates:{languages:{en:'/en/rfq',ar:'/ar/rfq'}}};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <section className="quote-page"><h1>{locale==='ar'?'طلب عرض سعر':'Request a quotation'}</h1><DirectRFQ locale={locale} whatsapp={businessContact().whatsapp}/></section>;}
