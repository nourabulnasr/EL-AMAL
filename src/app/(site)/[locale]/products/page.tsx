import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/catalogue';
import {CatalogueView} from '@/components/catalogue-view';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return {title:locale==='ar'?'كتالوج الأدوات':'Instrument catalogue'};}
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{q?:string;category?:string;type?:string;application?:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const s=await searchParams;
 return <CatalogueView locale={locale} query={typeof s.q==='string'?s.q.slice(0,120):''} category={typeof s.category==='string'?s.category:''} instrumentType={typeof s.type==='string'?s.type:''} application={typeof s.application==='string'?s.application:''}/>;
}
