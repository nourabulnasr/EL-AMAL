import type {Product,Translated} from './catalogue.ts';

export type FeaturedKind = 'pressure' | 'valve' | 'temperature';
export type FeaturedProduct = {
  product: Product;
  kind: FeaturedKind;
  title: Translated;
  description: Translated;
  detail: Translated;
};

const selection: Omit<FeaturedProduct,'product'>[] = [
  {
    kind:'pressure',
    title:{en:'Pressure, precisely.',ar:'الضغط، بكل دقة.'},
    description:{en:'Stainless steel process pressure gauges.',ar:'مقاييس ضغط للعمليات الصناعية من الفولاذ المقاوم للصدأ.'},
    detail:{en:'Bottom or back connection',ar:'توصيل سفلي أو خلفي'},
  },
  {
    kind:'valve',
    title:{en:'Control at the connection.',ar:'التحكم عند نقطة التوصيل.'},
    description:{en:'IV2 block-and-bleed valve.',ar:'صمام IV2 للعزل وتفريغ الضغط.'},
    detail:{en:'Instrument valves',ar:'صمامات أجهزة القياس'},
  },
  {
    kind:'temperature',
    title:{en:'Temperature, considered.',ar:'الحرارة، بعناية.'},
    description:{en:'Model 55 bimetal process thermometer.',ar:'مقياس حرارة ثنائي المعدن للعمليات الصناعية، طراز 55.'},
    detail:{en:'Process version · EN 13190',ar:'إصدار للعمليات الصناعية · EN 13190'},
  },
];

const expectedModels = ['2325023350','iv2','55'];
const modelKey = (model:string) => model.toLowerCase().replace(/[^a-z0-9]/g,'');

/** Explicit family selection preserves the catalogue's IDs and analytics. */
export function selectFeaturedProducts(products:Product[]):FeaturedProduct[] {
  return selection.flatMap((entry,index)=>{
    const product=products.find(candidate=>modelKey(candidate.model)===expectedModels[index]);
    return product?.details ? [{...entry,product}] : [];
  });
}
