import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateEnquiry} from '../src/lib/enquiry-preview.ts';
const valid={name:'Test Person',email:'person@example.com',company:'Example',notes:'Pressure measurement'};
test('enquiry preview requires a name, company and valid email',()=>{
 assert.deepEqual(validateEnquiry(valid),{});
 assert.deepEqual(Object.keys(validateEnquiry({...valid,name:' ',email:'wrong',company:''})).sort(),['company','email','name']);
});
test('enquiry preview rejects overlong details',()=>{
 assert.ok(validateEnquiry({...valid,notes:'x'.repeat(2001)}).notes);
 assert.ok(validateEnquiry({...valid,name:'x'.repeat(121)}).name);
});
