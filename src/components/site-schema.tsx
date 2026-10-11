import {siteOrigin} from '@/lib/site-policy.mjs';
import type {Locale} from '@/lib/catalogue';
import {businessEmail} from '@/lib/business-contact';
export function SiteSchema({locale}:{locale:Locale}){
 const origin=siteOrigin();
 const schema={'@context':'https://schema.org','@graph':[
  {'@type':'WebSite','@id':`${origin}/#website`,name:'EL AMAL',url:origin,inLanguage:['en','ar'],publisher:{'@id':`${origin}/#organization`}},
  {'@type':'Organization','@id':`${origin}/#organization`,name:'EL AMAL',alternateName:'الأمل',url:origin,email:businessEmail,logo:{'@type':'ImageObject',url:`${origin}/brand/el-amal-logo.png`,width:756,height:181}},
 ]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>;
}
