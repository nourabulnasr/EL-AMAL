import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {loadCatalogue} from '@/lib/load-catalogue';
import {selectAboutStoryProducts} from '@/lib/about-story';
import {ProductImage} from './product-image';
import {RevealText} from './reveal-text';

export async function AboutProductStory({locale}:{locale:Locale}){
 const {products}=await loadCatalogue();
 const story=selectAboutStoryProducts(products);
 if(!story.length)return null;
 const ar=locale==='ar';
 return <section className="section about-product-story" aria-labelledby="about-instruments">
  <header className="about-story-heading">
   <p className="section-kicker">{ar?'من الكتالوج إلى موقع العمل':'From catalogue to site'}</p>
   <h2 id="about-instruments"><RevealText>{ar?'أجهزة حقيقية.\nوسياق فني واضح.':'Real instruments.\nClear technical context.'}</RevealText></h2>
   <p>{ar?'صور المنتجات المنشورة هنا مأخوذة من كتالوج الأمل المراجع. افتح أي جهاز لمراجعة مواصفاته ومستنداته قبل إرسال الطلب.':'The product photography shown here comes from EL AMAL’s reviewed catalogue. Open an instrument to inspect its specifications and documents before sending an enquiry.'}</p>
  </header>
  <div className="about-story-grid">{story.map((product,index)=><Link key={product.id} href={`/${locale}/products/${product.id}`} className={`about-story-item about-story-item-${index+1}`}>
   <div className="about-story-visual"><ProductImage product={product} locale={locale} small sizes={index===0?'(max-width: 899px) 88vw, 52vw':'(max-width: 899px) 88vw, 24vw'}/></div>
   <span><bdi>{product.model}</bdi> · {product.name[locale]}</span>
  </Link>)}</div>
 </section>;
}
