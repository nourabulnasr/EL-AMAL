import type {Locale} from './catalogue';
type Contact={email:string;phone?:string;whatsapp?:string};
export function buildSiteSchema({locale,origin,contact}:{locale:Locale;origin:string;contact:Contact}){
 return {'@context':'https://schema.org','@graph':[
  {'@type':'WebSite','@id':`${origin}/#website`,name:'EL AMAL',alternateName:'الأمل',url:origin,inLanguage:['en','ar'],publisher:{'@id':`${origin}/#organization`},potentialAction:{'@type':'SearchAction',target:{'@type':'EntryPoint',urlTemplate:`${origin}/${locale}/products?q={search_term_string}`},'query-input':'required name=search_term_string'}},
  {'@type':'Organization','@id':`${origin}/#organization`,name:'EL AMAL',alternateName:'الأمل',url:origin,email:contact.email,...(contact.phone?{telephone:contact.phone}:{}),logo:{'@type':'ImageObject',url:`${origin}/brand/el-amal-logo.png`,width:756,height:181},areaServed:{'@type':'Country',name:'Egypt'},contactPoint:{'@type':'ContactPoint',contactType:'sales',email:contact.email,...(contact.phone?{telephone:contact.phone}:{}),areaServed:'EG',availableLanguage:['en','ar']}},
 ]};
}
