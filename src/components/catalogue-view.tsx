import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {searchProducts} from '@/lib/catalogue';
import {products,categories} from '@/content/catalogue';
import {copy} from '@/content/copy';
import {ProductCard} from './product-card';
export function CatalogueView({locale,query='',category=''}:{locale:Locale;query?:string;category?:string}){
 const t=copy[locale],results=searchProducts(products,query,category);
 return <><div className="catalogue-heading"><p className="breadcrumb"><Link href={`/${locale}`}>{t.home}</Link> / {t.catalogue}</p><h1>{categories.find(c=>c.id===category)?.name[locale]??(locale==='en'?'The instrument catalogue':'كتالوج أدوات القياس')}</h1><p>{locale==='en'?'Find your model. Define your requirement. Start a conversation.':'ابحث عن الطراز. حدد متطلباتك. ابدأ التواصل.'}</p></div><section className="catalogue-layout"><form className="catalogue-filter" action={`/${locale}/products`}><label htmlFor="catalogue-query">{t.search}</label><input id="catalogue-query" name="q" defaultValue={query} maxLength={120}/><label htmlFor="category">{t.category}</label><select id="category" name="category" defaultValue={category}><option value="">{t.all}</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name[locale]}</option>)}</select><button className="button button-dark">{t.apply}</button><Link className="reset-link" href={`/${locale}/products`}>{t.reset}</Link><p className="filter-note">{locale==='en'?'Looking for a specific configuration? Add the model to your quote basket.':'تبحث عن تكوين محدد؟ أضف الطراز إلى سلة عرض السعر.'}</p></form><div><p className="result-count" role="status">{results.length} {t.results}</p>{results.length?<div className="product-grid">{results.map(p=><ProductCard key={p.id} product={p} locale={locale}/>)}</div>:<div className="empty-state"><h2>{t.empty}</h2><Link href={`/${locale}/products`} className="text-link">{t.reset}</Link></div>}</div></section></>;
}
