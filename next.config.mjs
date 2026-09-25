import {indexingEnabled} from './src/lib/site-policy.mjs';
import {withPayload} from '@payloadcms/next/withPayload';
const nextConfig = {
  experimental: { globalNotFound: true, cpus: 1 },
  poweredByHeader: false,
  async headers() { return [{ source: '/:path*', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'},
    ...(!indexingEnabled()?[{key:'X-Robots-Tag',value:'noindex, nofollow'}]:[]),
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  ] },{source:'/admin/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]},{source:'/api/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]}]; },
};
export default withPayload(nextConfig);
