import type {MetadataRoute} from 'next';
import type {Catalogue} from './public-catalogue.ts';
import {paginateProducts,type Locale,type Product} from './catalogue.ts';
import {indexingEnabled,siteOrigin} from './site-policy.mjs';
import {technicalFilterParams,type TechnicalFilters} from './technical-facets.ts';

export function cataloguePath({query='',category='',instrumentType='',application='',technical={},page=1,categoryRoute=true}:{query?:string;category?:string;instrumentType?:string;application?:string;technical?:TechnicalFilters;page?:number;categoryRoute?:boolean}={}){
 const technicalParams=technicalFilterParams(technical);
 const faceted=!!(query||instrumentType||application||technicalParams.size||!categoryRoute);
 const path=category&&!faceted?`/categories/${encodeURIComponent(category)}`:'/products';
 const params=new URLSearchParams({...query?{q:query}:{},...category&&faceted?{category}:{},...instrumentType?{type:instrumentType}:{},...application?{application}:{},...page>1?{page:String(page)}:{}});
 for(const [key,value] of technicalParams)params.append(key,value);
 return `${path}${params.size?`?${params}`:''}`;
}

export function catalogueMetadataState({query='',category='',instrumentType='',application='',technical={},page=1}:{query?:string;category?:string;instrumentType?:string;application?:string;technical?:TechnicalFilters;page?:number}={}){
 const hasTechnical=technicalFilterParams(technical).size>0;
 const filtered=!!(query||category||instrumentType||application||hasTechnical);
 const visiblePath=cataloguePath({query,category,instrumentType,application,technical,page,categoryRoute:false});
 const canonicalPath=filtered
  ? cataloguePath({category,page:query||instrumentType||application||hasTechnical?1:page})
  : cataloguePath({page});
 return {filtered,visiblePath,canonicalPath};
}

export function buildCatalogueSitemap(catalogue:Catalogue,env:Record<string,string|undefined>=process.env):MetadataRoute.Sitemap{
 if(!indexingEnabled(env)||catalogue.source!=='cms')return [];
 const origin=siteOrigin(env),{products,categories}=catalogue;
 const entries:{path:string;image?:string}[]=['','/about','/contact','/resources','/industries/oil-gas','/industries/pharmaceuticals','/industries/food-beverage','/industries/general-industry','/solutions','/solutions/pressure-instruments-egypt','/solutions/temperature-instruments-egypt','/solutions/wika-instruments-egypt'].map(path=>({path}));
 const addPages=(items:unknown[],category='')=>{
  for(let page=1;page<=paginateProducts(items,'').pages;page++)entries.push({path:cataloguePath({category,page})});
 };
 addPages(products);
 for(const category of categories){const items=products.filter(product=>product.category===category.id);if(items.length)addPages(items,category.id);}
 for(const product of products)entries.push({path:`/products/${encodeURIComponent(product.id)}`,image:product.details?.image.src});
 return entries.flatMap(({path,image})=>['en','ar'].map(locale=>({
  url:`${origin}/${locale}${path}`,
  alternates:{languages:{en:`${origin}/en${path}`,ar:`${origin}/ar${path}`,'x-default':`${origin}/en${path}`}},
  ...(image?{images:[new URL(image,origin).href]}:{}),
 })));
}

export function collectionSchema({locale,path,title,items,start=1}:{locale:Locale;path:string;title:string;items:Product[];start?:number}){
 const origin=siteOrigin(),url=`${origin}/${locale}${path}`;
 return {'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage','@id':`${url}#page`,url,name:title,inLanguage:locale,isPartOf:{'@id':`${origin}/#website`},mainEntity:{
   '@type':'ItemList',numberOfItems:items.length,itemListElement:items.map((product,index)=>({
    '@type':'ListItem',position:start+index,url:`${origin}/${locale}/products/${encodeURIComponent(product.id)}`,name:`${product.model} · ${product.name[locale]}`,
   })),
  }},
  {'@type':'BreadcrumbList',itemListElement:[
   {'@type':'ListItem',position:1,name:locale==='ar'?'الرئيسية':'Home',item:`${origin}/${locale}`},
   {'@type':'ListItem',position:2,name:title,item:url},
  ]},
 ]};
}
