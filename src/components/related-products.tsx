import type {Locale,Product} from '@/lib/catalogue';
import {selectRelatedProducts} from '@/lib/related-products';
import {ProductCard} from './product-card';
import './related-products.css';

export function RelatedProducts({product,products,locale,demo}:{product:Product;products:readonly Product[];locale:Locale;demo:boolean}) {
 const related=selectRelatedProducts(product,products);
 if(!related.length)return null;
 return <section className="related-products" aria-labelledby="related-products-heading">
  <div className="related-products-heading">
   <h2 id="related-products-heading">{locale==='ar'?'منتجات مشابهة':'Similar products'}</h2>
   <p>{locale==='ar'?'استكشف طرازات أخرى في الفئة نفسها. قارن المواصفات والتوصيلات لتحديد الأنسب لتطبيقك.':'Explore other models in this category. Compare specifications and connections to find the right fit for your application.'}</p>
  </div>
  <div className="related-products-list">
   {related.map(candidate=><ProductCard key={candidate.id} product={candidate} locale={locale} demo={demo} list="related"/>)}
  </div>
 </section>;
}
