import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogueMetadataState} from '../src/lib/seo-discovery.ts';

test('technical and commercial filters are noindex and canonicalize to the clean category',()=>{
 const state=catalogueMetadataState({query:'gauge',category:'pressure',application:'oil-gas',technical:{size:['size-100']},page:3});
 assert.equal(state.filtered,true);
 assert.equal(state.visiblePath,'/products?q=gauge&category=pressure&application=oil-gas&page=3&f-size=size-100');
 assert.equal(state.canonicalPath,'/categories/pressure');
});

test('clean catalogue pagination remains canonical and indexable',()=>{
 assert.deepEqual(catalogueMetadataState({page:2}),{filtered:false,visiblePath:'/products?page=2',canonicalPath:'/products?page=2'});
 assert.deepEqual(catalogueMetadataState({category:'pressure',page:2}),{filtered:true,visiblePath:'/products?category=pressure&page=2',canonicalPath:'/categories/pressure?page=2'});
});
