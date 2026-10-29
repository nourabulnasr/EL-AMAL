import {pageMetadata} from '@/lib/page-metadata';
import {notFound} from 'next/navigation';
import {isLocale,searchProducts,paginateProducts} from '@/lib/catalogue';
import {loadCatalogue} from '@/lib/load-catalogue';
import {indexingEnabled} from '@/lib/site-policy.mjs';
import {CatalogueView} from '@/components/catalogue-view';
import {parseTechnicalFilters} from '@/lib/technical-facets';
import {catalogueMetadataState} from '@/lib/seo-discovery';
type Search=Record<string,string|string[]|undefined>;
const scalar=(value:string|string[]|undefined,max=160)=>typeof value==='string'?value.slice(0,max):'';
export async function generateMetadata({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<Search>}){
 const {locale}=await params;if(!isLocale(locale))notFound();
 const s=await searchParams,{products}=await loadCatalogue();
 const query=scalar(s.q,120),category=scalar(s.category),type=scalar(s.type),application=scalar(s.application),technical=parseTechnicalFilters(s);
 const {page}=paginateProducts(searchProducts(products,query,category,type,application,technical),scalar(s.page));
 const state=catalogueMetadataState({query,category,instrumentType:type,application,technical,page});
 const title=(locale==='ar'?'كتالوج الأدوات':'Instrument catalogue')+(page>1?` · ${locale==='ar'?'الصفحة':'Page'} ${page}`:'');
 const metadata=pageMetadata(locale,state.canonicalPath,title,locale==='ar'?'ابحث بالطراز ونوع الأداة والتطبيق والمواصفات الفنية المؤكدة.':'Search by model, instrument type, application and verified technical specifications.');
 if(state.filtered||Object.keys(s).some(key=>key!=='page'))metadata.robots={index:false,follow:indexingEnabled()};
 return metadata;
}
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<Search>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const s=await searchParams;
 return <CatalogueView page={scalar(s.page)} locale={locale} query={scalar(s.q,120)} category={scalar(s.category)} instrumentType={scalar(s.type)} application={scalar(s.application)} technical={parseTechnicalFilters(s)}/>;
}
