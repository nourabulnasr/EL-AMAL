import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cmsEnabled} from '../src/lib/cms-runtime.ts';
import {Staff} from '../src/cms/collections.ts';
test('CMS is disabled unless explicitly enabled with complete credentials',()=>{
 assert.equal(cmsEnabled({}),false);
 assert.equal(cmsEnabled({CMS_ENABLED:'true',DATABASE_URL:'postgres://test'}),false);
 assert.equal(cmsEnabled({CMS_ENABLED:'false',DATABASE_URL:'postgres://test',PAYLOAD_SECRET:'x'.repeat(64)}),false);
 assert.equal(cmsEnabled({CMS_ENABLED:'true',DATABASE_URL:'postgres://test',PAYLOAD_SECRET:'x'.repeat(64)}),true);
});
test('public first-owner registration is explicitly blocked',async()=>{
 const endpoint=Staff.endpoints.find(e=>e.path==='/first-register'&&e.method==='post');
 assert.ok(endpoint);
 assert.equal((await endpoint.handler({})).status,403);
});
