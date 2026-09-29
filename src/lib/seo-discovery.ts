import type {MetadataRoute} from 'next';
import type {Catalogue} from './public-catalogue.ts';
import {paginateProducts,type Locale,type Product} from './catalogue.ts';
import {indexingEnabled,siteOrigin} from './site-policy.mjs';

export function cataloguePath({query='',category='',instrumentType='',application='',page=1,categoryRoute=true}:{query?:string;category?:string;instrumentType?:string;application?:string;page?:number;categoryRoute?:boolean}={}){
 const faceted=!!(query||instrumentType||application||!categoryRoute);
 const path=category&&!faceted?`/categories/${encodeURIComponent(category)}`:'/products';
 const params=new URLSearchParams({...query?{q:query}:{},...category&&faceted?{category}:{},...instrumentType?{type:instrumentType}:{},...application?{application}:{},...page>1?{page:String(page)}:{}});
 return `${path}${params.size?`?${params}`:''}`;
}

export function buildCatalogueSitemap(catalogue:Catalogue,env:Record<string,string|undefined>=process.env):MetadataRoute.Sitemap{
 if(!indexingEnabled(env)||catalogue.source!=='cms')return [];
 const origin=siteOrigin(env),{products,categories}=catalogue;
 const entries:{path:string;image?:string}[]=['','/about','/contact','/resources','/industries/oil-gas','/industries/general-industry'].map(path=>({path}));
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
