import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retryDelay,deliverNextNotification} from '../src/lib/notification-worker.ts';
import {Notifications} from '../src/cms/notifications.ts';
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
