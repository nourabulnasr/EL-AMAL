import type {Locale,Product} from '@/lib/catalogue';
import {productSuggestionPurpose,selectRelatedProducts} from '@/lib/related-products';
import Link from 'next/link';
import {ProductCard} from './product-card';
import {SuggestionDisclosure} from './suggestion-disclosure';
import './related-products.css';

export function RelatedProducts({product,products,locale,demo}:{product:Product;products:readonly Product[];locale:Locale;demo:boolean}) {
 const related=selectRelatedProducts(product,products);
 return <SuggestionDisclosure count={related.length} locale={locale}>
  {related.length?<>
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
  </>:<div className="suggestion-assistance">
   <p className="section-kicker">{locale==='ar'?'مطابقة فنية':'Engineering-assisted matching'}</p>
   <h2>{locale==='ar'?'دعنا نُكمل التكوين الصحيح معك.':'Let us complete the right configuration with you.'}</h2>
   <p>{locale==='ar'?'لا نعرض توافقاً غير موثّق. أرسل الطراز ومتطلبات التطبيق ليراجع فريق الأمل التوصيلات والنطاق والمواد والمكوّنات المكملة قبل إصدار عرض السعر.':'We do not show an unverified compatibility claim. Send the model and application requirements so EL AMAL can review the connections, range, materials and complementary components before quoting.'}</p>
   <Link className="button button-dark" href={`/${locale}/rfq`}>{locale==='ar'?'اطلب مطابقة التكوين':'Request configuration matching'}<span aria-hidden="true">↗</span></Link>
  </div>}
 </SuggestionDisclosure>;
}
