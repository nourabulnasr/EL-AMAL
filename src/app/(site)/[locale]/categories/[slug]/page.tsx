import {notFound} from 'next/navigation';
import {categories} from '@/content/catalogue';
import {isLocale} from '@/lib/catalogue';
import {CatalogueView} from '@/components/catalogue-view';
export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}){const {locale,slug}=await params;return {title:categories.find(c=>c.id===slug)?.name[locale==='ar'?'ar':'en']??'Category'};}
export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){const {locale,slug}=await params;if(!isLocale(locale)||!categories.some(c=>c.id===slug))notFound();return <CatalogueView locale={locale} category={slug}/>;}
