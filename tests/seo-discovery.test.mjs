import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCatalogueSitemap,cataloguePath,collectionSchema} from '../src/lib/seo-discovery.ts';
const live={SITE_INDEXING_ENABLED:'true',CATALOGUE_SOURCE:'cms',CMS_ENABLED:'true',VERCEL_ENV:'production',SITE_URL:'https://example.com'};
const products=Array.from({length:25},(_,i)=>({id:`model-${i+1}`,category:'pressure',details:{image:{src:'/images/pressure.png'}}}));
const catalogue={source:'cms',products,categories:[{id:'pressure'},{id:'empty'}]};
test('sitemap contains public bilingual products and real pagination but excludes forms and empty categories',()=>{
 const entries=buildCatalogueSitemap(catalogue,live),urls=entries.map(entry=>entry.url);
 for(const path of ['/en/products?page=2','/ar/products?page=2','/en/categories/pressure?page=2','/ar/products/model-25'])assert.ok(urls.includes(`https://example.com${path}`),path);
 for(const path of ['/en/rfq','/ar/quote','/en/verify','/en/categories/empty','/en/products?page=3'])assert.ok(!urls.includes(`https://example.com${path}`),path);
 assert.equal(new Set(urls).size,urls.length);
 const product=entries.find(entry=>entry.url==='https://example.com/ar/products/model-25');
 assert.deepEqual(product.images,['https://example.com/images/pressure.png']);
 assert.equal(product.alternates.languages.en,'https://example.com/en/products/model-25');
 assert.equal(product.alternates.languages['x-default'],'https://example.com/en/products/model-25');
 assert.equal(product.lastModified,undefined);
});
test('demo, preview and inactive CMS cannot produce an indexable sitemap',()=>{
 assert.deepEqual(buildCatalogueSitemap({...catalogue,source:'demo'},live),[]);
 for(const change of [{VERCEL_ENV:'preview'},{CMS_ENABLED:'false'},{SITE_INDEXING_ENABLED:'false'},{CATALOGUE_SOURCE:'demo'}])assert.deepEqual(buildCatalogueSitemap(catalogue,{...live,...change}),[]);
});
test('category and pagination links are canonical paths while actual faceted search retains its parameters',()=>{
 assert.equal(cataloguePath({category:'pressure',page:2}),'/categories/pressure?page=2');
 assert.equal(cataloguePath({category:'pressure'}),'/categories/pressure');
 assert.equal(cataloguePath({page:1}),'/products');
 assert.equal(cataloguePath({page:2}),'/products?page=2');
 assert.equal(cataloguePath({category:'pressure',query:'A & B',page:2}),'/products?q=A+%26+B&category=pressure&page=2');
});
test('collection schema describes the visible page and links actual products with their page positions',()=>{
 const schema=collectionSchema({locale:'ar',path:'/categories/pressure?page=2',title:'ضغط',items:[{id:'model-25',model:'P25',name:{en:'Gauge',ar:'مقياس'}}],start:25});
 const page=schema['@graph'][0],list=page.mainEntity;
 assert.equal(page.url,'https://el-amal-sigma.vercel.app/ar/categories/pressure?page=2');
 assert.equal(page.inLanguage,'ar');assert.equal(list.numberOfItems,1);
 assert.equal(list.itemListElement[0].position,25);
 assert.equal(list.itemListElement[0].url,'https://el-amal-sigma.vercel.app/ar/products/model-25');
 assert.equal(list.itemListElement[0].name,'P25 · مقياس');
 assert.equal(schema['@graph'][1]['@type'],'BreadcrumbList');
});
