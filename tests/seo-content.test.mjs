import {test} from 'node:test';
import assert from 'node:assert/strict';
import {industries} from '../src/content/industry-pages.ts';
import {seoGuides} from '../src/content/seo-guides.ts';
import {buildSiteSchema} from '../src/lib/site-schema.ts';
import {buildIndustryPageSchema} from '../src/lib/seo-page-schema.ts';

test('every public product industry has a substantial bilingual landing page',()=>{
 assert.deepEqual(industries.map(item=>item.id),['oil-gas','pharmaceuticals','food-beverage','general-industry']);
 for(const industry of industries){
  for(const locale of ['en','ar']){
   const copy=industry[locale];
   assert.ok(copy.title.length>=4,`${industry.id} ${locale} title`);
   assert.ok(copy.metaDescription.length>=100&&copy.metaDescription.length<=170,`${industry.id} ${locale} meta description length`);
   assert.ok(copy.intro.length>=120,`${industry.id} ${locale} intro`);
   assert.equal(copy.checks.length,3,`${industry.id} ${locale} checks`);
   assert.ok(copy.faqs.length>=2,`${industry.id} ${locale} FAQs`);
  }
 }
});

test('solution guides cover the primary commercial search intents without duplicate copy',()=>{
 assert.deepEqual(seoGuides.map(guide=>guide.id),['pressure-instruments-egypt','temperature-instruments-egypt','wika-instruments-egypt']);
 const descriptions=[];
 for(const guide of seoGuides){
  for(const locale of ['en','ar']){
   const copy=guide[locale];
   assert.ok(copy.metaTitle.length>=25&&copy.metaTitle.length<=65,`${guide.id} ${locale} title length`);
   assert.ok(copy.metaDescription.length>=110&&copy.metaDescription.length<=170,`${guide.id} ${locale} description length`);
   assert.equal(copy.sections.length,3,`${guide.id} ${locale} sections`);
   assert.ok(copy.faqs.length>=3,`${guide.id} ${locale} FAQs`);
   descriptions.push(copy.metaDescription);
  }
 }
 assert.equal(new Set(descriptions).size,descriptions.length);
});

test('site schema exposes localized catalogue search and verified business contact data',()=>{
 const schema=buildSiteSchema({locale:'ar',origin:'https://example.com',contact:{email:'sales@example.com',phone:'+201001234567',whatsapp:'201001234567'}});
 const website=schema['@graph'].find(node=>node['@type']==='WebSite');
 const organization=schema['@graph'].find(node=>node['@type']==='Organization');
 assert.equal(website.potentialAction.target.urlTemplate,'https://example.com/ar/products?q={search_term_string}');
 assert.equal(website.potentialAction['query-input'],'required name=search_term_string');
 assert.equal(organization.areaServed.name,'Egypt');
 assert.equal(organization.contactPoint.email,'sales@example.com');
 assert.equal(organization.contactPoint.telephone,'+201001234567');
});

test('industry schema mirrors the visible FAQ content and bilingual breadcrumb',()=>{
 const industry=industries.find(item=>item.id==='pharmaceuticals');
 const schema=buildIndustryPageSchema({locale:'en',origin:'https://example.com',industry});
 const faq=schema['@graph'].find(node=>node['@type']==='FAQPage');
 const breadcrumbs=schema['@graph'].find(node=>node['@type']==='BreadcrumbList');
 assert.equal(faq.mainEntity.length,industry.en.faqs.length);
 assert.equal(faq.mainEntity[0].name,industry.en.faqs[0].question);
 assert.equal(breadcrumbs.itemListElement[1].item,'https://example.com/en/industries/pharmaceuticals');
});
