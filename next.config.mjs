export default {
  experimental: { globalNotFound: true, cpus: 1 },
  poweredByHeader: false,
  async headers() { return [{ source: '/:path*', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'X-Robots-Tag',value:'noindex, nofollow'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  ] }]; },
};
