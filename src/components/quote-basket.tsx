'use client';
import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {useBasket} from './basket-provider';
export function QuoteBasket({locale}:{locale:Locale}){
 const {catalogue,lines,ready,storageError,update,remove}=useBasket(),t=copy[locale];const {products,source}=catalogue;
 if(!ready)return <><p role="status">{locale==='en'?'Loading your basket…':'جارٍ تحميل السلة…'}</p><noscript>{locale==='en'?'Enable JavaScript to edit and save your basket.':'فعّل جافاسكريبت لتعديل السلة وحفظها.'}</noscript></>;
 return <>{storageError&&<p role="alert">{t.storage}</p>}{lines.length?<div className="quote-layout"><div className="basket-lines">{lines.map(line=>{const p=products.find(p=>p.id===line.productId);if(!p)return null;return <article className="basket-line" key={line.productId}><div><bdi className="model">{p.model}</bdi><h2><Link href={`/${locale}/products/${p.id}`}>{p.name[locale]}</Link></h2>{source==='demo'&&<span className="sample-label-inline">{t.sample}</span>}</div><label htmlFor={`qty-${p.id}`}>{t.quantity}<input id={`qty-${p.id}`} type="number" min={1} max={9999} step={1} value={line.quantity} onChange={e=>update(p.id,Number(e.target.value))}/></label><button className="remove-button" onClick={()=>remove(p.id)} aria-label={`${t.remove} ${p.model}`}>{t.remove}</button></article>;})}</div><aside className="quote-summary"><h2>{locale==='en'?'Your requirement':'متطلباتك'}</h2><p>{lines.length} {t.results}</p><p>{t.previewQuote}</p><Link className="text-link" href={`/${locale}/products`}>{t.browse}</Link></aside></div>:<div className="empty-state"><h2>{t.basketEmpty}</h2><Link className="button button-dark" href={`/${locale}/products`}>{t.browse}</Link></div>}<noscript>{locale==='en'?'Enable JavaScript to edit and save your basket.':'فعّل جافاسكريبت لتعديل السلة وحفظها.'}</noscript></>;
}
