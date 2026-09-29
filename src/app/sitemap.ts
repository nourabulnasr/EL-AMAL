import type {MetadataRoute} from 'next';
import {indexingEnabled} from '@/lib/site-policy.mjs';
import {loadCatalogue} from '@/lib/load-catalogue';
import {buildCatalogueSitemap} from '@/lib/seo-discovery';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(!indexingEnabled())return [];
 return buildCatalogueSitemap(await loadCatalogue());
}
