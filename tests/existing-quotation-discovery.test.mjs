import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quotationDiscovery} from '../src/lib/quotation-discovery.ts';

test('existing quotation discovery names every supported format and keeps upload locked before verification',()=>{
 const en=quotationDiscovery('en');
 assert.equal(en.locked,true);
 assert.deepEqual(en.formats.map(format=>format.extension),['PDF','XLSX','JPEG','PNG']);
 assert.match(en.lockedMessage,/email/i);assert.match(en.lockedMessage,/file picker/i);
 assert.equal(en.formats.every(format=>format.label.length>0),true);
});

test('Arabic discovery has equivalent file and confirmation guidance',()=>{
 const ar=quotationDiscovery('ar');
 assert.equal(ar.locked,true);
 assert.deepEqual(ar.formats.map(format=>format.extension),['PDF','XLSX','JPEG','PNG']);
 assert.match(ar.lockedMessage,/البريد/);assert.match(ar.lockedMessage,/اختيار الملفات/);
});
