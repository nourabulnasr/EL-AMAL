import type {MetadataRoute} from 'next';
import {indexingEnabled,siteOrigin} from '@/lib/site-policy.mjs';
import {loadCatalogue} from '@/lib/load-catalogue';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(!indexingEnabled())return [];
 const {products,categories}=await loadCatalogue(),origin=siteOrigin();
 const paths=['','/products','/rfq','/industries/oil-gas','/industries/general-industry',...categories.map(c=>`/categories/${encodeURIComponent(c.id)}`),...products.map(p=>`/products/${encodeURIComponent(p.id)}`)];
 return paths.flatMap(path=>['en','ar'].map(locale=>({url:`${origin}/${locale}${path}`,alternates:{languages:{en:`${origin}/en${path}`,ar:`${origin}/ar${path}`}}})));
}
