import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectAboutStoryProducts} from '../src/lib/about-story.ts';

const product=(id,category,withImage=true)=>({id,category,model:id,name:{en:id,ar:id},description:{en:'',ar:''},details:withImage?{image:{src:`/images/products/${id}.webp`}}:undefined});

test('about story selects one photographed product per measurement family',()=>{
 const result=selectAboutStoryProducts([
  product('p1','pressure'),product('p2','pressure'),product('t1','temperature'),product('a1','accessories'),product('x','pressure',false),
 ]);
 assert.deepEqual(result.map(item=>item.id),['p1','t1','a1']);
});

test('about story never invents missing photography',()=>{
 assert.deepEqual(selectAboutStoryProducts([product('x','pressure',false)]),[]);
});
