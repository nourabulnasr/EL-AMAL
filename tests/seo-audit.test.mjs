import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectPage,extractSitemapUrls,publicAuditUrl} from '../scripts/lib/seo-audit.mjs';
const origin='https://example.com';
const html=`<html lang="en" dir="ltr"><head><title>Instruments | EL AMAL</title><meta name="description" content="Pressure &amp; temperature instruments"><meta name="robots" content="index, follow"><link rel="canonical" href="${origin}/en"><link rel="alternate" hreflang="en" href="${origin}/en"><link rel="alternate" hreflang="ar" href="${origin}/ar"><link rel="alternate" hreflang="x-default" href="${origin}/en"><meta property="og:title" content="Instruments"><meta property="og:description" content="Details"><meta property="og:url" content="${origin}/en"><meta property="og:image" content="${origin}/image.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${origin}/image.png"><link rel="icon" href="/favicon.ico"></head><body><h1>Instruments</h1><a href="/en/products?page=2&amp;q=foo">Filtered</a><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script><script>const fake='<meta name="robots" content="noindex">';</script></body></html>`;
test('live audit checks rendered metadata without confusing JavaScript strings with real meta tags',()=>{
 const result=inspectPage({html,url:`${origin}/en`,status:200,robotsHeader:'',expectIndexable:true});
 assert.deepEqual(result.issues,[]);
 assert.equal(result.description,'Pressure & temperature instruments');
 assert.deepEqual(result.links,[`${origin}/en/products?page=2&q=foo`]);
 assert.deepEqual(result.schemaTypes,['WebSite']);
});
test('live audit detects HTTP noindex, wrong canonical, missing hreflang, HTTP failures and invalid JSON-LD',()=>{
 const broken=html.replace(`${origin}/en\"><link rel=`,`${origin}/ar\"><link rel=`).replace('hreflang="ar"','hreflang="de"').replace('"@type":"WebSite"','oops');
 const result=inspectPage({html:broken,url:`${origin}/en`,status:500,robotsHeader:'noindex',expectIndexable:true});
 for(const code of ['http-status','canonical','hreflang-ar','noindex','invalid-jsonld'])assert.ok(result.issues.includes(code),code);
});
test('audit discovery accepts only public same-origin locale routes and excludes token, private and faceted URLs',()=>{
 for(const path of ['/en','/ar/products?page=2','/en/categories/pressure?page=3','/ar/products/model'])assert.ok(publicAuditUrl(new URL(path,origin).href,origin));
 for(const path of ['/admin','/api/products','/en/rfq','/ar/quote','/en/verify?token=x','/en/products?q=x','/en/products?category=pressure','/images/product.png','/fr'])assert.equal(publicAuditUrl(new URL(path,origin).href,origin),null,path);
 assert.equal(publicAuditUrl('https://unrelated.example/en',origin),null);
 assert.deepEqual(extractSitemapUrls('<url><loc>https://example.com/en/products?page=2&amp;x=1</loc><image:loc>https://example.com/image.png</image:loc></url>'),['https://example.com/en/products?page=2&x=1']);
});
test('audit recognizes the none robots rule as an indexing exclusion in metadata and HTTP headers',()=>{
 for(const source of ['meta','header']){
  const input={html:source==='meta'?html.replace('content="index, follow"','content="none"'):html,url:`${origin}/en`,status:200,robotsHeader:source==='header'?'none':''};
  assert.ok(inspectPage({...input,expectIndexable:true}).issues.includes('noindex'),source);
  assert.ok(!inspectPage({...input,expectIndexable:false}).issues.includes('missing-noindex'),source);
 }
});
test('audit rejects empty facet and unknown parameters instead of silently auditing their clean canonical',()=>{
 for(const path of ['/en/products?q=','/ar/products?category=','/en/products?type=&page=2','/en/products?application=','/en/products?unknown=']){
  assert.equal(publicAuditUrl(new URL(path,origin).href,origin),null,path);
 }
});
