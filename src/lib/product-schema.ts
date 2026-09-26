import type {Product,Locale} from './catalogue.ts';
import {siteOrigin} from './site-policy.mjs';
export function productSchema(product:Product,locale:Locale,source:'demo'|'cms'){
 const origin=siteOrigin(),url=`${origin}/${locale}/products/${product.id}`;
 const page={'@type':'WebPage','@id':`${url}#page`,url,name:product.name[locale],description:product.description[locale],inLanguage:locale};
 const breadcrumbs={'@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:locale==='ar'?'الرئيسية':'Home',item:`${origin}/${locale}`},
  {'@type':'ListItem',position:2,name:locale==='ar'?'المنتجات':'Products',item:`${origin}/${locale}/products`},
  {'@type':'ListItem',position:3,name:product.name[locale],item:url},
 ]};
 // Sample records are never represented as products offered by this business.
 return {'@context':'https://schema.org','@graph':[page,breadcrumbs,...(source==='cms'?[{
  '@type':'Product','@id':`${url}#product`,url,name:product.name[locale],description:product.description[locale],model:product.model,
 }]:[])]};
}
export function schemaJson(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
