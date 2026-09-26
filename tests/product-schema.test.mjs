import {test} from 'node:test';
import assert from 'node:assert/strict';
import {productSchema,schemaJson} from '../src/lib/product-schema.ts';
const product={id:'example',model:'MODEL',name:{en:'Instrument',ar:'أداة'},description:{en:'Reviewed description',ar:'وصف معتمد'},category:'pressure'};
test('sample schemas do not assert real products, prices, ratings or stock',()=>{
 const demo=productSchema(product,'en','demo');assert.equal(demo['@graph'].some(x=>x['@type']==='Product'),false);
 const real=productSchema(product,'ar','cms');const p=real['@graph'].find(x=>x['@type']==='Product');assert.equal(p.name,'أداة');
 for(const field of ['offers','aggregateRating','brand','availability'])assert.equal(p[field],undefined);
 assert.ok(real['@graph'][1].itemListElement.every(x=>x.item.includes('/ar')));
});
test('structured data escapes HTML closing tags without changing content',()=>{
 const value={name:'</script><script>alert(1)</script>'};const output=schemaJson(value);
 assert.equal(output.includes('<'),false);assert.deepEqual(JSON.parse(output),value);
});
