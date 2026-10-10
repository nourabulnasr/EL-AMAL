import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicDomainRedirects,siteOrigin,robotsPolicy} from '../src/lib/site-policy.mjs';

test('domain cutover stays off on previews, local work and before canonical configuration',()=>{
 for(const env of [{},{VERCEL_ENV:'production'},{VERCEL_ENV:'preview',SITE_URL:'https://www.al-amaleg.com'},{VERCEL_ENV:'development',SITE_URL:'https://www.al-amaleg.com'},{VERCEL_ENV:'production',SITE_URL:'https://unrelated.example'}])assert.deepEqual(publicDomainRedirects(env),[]);
});
test('verified production domain receives public paths without catching API or staff routes',()=>{
 const env={VERCEL_ENV:'production',SITE_URL:'https://www.al-amaleg.com',CMS_ENABLED:'true',CATALOGUE_SOURCE:'cms',SITE_INDEXING_ENABLED:'true'};
 const rules=publicDomainRedirects(env);
 assert.equal(siteOrigin(env),'https://www.al-amaleg.com');
 assert.equal(robotsPolicy(env).sitemap,'https://www.al-amaleg.com/sitemap.xml');
 assert.equal(rules.length,2);
 for(const rule of rules){
  assert.equal(rule.permanent,true);
  assert.deepEqual(rule.has,[{type:'host',value:'el-amal-sigma.vercel.app'}]);
  assert.ok(rule.destination.startsWith('https://www.al-amaleg.com/'));
  assert.ok(['/', '/:locale(en|ar)/:path*'].includes(rule.source));
 }
 assert.equal(rules[1].destination,'https://www.al-amaleg.com/:locale/:path*');
});
