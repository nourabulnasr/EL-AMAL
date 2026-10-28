import type {Industry} from '@/content/industry-pages';
import type {Locale} from './catalogue';

export function buildIndustryPageSchema({locale,origin,industry}:{locale:Locale;origin:string;industry:Industry}){
 const copy=industry[locale],url=`${origin}/${locale}/industries/${industry.id}`,ar=locale==='ar';
 return {'@context':'https://schema.org','@graph':[
  {'@type':'WebPage','@id':`${url}#page`,url,name:copy.title,description:copy.metaDescription,inLanguage:ar?'ar-EG':'en-EG',isPartOf:{'@id':`${origin}/#website`}},
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:ar?'الرئيسية':'Home',item:`${origin}/${locale}`},{'@type':'ListItem',position:2,name:copy.title,item:url}]},
  {'@type':'FAQPage',mainEntity:copy.faqs.map(faq=>({'@type':'Question',name:faq.question,acceptedAnswer:{'@type':'Answer',text:faq.answer}}))},
 ]};
}
