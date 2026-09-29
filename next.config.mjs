import {indexingHeaders} from './src/lib/site-policy.mjs';
import {withPayload} from '@payloadcms/next/withPayload';
const nextConfig = {
  experimental: { globalNotFound: true, cpus: 1 },
  poweredByHeader: false,
  async headers() { return [{ source: '/:path*', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Content-Security-Policy',value:"object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"},
    {key:'Strict-Transport-Security',value:'max-age=31536000'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  ] },...['/admin/:path*','/staff/:path*','/api/:path*'].map(source=>({source,headers:[{key:'Cache-Control',value:'private, no-store'},{key:'Referrer-Policy',value:'no-referrer'}]})),...indexingHeaders()]; },
};
const payloadConfig=withPayload(nextConfig);
export default {
  ...payloadConfig,
  async headers() {
    const rules=await payloadConfig.headers();
    // CMS theme negotiation is only useful in administration. Critical-CH on
    // public pages makes supporting browsers repeat their first navigation.
    return rules.map(rule=>rule.headers.some(header=>header.key.toLowerCase()==='critical-ch')
      ? {...rule,source:'/admin/:path*'}
      : rule);
  },
};
