import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as catalogue from '../src/lib/catalogue.ts';
test('pagination bounds rendered records and resets invalid pages after filtering',()=>{
 assert.equal(typeof catalogue.paginateProducts,'function');
 const products=Array.from({length:51},(_,id)=>({id:String(id),model:`P${id}`,name:{en:'Gauge',ar:'مقياس'},description:{en:'Pressure',ar:'ضغط'},category:id<25?'pressure':'temperature'}));
 const second=catalogue.paginateProducts(products,'2');assert.equal(second.items.length,24);assert.equal(second.items[0].id,'24');assert.equal(second.total,51);assert.equal(second.pages,3);
 assert.equal(catalogue.paginateProducts(products,'3').items.length,3);
 const filtered=catalogue.searchProducts(products,'','pressure');
 assert.equal(catalogue.paginateProducts(filtered,'3').page,1);
 for(const page of ['0','-1','1.5','junk',Infinity,[],undefined])assert.equal(catalogue.paginateProducts(products,page).page,1);
 assert.deepEqual(catalogue.paginateProducts([],'9'),{items:[],page:1,pages:1,total:0,start:0,end:0});
});
