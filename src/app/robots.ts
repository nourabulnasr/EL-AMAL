import type {MetadataRoute} from 'next';
import {indexingEnabled,siteOrigin} from '@/lib/site-policy.mjs';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',disallow:['/admin','/api/','/en/quote','/ar/quote'],allow:'/'},...(indexingEnabled()?{sitemap:`${siteOrigin()}/sitemap.xml`}:{})};}
