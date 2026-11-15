import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retryDelay,deliverNextNotification} from '../src/lib/notification-worker.ts';
import {Notifications} from '../src/cms/notifications.ts';
import {verificationMessage,sealMessage,openMessage} from '../src/lib/verification-message.ts';

test('both customer email locales carry a reference and preserve the confirmation link in both formats',()=>{
 const settings={from:'enquiries@example.invalid',origin:'https://example.invalid',secret:'s'.repeat(40)};
 for(const locale of ['en','ar']){
  const token='a'.repeat(64);
  const message=verificationMessage(settings,'buyer@example.invalid',locale,token,'EA-test');
  assert.ok(message.text.includes('EA-test'));
  assert.ok(message.html.includes(`lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}"`));
  for(const body of [message.text,message.html])assert.ok(body.includes(`/${locale}/verify#token=${token}`));
  assert.deepEqual(openMessage(sealMessage(message,settings.secret,'test-key'),settings.secret,'test-key'),message);
 }
});
test('without a sender the worker performs no database or delivery work',async()=>{
 assert.deepEqual(await deliverNextNotification({}),{outcome:'disabled'});
});
test('retry delays back off and remain bounded',()=>{
 assert.equal(retryDelay(1),60);assert.equal(retryDelay(3),240);assert.equal(retryDelay(100),3600);
});
test('notification records cannot be forged or edited via staff APIs',()=>{
 for(const role of ['owner','sales','warehouse','catalogue-editor']){
  const context={req:{user:{role}}};
  assert.equal(Notifications.access.create(context),false);assert.equal(Notifications.access.update(context),false);assert.equal(Notifications.access.delete(context),false);
  assert.equal(Notifications.access.read(context),role==='owner'||role==='sales');
 }
 assert.equal(Notifications.access.read({req:{user:null}}),false);
});
