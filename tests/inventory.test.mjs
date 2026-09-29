import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {parseInventoryCommand,canUseInventory,canPerformInventory,inventoryFingerprint,assertStockChange,InventoryError} from '../src/lib/inventory.ts';
import {inventoryHandlers} from '../src/lib/inventory-http.ts';
import {InventoryMovements,InventoryReservations} from '../src/cms/inventory.ts';
import {expireInventoryHolds} from '../src/lib/inventory-service.ts';
import {protectSkuIdentity} from '../src/lib/sku-identity.ts';

const actor=role=>({id:7,collection:'staff',role});
const receipt=()=>({kind:'receipt',requestKey:randomUUID(),skuId:12,quantity:5,reason:'Supplier receipt 42'});
test('only authenticated staff roles use inventory and each role has a bounded workflow',()=>{
  for(const user of [null,{role:'owner'},{...actor('owner'),collection:'customers'},actor('catalogue-editor')])assert.equal(canUseInventory(user),false);
  for(const role of ['owner','sales','warehouse'])assert.equal(canUseInventory(actor(role)),true);
  assert.equal(canPerformInventory(actor('sales'),'receipt'),false);
  assert.equal(canPerformInventory(actor('warehouse'),'hold'),false);
  assert.equal(canPerformInventory(actor('sales'),'hold'),true);
  assert.equal(canPerformInventory(actor('warehouse'),'dispatch'),true);
  assert.equal(canPerformInventory(actor('sales'),'dispatch'),false);
});
test('commands reject fractional or unsafe quantities, missing reasons and unexpected fields',()=>{
  assert.equal(parseInventoryCommand(receipt()).quantity,5);
  for(const quantity of [0,-1,1.1,Number.MAX_SAFE_INTEGER,'3'])assert.throws(()=>parseInventoryCommand({...receipt(),quantity}),InventoryError);
  for(const change of [{reason:' '},{skuId:0},{requestKey:'x'},{actorId:1}])assert.throws(()=>parseInventoryCommand({...receipt(),...change}),InventoryError);
  assert.equal(parseInventoryCommand({...receipt(),kind:'adjustment',quantity:-2}).quantity,-2);
  assert.throws(()=>parseInventoryCommand({...receipt(),kind:'hold'}),InventoryError);
});
test('idempotency fingerprints bind actor, action, exact SKU and normalized command details',()=>{
  const command=parseInventoryCommand(receipt());
  assert.equal(inventoryFingerprint(command,7),inventoryFingerprint({...command,requestKey:randomUUID()},7));
  assert.notEqual(inventoryFingerprint(command,7),inventoryFingerprint({...command,quantity:4},7));
  assert.notEqual(inventoryFingerprint(command,7),inventoryFingerprint(command,8));
});
test('stock changes cannot consume committed holds or go negative',()=>{
  assert.equal(assertStockChange(10,6,-4),6);
  assert.throws(()=>assertStockChange(10,6,-5),InventoryError);
  assert.throws(()=>assertStockChange(0,0,-1),InventoryError);
  assert.throws(()=>assertStockChange(999999999,0,1),InventoryError);
});
test('ledger and reservation records deny public reads and all direct API mutation',()=>{
  for(const collection of [InventoryMovements,InventoryReservations]){
    for(const role of [null,'owner','sales','warehouse','catalogue-editor']){
      const req={user:role?actor(role):null};
      for(const op of ['create','update','delete'])assert.equal(collection.access[op]({req}),false);
      assert.equal(collection.access.read({req}),['owner','sales','warehouse'].includes(role));
    }
    assert.throws(()=>collection.hooks.beforeChange[0]({operation:'update',data:{}}),/append-only/);
    assert.throws(()=>collection.hooks.beforeDelete[0]({id:1}),/append-only/);
  }
});
const request=(body,origin='https://example.test')=>new Request('https://example.test/api/staff/inventory',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
test('inventory HTTP prevents anonymous, wrong-role, cross-origin and oversized writes',async()=>{
  let actorValue=actor('owner');let writes=0;
  const handlers=inventoryHandlers({enabled:()=>true,authenticate:async()=>actorValue,read:async()=>({skus:[]}),execute:async()=>{writes++;return {repeated:false};}});
  assert.equal((await handlers.POST(request(receipt(),'https://evil.test'))).status,403);
  actorValue=null;assert.equal((await handlers.POST(request(receipt()))).status,403);
  actorValue=actor('sales');assert.equal((await handlers.POST(request(receipt()))).status,403);
  actorValue=actor('owner');assert.equal((await handlers.POST(request({...receipt(),reason:'x'.repeat(40000)}))).status,400);
  assert.equal(writes,0);
  const response=await handlers.POST(request(receipt()));
  assert.equal(response.status,201);assert.equal(response.headers.get('cache-control'),'no-store');
  actorValue=null;assert.equal((await handlers.GET(new Request('https://example.test/api/staff/inventory'))).status,403);
});
test('inventory HTTP returns bounded conflict details and never database diagnostics',async()=>{
  let error=new InventoryError('Insufficient available stock',409);
  const handlers=inventoryHandlers({enabled:()=>true,authenticate:async()=>actor('owner'),read:async()=>{throw error;},execute:async()=>{throw error;}});
  assert.equal((await handlers.POST(request(receipt()))).status,409);
  error=new Error('database password secret');
  const response=await handlers.POST(request(receipt()));
  assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/password|secret/);
});
test('inventory expiry honors the wall-clock deadline before contacting the database',async()=>{
  const payload={db:{pool:{query:async()=>{throw new Error('Expired budget must not query');}}}};
  assert.deepEqual(await expireInventoryHolds(payload,{deadlineAt:Date.now()-1,maxItems:10}),{expired:0});
});
test('inventory expiry can inspect an empty due queue within its deadline',async()=>{
  const payload={db:{pool:{query:async()=>({rows:[]})}}};
  assert.deepEqual(await expireInventoryHolds(payload,{deadlineAt:Date.now()+5000,maxItems:10}),{expired:0});
});
test('SKU identity cannot relabel recorded stock, while activation remains editable',()=>{
  const originalDoc={skuCode:'SKU-1',product:{id:8},manufacturerPartNumber:'WIKA-42',configuration:{range:'0-10',connection:'G1/2'}};
  for(const data of [{skuCode:'SKU-2'},{product:9},{manufacturerPartNumber:'WIKA-43'},{configuration:{range:'0-100',connection:'G1/2'}}]){
    assert.throws(()=>protectSkuIdentity({operation:'update',originalDoc,data}),/Create a new SKU/);
  }
  assert.deepEqual(protectSkuIdentity({operation:'update',originalDoc,data:{active:false}}),{active:false});
  const same={product:8,configuration:{connection:'G1/2',range:'0-10'}};
  assert.equal(protectSkuIdentity({operation:'update',originalDoc,data:same}),same);
  const created={skuCode:'NEW',product:9};
  assert.equal(protectSkuIdentity({operation:'create',data:created}),created);
});
