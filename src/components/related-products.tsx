import type {Locale,Product} from '@/lib/catalogue';
import {productSuggestionPurpose,selectRelatedProducts} from '@/lib/related-products';
import {ProductCard} from './product-card';
import './related-products.css';

export function RelatedProducts({product,products,locale,demo}:{product:Product;products:readonly Product[];locale:Locale;demo:boolean}) {
 const related=selectRelatedProducts(product,products);
 if(!related.length)return null;
 return <details className="related-products suggestions-disclosure">
  <summary className="suggestions-trigger"><span className="suggestions-symbol" aria-hidden="true">＋</span><span><strong>{locale==='ar'?'مقترحات تُكمل اختيارك':'Complete your setup'}</strong><span>{locale==='ar'?'عرض مقترحات المنتجات':'View product suggestions'}</span></span><span className="suggestions-count">{related.length}</span></summary>
  <div className="suggestions-content">
  <div className="related-products-heading">
   <h2 id="related-products-heading">{locale==='ar'?'مقترحات للمنتج':'Suggestions'}</h2>
   <p>{locale==='ar'?'مكوّنات قد تُكمل منظومة القياس. أكّد توافق التوصيلات والنطاق والمواد والتجهيز الكهربائي قبل الطلب.':'Components to consider for your measurement setup. Confirm connections, range, materials and electrical configuration before ordering.'}</p>
  </div>
  <div className="related-products-list">
   {related.map(candidate=><div key={candidate.id} className="related-product-suggestion">
    <p className="related-product-purpose">{productSuggestionPurpose(product,candidate,locale)}</p>
    <ProductCard product={candidate} locale={locale} demo={demo} list="related"/>
   </div>)}
  </div>
 </div>
 </details>;
}
