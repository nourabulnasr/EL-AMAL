import {test} from 'node:test';
import assert from 'node:assert/strict';
import {indexingEnabled,siteOrigin,indexingHeaders,robotsPolicy} from '../src/lib/site-policy.mjs';
import pathMatcher from 'next/dist/compiled/path-to-regexp/index.js';
import {pageMetadata} from '../src/lib/page-metadata.ts';
test('indexing requires explicit launch, real catalogue and production deployment',()=>{
 const live={SITE_INDEXING_ENABLED:'true',CATALOGUE_SOURCE:'cms',CMS_ENABLED:'true',VERCEL_ENV:'production'};
 assert.equal(indexingEnabled(live),true);
 for(const key of Object.keys(live))assert.equal(indexingEnabled({...live,[key]:undefined}),false);
 assert.equal(indexingEnabled({...live,CATALOGUE_SOURCE:'demo'}),false);
 assert.equal(indexingEnabled({...live,VERCEL_ENV:'preview'}),false);
});
test('production public metadata remains indexable while forms, tokens and filters stay excluded',()=>{
 const keys=['SITE_INDEXING_ENABLED','CATALOGUE_SOURCE','CMS_ENABLED','VERCEL_ENV'];
 const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
 Object.assign(process.env,{SITE_INDEXING_ENABLED:'true',CATALOGUE_SOURCE:'cms',CMS_ENABLED:'true',VERCEL_ENV:'production'});
 try{
  for(const path of ['/quote','/rfq','/verify','/verify?token=example','/products?q=pressure','/products?category=pressure','/products?type=pressure-gauge','/products?application=oil-gas']){
   assert.equal(pageMetadata('en',path,'Title','Description').robots.index,false,path);
  }
  for(const path of ['','/products','/products?page=2','/categories/pressure?page=2','/products/reviewed-model','/about']){
   assert.equal(pageMetadata('en',path,'Title','Description').robots.index,true,path);
  }
 }finally{for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
});
test('canonical origin rejects credentials and unsafe protocols',()=>{
 assert.equal(siteOrigin({SITE_URL:'https://example.com/path'}),'https://example.com');
 for(const value of ['javascript:alert(1)','https://user:password@example.com','invalid'])assert.equal(siteOrigin({SITE_URL:value}),'https://el-amal-sigma.vercel.app');
});
test('bilingual metadata has matching canonical, language and sharing links',()=>{
 const metadata=pageMetadata('ar','/rfq','طلب عرض سعر','التفاصيل');
 assert.ok(metadata.alternates.canonical.endsWith('/ar/rfq'));
 assert.ok(metadata.alternates.languages.en.endsWith('/en/rfq'));
 assert.equal(metadata.openGraph.locale,'ar_EG');assert.equal(metadata.twitter.title,'طلب عرض سعر');
 assert.ok(metadata.openGraph.images[0].url.endsWith('/social-image'));
 assert.equal(metadata.twitter.images[0],metadata.openGraph.images[0].url);
 assert.equal(pageMetadata('en','/quote','Basket','Details').robots.index,false);
});
test('HTTP indexing rules protect private and filtered paths without blocking public pagination or assets',()=>{
 const live={SITE_INDEXING_ENABLED:'true',CATALOGUE_SOURCE:'cms',CMS_ENABLED:'true',VERCEL_ENV:'production'};
 const headerFor=(path,env)=>{const url=new URL(path,'https://example.com');let result='';for(const rule of indexingHeaders(env)){if(pathMatcher.pathToRegexp(rule.source).test(url.pathname)&&(!rule.has||rule.has.every(condition=>url.searchParams.has(condition.key))))result=rule.headers.find(header=>header.key==='X-Robots-Tag').value;}return result;};
 for(const path of ['/en','/ar/products?page=2','/en/categories/pressure?page=2','/en/products/model-1','/favicon.ico','/icon.svg'])assert.equal(headerFor(path,live),'',path);
 for(const path of ['/admin','/admin/login','/staff','/staff/inventory','/api/products','/en/rfq','/ar/quote','/en/verify','/ar/products?q=DI10'])assert.match(headerFor(path,live),/noindex/,path);
 for(const change of [{CMS_ENABLED:'false'},{VERCEL_ENV:'preview'},{CATALOGUE_SOURCE:'demo'},{SITE_INDEXING_ENABLED:'false'}])assert.match(headerFor('/en/products/model-1',{...live,...change}),/noindex/);
 const robots=robotsPolicy(live);
 assert.equal(robots.sitemap,'https://el-amal-sigma.vercel.app/sitemap.xml');
 assert.ok(!robots.rules.disallow.includes('/en/quote'),'public form must be crawlable so noindex can be read');
 assert.equal(robotsPolicy({...live,VERCEL_ENV:'preview'}).sitemap,undefined);
});
