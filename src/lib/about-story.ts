import type {Product} from './catalogue.ts';

const storyOrder=['pressure','temperature','accessories'] as const;

/** Use only reviewed catalogue photography; never substitute external brand imagery. */
export function selectAboutStoryProducts<T extends Product>(products:T[]):T[]{
 return storyOrder.flatMap(category=>{
  const match=products.find(product=>product.category===category&&!!product.details?.image);
  return match?[match]:[];
 });
}
