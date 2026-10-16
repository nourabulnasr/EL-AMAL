import type {Locale} from '@/lib/catalogue';
import './product-detail-search.css';

/** A native GET form keeps product discovery available before hydration. */
export function ProductDetailSearch({locale}:{locale:Locale}) {
 const ar=locale==='ar';
 return <form className="product-detail-search" role="search" action={`/${locale}/products`} method="get" aria-label={ar?'البحث في كتالوج المنتجات':'Search the product catalogue'}>
  <label htmlFor="product-detail-query">{ar?'ابحث في الكتالوج':'Search the catalogue'}</label>
  <div className="product-detail-search-controls">
   <div className="product-detail-search-field">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    <input id="product-detail-query" type="search" name="q" maxLength={120} placeholder={ar?'الطراز أو اسم المنتج':'Model or product name'} dir="auto" enterKeyHint="search" autoCapitalize="none" spellCheck={false}/>
   </div>
   <button type="submit">{ar?'بحث':'Search'}</button>
  </div>
 </form>;
}
