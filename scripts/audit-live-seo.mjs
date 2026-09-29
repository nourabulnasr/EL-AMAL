import {mkdir,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {extractSitemapUrls,inspectPage,publicAuditUrl} from './lib/seo-audit.mjs';

const options=Object.fromEntries(process.argv.slice(2).map(arg=>{const split=arg.indexOf('=');return [arg.slice(2,split),arg.slice(split+1)];}));
const origin=new URL(options.origin??'https://el-amal-sigma.vercel.app').origin;
const expectIndexable=options['expect-indexable']!=='false';
const output=options.output??'artifacts/2026-09-29/launch/seo-live-audit.json';
const limit=Number(options.limit??1000);
if(!Number.isSafeInteger(limit)||limit<1||limit>5000)throw new Error('Audit limit must be 1–5000');
const expectedProducts=options['expected-products']===undefined?null:Number(options['expected-products']);
if(expectedProducts!==null&&(!Number.isSafeInteger(expectedProducts)||expectedProducts<0))throw new Error('Expected product count must be a nonnegative integer');
const headers={'User-Agent':'EL-AMAL-SEO-Audit/1.0 (read-only release verification)'};
const fetchPage=async url=>{const response=await fetch(url,{headers,redirect:'manual',signal:AbortSignal.timeout(45000)});return {response,body:await response.text()};};
const report={origin,startedAt:new Date().toISOString(),expectIndexable,sitemapCount:0,pages:[],assets:[],guards:[],issues:[],limitations:['This checks server responses, not Google indexing, rankings, rich-result eligibility, rendered accessibility or field Core Web Vitals.']};
const queue=[],queued=new Set(),assets=new Set();
const enqueue=value=>{const url=publicAuditUrl(value,origin);if(url&&!queued.has(url)){queued.add(url);queue.push(url);}};
let sitemapUrls=[];
try{
 const {response,body}=await fetchPage(`${origin}/sitemap.xml`);
 if(response.status!==200)report.issues.push('sitemap-http-status');
 sitemapUrls=extractSitemapUrls(body);report.sitemapCount=sitemapUrls.length;
 if(expectIndexable&&!sitemapUrls.length)report.issues.push('sitemap-empty');
 if(!expectIndexable&&sitemapUrls.length)report.issues.push('preview-sitemap-not-empty');
 if(new Set(sitemapUrls).size!==sitemapUrls.length)report.issues.push('sitemap-duplicates');
 for(const url of sitemapUrls){if(!publicAuditUrl(url,origin))report.issues.push(`sitemap-ineligible:${url}`);else enqueue(url);}
 const robots=await fetchPage(`${origin}/robots.txt`);
 report.robots={status:robots.response.status,body:robots.body};
 if(robots.response.status!==200)report.issues.push('robots-http-status');
 if(expectIndexable&&!robots.body.includes(`Sitemap: ${origin}/sitemap.xml`))report.issues.push('robots-sitemap');
 if(expectIndexable&&/^Disallow:\s*\/\s*$/mi.test(robots.body))report.issues.push('robots-blocks-site');
}catch(error){report.issues.push(`discovery-network:${error.name}`);}
enqueue(`${origin}/en`);enqueue(`${origin}/ar`);
while(queue.length&&report.pages.length<limit){
 const url=queue.shift();
 try{
  const {response,body}=await fetchPage(url);
  const result=inspectPage({html:body,url,status:response.status,robotsHeader:response.headers.get('x-robots-tag')??'',expectIndexable});
  for(const link of result.links)enqueue(link);
  for(const asset of result.assets)assets.add(asset);
  const {links,assets:pageAssets,...summary}=result;report.pages.push(summary);
  for(const issue of result.issues)report.issues.push(`${issue}:${url}`);
 }catch(error){report.pages.push({url,issues:[`network:${error.name}`]});report.issues.push(`network:${url}:${error.name}`);}
 if(report.pages.length%25===0)console.log(`Checked ${report.pages.length} public pages; ${queue.length} queued.`);
}
if(queue.length)report.issues.push(`audit-truncated:${queue.length}`);
report.productPages={en:report.pages.filter(page=>new URL(page.url).pathname.startsWith('/en/products/')).length,ar:report.pages.filter(page=>new URL(page.url).pathname.startsWith('/ar/products/')).length};
if(expectedProducts!==null)for(const locale of ['en','ar'])if(report.productPages[locale]!==expectedProducts)report.issues.push(`product-count-${locale}:${report.productPages[locale]}/${expectedProducts}`);
if(expectIndexable){const listed=new Set(sitemapUrls);for(const page of report.pages)if(!listed.has(page.url))report.issues.push(`public-page-missing-from-sitemap:${page.url}`);}
// Unauthenticated GETs only: no token, form submission, mutations or email delivery.
for(const path of ['/en/quote','/ar/quote','/en/rfq','/ar/rfq','/en/verify','/ar/verify','/en/products?q=DI10','/ar/products?category=pressure','/admin/login','/staff/inventory','/api/skus']){
 try{
  const {response,body}=await fetchPage(`${origin}${path}`);
  const robots=response.headers.get('x-robots-tag')??'';
  const noindex=/\b(?:noindex|none)\b/i.test(robots)||/<meta[^>]+name="robots"[^>]+content="[^"]*\b(?:noindex|none)\b/i.test(body);
  report.guards.push({path,status:response.status,noindex});
  if(!noindex)report.issues.push(`guard-noindex:${path}`);
  if(path==='/api/skus'&&![401,403].includes(response.status))report.issues.push('private-api-status');
 }catch(error){report.issues.push(`guard-network:${path}:${error.name}`);}
}
for(const path of ['/en/products/seo-audit-nonexistent-model','/ar/categories/seo-audit-missing','/xx']){
 try{
  const {response,body}=await fetchPage(`${origin}${path}`);
  const noindex=/\b(?:noindex|none)\b/i.test(response.headers.get('x-robots-tag')??'')||/<meta[^>]+name="robots"[^>]+content="[^"]*\b(?:noindex|none)\b/i.test(body);
  report.guards.push({path,status:response.status,noindex});
  if(response.status!==404&&!noindex)report.issues.push(`missing-route-indexable:${path}`);
 }catch(error){report.issues.push(`missing-route-network:${path}:${error.name}`);}
}
assets.add(`${origin}/favicon.ico`);
for(const url of assets){
 try{
  if(new URL(url).origin!==origin){report.issues.push(`external-asset-skipped:${url}`);continue;}
  const response=await fetch(url,{method:'HEAD',headers,redirect:'manual',signal:AbortSignal.timeout(45000)});
  const contentType=response.headers.get('content-type')??'';
  report.assets.push({url,status:response.status,contentType});
  if(response.status!==200||!contentType.startsWith('image/'))report.issues.push(`image-response:${url}`);
 }catch(error){report.issues.push(`asset-network:${url}:${error.name}`);}
}
report.finishedAt=new Date().toISOString();report.issues=[...new Set(report.issues)];
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output,pages:report.pages.length,sitemapUrls:report.sitemapCount,assets:report.assets.length,issues:report.issues.length}));
process.exitCode=report.issues.length?1:0;
