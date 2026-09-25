import type {Metadata} from 'next';
import type {Locale} from './catalogue.ts';
import {siteOrigin,indexingEnabled} from './site-policy.mjs';
export function pageMetadata(locale:Locale,path:string,title:string,description:string):Metadata{
 const origin=siteOrigin(),url=`${origin}/${locale}${path}`;
 return {title,description,alternates:{canonical:url,languages:{en:`${origin}/en${path}`,ar:`${origin}/ar${path}`}},
 robots:{index:indexingEnabled()&&path!=='/quote',follow:indexingEnabled()},
 openGraph:{type:'website',siteName:'EL AMAL',title,description,url,locale:locale==='ar'?'ar_EG':'en_GB',alternateLocale:locale==='ar'?'en_GB':'ar_EG'},
 twitter:{card:'summary',title,description}};
}
