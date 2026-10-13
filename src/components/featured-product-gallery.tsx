import Image from 'next/image';
import Link from 'next/link';
import type {Locale,Product} from '@/lib/catalogue';
import {selectFeaturedProducts} from '@/lib/featured-products';
import {ProductGalleryDepth} from './product-gallery-depth';
import {ProductAvailability} from './product-availability';
import './featured-product-gallery.css';

export function FeaturedProductGallery({products,locale}:{products:Product[];locale:Locale}) {
  const featured=selectFeaturedProducts(products),ar=locale==='ar';
  if(!featured.length)return null;
  return <div className="featured-gallery">
    {featured.map(({product,kind,title,description,detail},index)=>{
      const image=product.details!.image;
      const href=`/${locale}/products/${product.id}`;
      return <article className={`featured-piece featured-piece--${kind}`} key={product.id}
        data-interest-product={product.id} data-interest-locale={locale} data-interest-list="home">
        <div className="featured-piece-top"><span className="featured-category">{ar?(kind==='pressure'?'قياس الضغط':kind==='valve'?'الصمامات والملحقات':'قياس الحرارة'):(kind==='pressure'?'Pressure measurement':kind==='valve'?'Valves & accessories':'Temperature measurement')}</span><span className="featured-number" aria-hidden="true">0{index+1}</span></div>
        <Link className="featured-stage" href={href} aria-label={`${ar?'عرض':'View'} ${product.model} — ${product.name[locale]}`}>
          <span className="featured-light" aria-hidden="true"/>
          <span className="featured-orbit" aria-hidden="true"/>
          <ProductGalleryDepth>
            <div className="featured-art"><Image src={image.src} alt={image.alt[locale]} width={image.width} height={image.height}
              sizes={kind==='pressure'?'(max-width: 699px) 76vw, (max-width: 1099px) 46vw, 540px':'(max-width: 699px) 74vw, (max-width: 1099px) 38vw, 400px'} loading="lazy"/></div>
          </ProductGalleryDepth>
          <span className="featured-view-mark" aria-hidden="true">↗</span>
        </Link>
        <div className="featured-piece-copy" data-interest-observe=""><p className="featured-model"><bdi>{product.model}</bdi><span>{detail[locale]}</span></p>
          <h3><Link href={href}>{title[locale]}</Link></h3><p className="featured-description">{description[locale]}</p>
          <div className="featured-piece-bottom"><ProductAvailability product={product} locale={locale}/><Link className="featured-product-link" href={href}>{ar?'اكتشف المنتج':'Explore product'}<span aria-hidden="true">↗</span></Link></div>
        </div>
      </article>;
    })}
  </div>;
}
