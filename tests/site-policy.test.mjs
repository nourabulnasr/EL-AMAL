import {test} from 'node:test';
import assert from 'node:assert/strict';
import {indexingEnabled,siteOrigin} from '../src/lib/site-policy.mjs';
import {pageMetadata} from '../src/lib/page-metadata.ts';
test('indexing requires explicit launch, real catalogue and production deployment',()=>{
 const live={SITE_INDEXING_ENABLED:'true',CATALOGUE_SOURCE:'cms',VERCEL_ENV:'production'};
 assert.equal(indexingEnabled(live),true);
 for(const key of Object.keys(live))assert.equal(indexingEnabled({...live,[key]:undefined}),false);
 assert.equal(indexingEnabled({...live,CATALOGUE_SOURCE:'demo'}),false);
 assert.equal(indexingEnabled({...live,VERCEL_ENV:'preview'}),false);
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
 assert.equal(pageMetadata('en','/quote','Basket','Details').robots.index,false);
});
