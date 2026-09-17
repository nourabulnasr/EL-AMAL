export type Locale = 'en' | 'ar';
export type Translated = Record<Locale, string>;
export type Product = { id:string; model:string; category:string; name:Translated; description:Translated; };
export const isLocale = (value:string): value is Locale => value === 'en' || value === 'ar';
export function normalise(value:string) {
  return value.normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/[^\p{L}\p{N}]/gu,'');
}
export function searchProducts<T extends Product>(products:T[], query:string, category:string):T[] {
  const q = normalise(query.trim().slice(0,120));
  return products.filter(p => (!category || p.category === category) && (!q || normalise([p.model,...Object.values(p.name),...Object.values(p.description)].join(' ')).includes(q)))
    .sort((a,b) => Number(normalise(b.model) === q) - Number(normalise(a.model) === q));
}
