import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verificationMessage,sealMessage,openMessage,validateVerificationSettings} from '../src/lib/verification-message.ts';
const settings={secret:'test-secret-'.repeat(4),origin:'https://example.invalid',from:'sender@example.invalid'};
test('verification envelopes are randomized, authenticated and bound to a delivery',()=>{
 const message=verificationMessage(settings,'customer@example.invalid','en','a'.repeat(64));
 const sealed=sealMessage(message,settings.secret,'generation-one');
 assert.deepEqual(openMessage(sealed,settings.secret,'generation-one'),message);
 assert.notEqual(sealed,sealMessage(message,settings.secret,'generation-one'));
 assert.equal(sealed.includes(message.to),false);assert.equal(sealed.includes('a'.repeat(64)),false);
 assert.throws(()=>openMessage(sealed,settings.secret,'generation-two'));
 assert.throws(()=>openMessage(sealed,'different-secret-'.repeat(4),'generation-one'));
 const parts=sealed.split('.');parts[2]=(parts[2][0]==='A'?'B':'A')+parts[2].slice(1);
 assert.throws(()=>openMessage(parts.join('.'),settings.secret,'generation-one'));
 for(const value of ['v2.bad.bad.bad','v1.A.A.A','x'.repeat(16001)])assert.throws(()=>openMessage(value,settings.secret,'generation-one'));
});
test('verification messages use validated origins and bilingual explicit confirmation links',()=>{
 for(const origin of ['http://example.invalid','https://user@example.invalid','https://example.invalid/path','https://example.invalid?x=1'])assert.throws(()=>validateVerificationSettings({...settings,origin}));
 assert.throws(()=>validateVerificationSettings({...settings,secret:'short'}));
 assert.throws(()=>validateVerificationSettings({...settings,from:'Name <sender@example.invalid>'}));
 for(const locale of ['en','ar']){
  const message=verificationMessage(settings,'customer@example.invalid',locale,'b'.repeat(64));
  assert.ok(message.text.includes(`/${locale}/verify#token=`));
  assert.equal(message.from,settings.from);
 }
});
