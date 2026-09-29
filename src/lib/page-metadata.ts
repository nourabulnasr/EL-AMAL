import type {Metadata} from 'next';
import type {Locale} from './catalogue.ts';
import {siteOrigin,indexingEnabled,publicPathIndexable} from './site-policy.mjs';
export function pageMetadata(locale:Locale,path:string,title:string,description:string):Metadata{
 const origin=siteOrigin(),url=`${origin}/${locale}${path}`,image=`${origin}/social-image`;
 return {title:path===''?{absolute:`EL AMAL | ${title}`}:title,description,alternates:{canonical:url,languages:{en:`${origin}/en${path}`,ar:`${origin}/ar${path}`,'x-default':`${origin}/en${path}`}},
 robots:{index:indexingEnabled()&&publicPathIndexable(path),follow:indexingEnabled()&&!/^\/(quote|rfq|verify)([/?]|$)/.test(path)},
 openGraph:{type:'website',siteName:'EL AMAL',title,description,url,locale:locale==='ar'?'ar_EG':'en_GB',alternateLocale:locale==='ar'?'en_GB':'ar_EG',images:[{url:image,width:1200,height:630,alt:locale==='ar'?'الأمل — أجهزة القياس الصناعية':'EL AMAL — Industrial instrumentation'}]},
 twitter:{card:'summary_large_image',title,description,images:[image]}};
}
