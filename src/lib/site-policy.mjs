/** @param {Record<string,string|undefined>} env */
export function indexingEnabled(env=process.env){
 return env.SITE_INDEXING_ENABLED==='true'&&env.CATALOGUE_SOURCE==='cms'&&env.CMS_ENABLED==='true'&&env.VERCEL_ENV==='production';
}
/** Forms and faceted search are crawlable so crawlers can see their noindex rule.
 * @param {string} path locale-relative path, optionally with a query string
 */
export function publicPathIndexable(path){
 const url=new URL(path||'/', 'https://site.invalid');
 if(/^\/(quote|rfq|verify)(\/|$)/.test(url.pathname))return false;
 return !['q','category','type','application'].some(key=>url.searchParams.has(key));
}
/** @param {Record<string,string|undefined>} env */
export function robotsPolicy(env=process.env){
 return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/staff','/api/']},...(indexingEnabled(env)?{sitemap:`${siteOrigin(env)}/sitemap.xml`}:{})};
}
/** @param {Record<string,string|undefined>} env */
export function indexingHeaders(env=process.env){
 const excluded={key:'X-Robots-Tag',value:'noindex, nofollow'};
 return [
  ...['/admin/:path*','/staff/:path*','/api/:path*','/:locale(en|ar)/:private(quote|rfq|verify)/:path*'].map(source=>({source,headers:[excluded]})),
  ...['q','category','type','application'].map(key=>({source:'/:locale(en|ar)/products',has:[{type:'query',key}],headers:[{key:'X-Robots-Tag',value:'noindex, follow'}]})),
  ...(!indexingEnabled(env)?[{source:'/:path*',headers:[excluded]}]:[]),
 ];
}
/** @param {Record<string,string|undefined>} env */
export function siteOrigin(env=process.env){
 try{const url=new URL(env.SITE_URL||'https://el-amal-sigma.vercel.app');if(url.protocol==='https:'&&!url.username&&!url.password)return url.origin;}catch{}
 return 'https://el-amal-sigma.vercel.app';
}

/** Move public pages only after the verified custom domain is configured.
 * Keep API/cron endpoints on their original hosts so scheduled operations
 * never depend on following a cross-host redirect.
 * @param {Record<string,string|undefined>} env
 */
export function publicDomainRedirects(env=process.env){
 const origin=siteOrigin(env);
 if(env.VERCEL_ENV!=='production'||origin!=='https://www.al-amaleg.com')return [];
 const has=[{type:'host',value:'el-amal-sigma.vercel.app'}];
 return [
  {source:'/',has,destination:`${origin}/`,permanent:true},
  {source:'/:locale(en|ar)/:path*',has,destination:`${origin}/:locale/:path*`,permanent:true},
 ];
}
