import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchProducts } from '../src/lib/catalogue.ts';
import { readBasket, addLine } from '../src/lib/basket.ts';
import { validateImport } from '../src/lib/import.ts';

const products = [
 { id:'p1', model:'DEMO-P1', category:'pressure', name:{en:'Pressure instrument',ar:'أداة الضغط'}, description:{en:'Pressure',ar:'قياس الضغط'} },
 { id:'p2', model:'DEMO-T1', category:'temperature', name:{en:'Temperature instrument',ar:'أداة الحرارة'}, description:{en:'Temperature',ar:'قياس الحرارة'} },
];
test('model search ignores punctuation and respects the category intersection',()=>{
 assert.deepEqual(searchProducts(products,'demo p1','').map(p=>p.id),['p1']);
 assert.deepEqual(searchProducts(products,'demo p1','temperature'),[]);
});
test('Arabic search finds the corresponding product without modifying display',()=>{
 assert.deepEqual(searchProducts(products,'الحرارة','').map(p=>p.id),['p2']);
 assert.equal(products[1].model,'DEMO-T1');
});
test('exact model matches precede descriptive matches',()=>{
 const items=[{...products[1],description:{en:'DEMO-P1 accessory',ar:'ملحق'}}, products[0]];
 assert.equal(searchProducts(items,'DEMO-P1','')[0].id,'p1');
});
test('corrupt or invalid local storage cannot become a basket',()=>{
 for(const value of ['{','null','{}','[{"productId":"p1","quantity":-1}]','[{"productId":"p1","quantity":1.5}]']) assert.deepEqual(readBasket(value),[]);
});
test('basket deduplicates lines and rejects invalid quantities',()=>{
 assert.deepEqual(addLine([{productId:'p1',quantity:2}], 'p1',3),[{productId:'p1',quantity:5}]);
 assert.throws(()=>addLine([], 'p1',0));
 assert.throws(()=>addLine([], 'p1',1.5));
 assert.throws(()=>addLine([{productId:'p1',quantity:9999}], 'p1',1));
});
const row={external_id:'p1',model:'REAL-1',category_key:'pressure',name_en:'Name',name_ar:'اسم',description_en:'Description',description_ar:'وصف',source_ref:'page-1',review_status:'draft'};
test('import rejects duplicate identities, missing translations and unknown categories',()=>{
 assert.equal(validateImport([row],[],['pressure']).length,0);
 assert.ok(validateImport([row,row],[],['pressure']).some(e=>e.includes('duplicate')));
 assert.ok(validateImport([{...row,name_ar:''}],[],['pressure']).some(e=>e.includes('name_ar')));
 assert.ok(validateImport([row],[],['temperature']).some(e=>e.includes('category')));
});
test('opening stock requires integer quantities and an existing supplied product',()=>{
 const sku={sku_code:'SKU-1',product_external_id:'p1',configuration_json:'{}',opening_on_hand:2,stock_checked_at:'2026-09-17T10:00:00Z'};
 assert.equal(validateImport([row],[sku],['pressure']).length,0);
 for(const qty of [-1,0.5,NaN]) assert.ok(validateImport([row],[{...sku,opening_on_hand:qty}],['pressure']).length);
 assert.ok(validateImport([row],[{...sku,product_external_id:'missing'}],['pressure']).length);
});
test('import cannot mark an unreviewed product as published',()=>{
 assert.ok(validateImport([{...row,review_status:'published'}],[],['pressure']).length);
});
