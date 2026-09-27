import Image from 'next/image';
import type {Locale,Product} from '@/lib/catalogue';
import {Instrument} from './instrument';
export function ProductImage({product,locale,small=false}:{product:Product;locale:Locale;small?:boolean}){
 const image=product.details?.image;
 return image?<Image className="manufacturer-image" src={image.src} alt={image.alt[locale]} width={image.width} height={image.height} sizes={small?'(max-width: 639px) 88vw, (max-width: 1023px) 42vw, 32vw':'(max-width: 639px) 88vw, 44vw'} loading="lazy"/>:<Instrument small={small} kind={product.category}/>;
}
