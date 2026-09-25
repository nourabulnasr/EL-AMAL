import {pageMetadata} from '@/lib/page-metadata';
import {notFound} from 'next/navigation';
import {loadCatalogue} from '@/lib/load-catalogue';
import {isLocale} from '@/lib/catalogue';
import {CatalogueView} from '@/components/catalogue-view';
export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}){const {categories}=await loadCatalogue();const {locale,slug}=await params;const category=categories.find(c=>c.id===slug);if(!isLocale(locale)||!category)notFound();return pageMetadata(locale,`/categories/${slug}`,category.name[locale],category.description[locale]);}
export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){const {products,categories,source}=await loadCatalogue();const {locale,slug}=await params;if(!isLocale(locale)||!categories.some(c=>c.id===slug))notFound();return <CatalogueView locale={locale} category={slug}/>;}
