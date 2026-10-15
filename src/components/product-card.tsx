import {BidiText} from '@/components/bidi-text';
import Link from 'next/link';
import type {Locale,Product} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {ProductImage} from './product-image';
import {ProductAvailability} from './product-availability';
import {getIndustryUseNote} from '@/lib/product-industries';
export function ProductCard({product,locale,demo=true,list='home',industry}:{product:Product;locale:Locale;demo?:boolean;industry?:string;list?:'home'|'catalogue'|'category'|'search'|'related'}){
 const t=copy[locale],industryNote=industry?getIndustryUseNote(product,industry,locale):undefined;
 return <article className="product-card" data-interest-product={demo?undefined:product.id} data-interest-locale={locale} data-interest-list={list} data-interest-observe="">
  <Link href={`/${locale}/products/${product.id}`} className="product-visual" aria-label={`${t.view}: ${product.name[locale]}`}>
   <ProductImage small product={product} locale={locale} sizes={list==='related'?'(max-width: 699px) 104px, (max-width: 1099px) 26vw, 30vw':undefined}/>
   {!product.details&&<span className="sample-label">{demo?t.sample:t.illustration}</span>}
  </Link>
  <div className="product-info">
   <bdi className="model">{product.model}</bdi>
   <h3><Link href={`/${locale}/products/${product.id}`}>{product.name[locale]}</Link></h3>
   <p className="product-description"><BidiText>{product.description[locale]}</BidiText></p>
   {industryNote&&<p className="product-industry-note">{industryNote}</p>}
   <ProductAvailability product={product} locale={locale}/>
   <Link className="text-link" href={`/${locale}/products/${product.id}`}>{t.view}<span aria-hidden="true">↗</span></Link>
  </div>
 </article>;
}
