'use client';
import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {basketLineKey,basketSelectionRequired} from '@/lib/basket';
import {copy} from '@/content/copy';
import {EnquiryPreview} from './enquiry-preview';
import {useBasket} from './basket-provider';
import './product-connection-options.css';
export function QuoteBasket({locale}:{locale:Locale}){
 const {catalogue,publicEnquiries,lines,ready,storageError,update,remove,selectOption}=useBasket(),t=copy[locale],ar=locale==='ar';const {products,source}=catalogue;
 if(!ready)return <><p role="status">{ar?'جارٍ تحميل السلة…':'Loading your basket…'}</p><noscript>{ar?'فعّل جافاسكريبت لتعديل السلة وحفظها.':'Enable JavaScript to edit and save your basket.'}</noscript></>;
 const needsSelection=lines.some(line=>{const product=products.find(product=>product.id===line.productId);return !product||basketSelectionRequired(line,product);});
 return <>{storageError&&<p role="alert">{t.storage}</p>}{lines.length?<div className="quote-layout"><div className="basket-lines">
  {needsSelection&&<p role="alert">{ar?'اختر توصيلاً صالحاً لكل منتج قبل مراجعة الطلب.':'Choose a valid connection for each product before reviewing the enquiry.'}</p>}
  {lines.map((line,index)=>{
   const product=products.find(product=>product.id===line.productId);if(!product)return null;
   const option=product.options?.find(option=>option.id===line.optionId),needs=basketSelectionRequired(line,product),labelId='basket-option-'+index;
   return <article className="basket-line" key={basketLineKey(line)}><div><bdi className="model" dir="ltr">{option?.model??product.model}</bdi><h2><Link href={'/'+locale+'/products/'+product.id}>{product.name[locale]}</Link></h2>
    {product.options?.length?<div className="basket-option"><label htmlFor={labelId}>{ar?'التوصيل':'Connection'}</label><select id={labelId} value={option?.id??''} required aria-invalid={needs} onChange={event=>selectOption(line,event.target.value)}><option value="" disabled>{ar?'اختر التوصيل':'Choose the connection'}</option>{product.options.map(choice=><option key={choice.id} value={choice.id} disabled={(lines.find(existing=>existing.productId===line.productId&&existing.optionId===choice.id&&basketLineKey(existing)!==basketLineKey(line))?.quantity??0)+line.quantity>9999}>{choice.name[locale]}{choice.model?' \u2066('+choice.model+')\u2069':''}</option>)}</select></div>:needs&&<p role="alert">{ar?'هذا التوصيل لم يعد متاحاً. احذف السطر وأضف المنتج من جديد.':'This connection is no longer available. Remove this line and add the product again.'}</p>}
    {source==='demo'&&<span className="sample-label-inline">{t.sample}</span>}</div>
    <label htmlFor={'qty-'+index}>{t.quantity}<input id={'qty-'+index} type="number" min={1} max={9999} step={1} value={line.quantity} onChange={event=>update(product.id,Number(event.target.value),line.optionId)}/></label>
    <button className="remove-button" onClick={()=>remove(product.id,line.optionId)} aria-label={t.remove+' '+product.model+(option?' '+option.name[locale]:'')}>{t.remove}</button></article>;
  })}</div><aside className="quote-summary"><p className="section-kicker">{ar?'01 / اختياراتك':'01 / Your selection'}</p><h2>{ar?'متطلباتك':'Your requirement'}</h2><p>{lines.length} {t.results}</p><p>{publicEnquiries?(ar?'تُحفظ اختياراتك على هذا الجهاز. أضف بياناتك وراجع الطلب، ثم أرسله وأكد بريدك الإلكتروني. لا يتم حجز مخزون.':'Your selections stay on this device. Add your details, review the enquiry, then submit it and confirm your email. No stock is reserved.'):t.previewQuote}</p><a className="button button-dark" href="#enquiry-details">{ar?'أضف بياناتك':'Add your details'}<span aria-hidden="true">↓</span></a><Link className="text-link" href={'/'+locale+'/products'}>{t.browse}</Link></aside></div>:<div className="empty-state"><h2>{t.basketEmpty}</h2><Link className="button button-dark" href={'/'+locale+'/products'}>{t.browse}</Link></div>}
  {lines.length>0&&<EnquiryPreview locale={locale}/>}<noscript>{ar?'فعّل جافاسكريبت لتعديل السلة وحفظها.':'Enable JavaScript to edit and save your basket.'}</noscript></>;
}
