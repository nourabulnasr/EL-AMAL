import {pageMetadata} from '@/lib/page-metadata';
import {notFound} from 'next/navigation';
import {loadCatalogue} from '@/lib/load-catalogue';
import {isLocale,paginateProducts} from '@/lib/catalogue';
import {cataloguePath} from '@/lib/seo-discovery';
import {CatalogueView} from '@/components/catalogue-view';
type Props={params:Promise<{locale:string;slug:string}>;searchParams:Promise<{page?:string}>};
export async function generateMetadata({params,searchParams}:Props){
 const {products,categories}=await loadCatalogue(),{locale,slug}=await params;
 const category=categories.find(c=>c.id===slug);if(!isLocale(locale)||!category)notFound();
 const {page}=paginateProducts(products.filter(product=>product.category===slug),(await searchParams).page);
 const title=category.name[locale]+(page>1?` · ${locale==='ar'?'الصفحة':'Page'} ${page}`:'');
 return pageMetadata(locale,cataloguePath({category:slug,page}),title,category.description[locale]);
}
export default async function Page({params,searchParams}:Props){const {categories}=await loadCatalogue();const {locale,slug}=await params;if(!isLocale(locale)||!categories.some(c=>c.id===slug))notFound();const {page}=await searchParams;return <CatalogueView locale={locale} category={slug} page={typeof page==='string'?page:''} categoryRoute/>;}
