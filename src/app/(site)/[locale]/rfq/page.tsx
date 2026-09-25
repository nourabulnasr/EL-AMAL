import {pageMetadata} from '@/lib/page-metadata';
import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/catalogue';
import {DirectRFQ} from '@/components/direct-rfq';
import {businessContact} from '@/lib/business-contact';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return pageMetadata(locale,'/rfq',locale==='ar'?'طلب عرض سعر':'Request a quotation',locale==='ar'?'حدد الطراز والكمية ونطاق القياس لطلب عرض سعر.':'Specify your model, quantity and measurement range for a quotation request.');}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <section className="quote-page"><h1>{locale==='ar'?'طلب عرض سعر':'Request a quotation'}</h1><DirectRFQ locale={locale} whatsapp={businessContact().whatsapp}/></section>;}
