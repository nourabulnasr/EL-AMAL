import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/catalogue';
import {VerifyEnquiry} from '@/components/verify-enquiry';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return {title:locale==='ar'?'تأكيد الاستفسار':'Confirm your enquiry',robots:{index:false,follow:false},referrer:'no-referrer' as const};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <section className="quote-page"><h1>{locale==='ar'?'تأكيد الاستفسار':'Confirm your enquiry'}</h1><VerifyEnquiry locale={locale}/></section>;}
