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
export default withPayload(nextConfig);
