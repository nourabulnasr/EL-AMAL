import test from 'node:test';
import assert from 'node:assert/strict';
import nextConfig from '../next.config.mjs';

test('CMS theme negotiation never restarts a first public-page visit',async()=>{
 const rules=await nextConfig.headers();
 const themeRules=rules.filter(rule=>rule.headers.some(header=>header.key.toLowerCase()==='critical-ch'));
 assert.equal(themeRules.length,1);
 assert.deepEqual(themeRules.map(rule=>rule.source),['/admin/:path*']);
 const publicHeaders=rules.filter(rule=>rule.source==='/:path*').flatMap(rule=>rule.headers);
 assert.ok(!publicHeaders.some(header=>['critical-ch','accept-ch'].includes(header.key.toLowerCase())));
 assert.ok(publicHeaders.some(header=>header.key==='Content-Security-Policy'));
 assert.ok(publicHeaders.some(header=>header.key==='Strict-Transport-Security'));
});
