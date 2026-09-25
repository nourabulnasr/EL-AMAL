import {siteOrigin} from '@/lib/site-policy.mjs';
import type {Locale} from '@/lib/catalogue';
export function SiteSchema({locale}:{locale:Locale}){
 const origin=siteOrigin();
 const schema={'@context':'https://schema.org','@type':'WebSite','@id':`${origin}/#website`,name:'EL AMAL',url:`${origin}/${locale}`,inLanguage:['en','ar'],publisher:{'@type':'Organization',name:'EL AMAL',url:origin}};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>;
}
