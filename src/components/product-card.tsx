import Link from 'next/link';
import type {Locale,Product} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {Instrument} from './instrument';
export function ProductCard({product,locale,demo=true}:{product:Product;locale:Locale;demo?:boolean}){
 const t=copy[locale];return <article className="product-card"><Link href={`/${locale}/products/${product.id}`} className="product-visual" aria-label={`${t.view}: ${product.name[locale]}`}><Instrument small kind={product.category}/><span className="sample-label">{demo?t.sample:t.illustration}</span></Link><div className="product-info"><bdi className="model">{product.model}</bdi><h3><Link href={`/${locale}/products/${product.id}`}>{product.name[locale]}</Link></h3><p className="availability"><span/>{t.availability}</p><Link className="text-link" href={`/${locale}/products/${product.id}`}>{t.view}<span aria-hidden="true">↗</span></Link></div></article>;
}
