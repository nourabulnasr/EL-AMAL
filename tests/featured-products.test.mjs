import test from 'node:test';
import assert from 'node:assert/strict';
import {selectFeaturedProducts} from '../src/lib/featured-products.ts';

const product=(id,model,details={})=>({id,model,category:'pressure',name:{en:model,ar:model},description:{en:model,ar:model},details});

test('homepage selection keeps the confirmed families and original identities in the requested order',()=>{
  const selected=selectFeaturedProducts([
    product('cms-135','IV1'),product('cms-165','55'),product('cms-138','IV2'),
    product('cms-152','232.50, 233.50'),product('cms-111','432.36, 432.56 with 8xx'),
  ]);
  assert.deepEqual(selected.map(entry=>[entry.kind,entry.product.id]),[
    ['pressure','cms-152'],['valve','cms-138'],['temperature','cms-165'],
  ]);
  assert.ok(selected.every(entry=>entry.title.ar&&entry.description.ar&&entry.detail.ar));
});

test('missing featured families never substitute a similar product or a demo image',()=>{
  const selected=selectFeaturedProducts([
    product('cms-138','IV2'),product('cms-21','555'),product('cms-22','232.50 with contacts'),
    product('demo-55','55',undefined),
  ].map(entry=>entry.id==='demo-55'?{...entry,details:undefined}:entry));
  assert.deepEqual(selected.map(entry=>entry.product.id),['cms-138']);
});
