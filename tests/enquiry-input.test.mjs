import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseEnquiry, enquiryFingerprint, snapshotItems} from '../src/lib/enquiries.ts';
const input=()=>({requestKey:'12345678-1234-4234-8234-123456789abc',locale:'en',contact:{name:'Engineer',email:'engineer@example.invalid',company:'Test company',notes:''},lines:[{productId:'sample-1',quantity:2}]});
test('enquiry rejects malformed contacts, locales and unsafe quantities',()=>{
  for(const value of [null,{}, {...input(),locale:'fr'},{...input(),contact:{...input().contact,email:3}},{...input(),lines:[{productId:'sample-1',quantity:1.5}]},{...input(),lines:[]},{...input(),lines:[...input().lines,...input().lines]}]) assert.throws(()=>parseEnquiry(value));
});
test('equivalent requests have stable fingerprints; changed requests do not',()=>{
  const a=parseEnquiry(input());
  const b=parseEnquiry({...input(),contact:{...input().contact,name:' Engineer '}});
  assert.equal(enquiryFingerprint(a,'demo'),enquiryFingerprint(b,'demo'));
  assert.notEqual(enquiryFingerprint(a,'demo'),enquiryFingerprint({...a,locale:'ar'},'demo'));
  assert.notEqual(enquiryFingerprint(a,'demo'),enquiryFingerprint(a,'cms'));
});
test('item snapshots use server catalogue fields and reject unknown IDs',()=>{
  const product={id:'sample-1',model:'SERVER-MODEL',name:{en:'Gauge',ar:'مقياس'},category:'pressure',description:{en:'',ar:''}};
  const items=snapshotItems(parseEnquiry(input()).lines,[product]);
  assert.equal(items[0].model,'SERVER-MODEL');
  assert.equal(items[0].quantity,2);
  assert.throws(()=>snapshotItems([{productId:'unknown',quantity:1}],[product]));
});

test('direct RFQ validates model, quantity and range without catalogue IDs',()=>{
 const raw={...input(),lines:[],manual:{model:' CUSTOM-42 ',quantity:3,range:' 0–10 bar '}};
 const parsed=parseEnquiry(raw);
 assert.deepEqual(parsed.manual,{model:'CUSTOM-42',quantity:3,range:'0–10 bar'});
 assert.notEqual(enquiryFingerprint(parsed,'demo'),enquiryFingerprint({...parsed,manual:{...parsed.manual,range:'0–16 bar'}},'demo'));
 for(const change of [{model:''},{model:' '.repeat(5)},{quantity:0},{quantity:1.5},{quantity:'2'},{range:''},{range:'x'.repeat(161)}])assert.throws(()=>parseEnquiry({...raw,manual:{...raw.manual,...change}}));
 assert.throws(()=>parseEnquiry({...raw,lines:input().lines}));
});
