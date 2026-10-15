import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchProducts} from '../src/lib/catalogue.ts';
import {toPublicCatalogue} from '../src/lib/public-catalogue.ts';
import {cataloguePath} from '../src/lib/seo-discovery.ts';
test('type and application intersect with search and category',()=>{
 const a={id:'a',model:'A',category:'pressure',name:{en:'Gauge',ar:'عداد'},description:{en:'',ar:''},instrumentType:'pressure-gauge',applications:['oil-gas']};
 const b={...a,id:'b',model:'B',instrumentType:'pressure-transmitter',applications:['general-industry']};
 assert.deepEqual(searchProducts([a,b],'','pressure','pressure-gauge','oil-gas'),[a]);
 assert.deepEqual(searchProducts([a,b],'','pressure','pressure-gauge','general-industry'),[]);
 assert.deepEqual(searchProducts([a,b],'عداد','','','oil-gas'),[a]);
});

test('manufacturer industry mapping reaches public filters without changing stored CMS values',()=>{
 const category={id:1,key:'pressure',name:{en:'Pressure',ar:'الضغط'},description:{en:'Pressure',ar:'الضغط'}};
 const base={category:1,name:{en:'Pressure switch',ar:'مفتاح ضغط'},description:{en:'Reviewed switch',ar:'مفتاح'},_status:'published',sourceRef:'Manufacturer',reviewedBy:1,reviewedAt:'2026-10-15',rightsConfirmed:true,instrumentType:'pressure-switch'};
 const record={...base,id:1,model:'PSD-4',datasheetUrl:'https://www.wika.com/media/Data-sheets/Pressure/Pressure-sensors/ds_pe8159_en_co.pdf',applications:['general-industry']};
 const other={...base,id:2,model:'DPG40',instrumentType:'pressure-gauge',datasheetUrl:'https://www.wika.com/media/Data-sheets/Pressure/Pressure-gauges/ds_pm0733_en_co.pdf',applications:['general-industry']};
 const {products}=toPublicCatalogue([record,other],[category]);
 assert.deepEqual(searchProducts(products,'PSD','pressure','pressure-switch','pharmaceuticals').map(product=>product.model),['PSD-4']);
 assert.deepEqual(searchProducts(products,'','pressure','pressure-gauge','pharmaceuticals'),[]);
 assert.deepEqual(searchProducts(products,'مفتاح','','','food-beverage').map(product=>product.model),['PSD-4']);
 assert.deepEqual(record.applications,['general-industry']);
});

test('industry pagination and combined filters have shareable URLs',()=>{
 assert.equal(cataloguePath({category:'pressure',application:'food-beverage',instrumentType:'pressure-switch',page:2}),'/products?category=pressure&type=pressure-switch&application=food-beverage&page=2');
 assert.equal(cataloguePath({category:'pressure',application:'pharmaceuticals'}),'/products?category=pressure&application=pharmaceuticals');
});
