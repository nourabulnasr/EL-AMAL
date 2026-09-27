import {pageMetadata} from '@/lib/page-metadata';
import {notFound} from 'next/navigation';
import {isLocale,searchProducts,paginateProducts} from '@/lib/catalogue';
import {loadCatalogue} from '@/lib/load-catalogue';
import {indexingEnabled} from '@/lib/site-policy.mjs';
import {CatalogueView} from '@/components/catalogue-view';
type Search={q?:string;category?:string;type?:string;application?:string;page?:string};
export async function generateMetadata({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<Search>}){
 const {locale}=await params;if(!isLocale(locale))notFound();
 const s=await searchParams,{products}=await loadCatalogue();
 const query=typeof s.q==='string'?s.q.slice(0,120):'',category=typeof s.category==='string'?s.category:'',type=typeof s.type==='string'?s.type:'',application=typeof s.application==='string'?s.application:'';
 const {page}=paginateProducts(searchProducts(products,query,category,type,application),s.page);
 const filters=new URLSearchParams({...query?{q:query}:{},...category?{category}:{},...type?{type}:{},...application?{application}:{},...page>1?{page:String(page)}:{}});
 const path=`/products${filters.size?`?${filters}`:''}`;
 const title=(locale==='ar'?'كتالوج الأدوات':'Instrument catalogue')+(page>1?` · ${locale==='ar'?'الصفحة':'Page'} ${page}`:'');
 const metadata=pageMetadata(locale,path,title,locale==='ar'?'ابحث بالطراز ونوع الأداة والتطبيق.':'Search instruments by model, type and application.');
 if(query||category||type||application)metadata.robots={index:false,follow:indexingEnabled()};
 return metadata;
}
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{q?:string;category?:string;type?:string;application?:string;page?:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const s=await searchParams;
 return <CatalogueView page={typeof s.page==='string'?s.page:''} locale={locale} query={typeof s.q==='string'?s.q.slice(0,120):''} category={typeof s.category==='string'?s.category:''} instrumentType={typeof s.type==='string'?s.type:''} application={typeof s.application==='string'?s.application:''}/>;
}
