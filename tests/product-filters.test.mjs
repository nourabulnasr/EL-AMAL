import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchProducts} from '../src/lib/catalogue.ts';
test('type and application intersect with search and category',()=>{
 const a={id:'a',model:'A',category:'pressure',name:{en:'Gauge',ar:'عداد'},description:{en:'',ar:''},instrumentType:'pressure-gauge',applications:['oil-gas']};
 const b={...a,id:'b',model:'B',instrumentType:'pressure-transmitter',applications:['general-industry']};
 assert.deepEqual(searchProducts([a,b],'','pressure','pressure-gauge','oil-gas'),[a]);
 assert.deepEqual(searchProducts([a,b],'','pressure','pressure-gauge','general-industry'),[]);
 assert.deepEqual(searchProducts([a,b],'عداد','','','oil-gas'),[a]);
});
