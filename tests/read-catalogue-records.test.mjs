import test from 'node:test';
import assert from 'node:assert/strict';
import {readCatalogueRecords} from '../src/lib/read-catalogue-records.ts';

test('both independent catalogue reads start before either first page resolves',async()=>{
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 const started=[];
 const result=readCatalogueRecords(
  async page=>{started.push(['products',page]);await gate;return {docs:[{id:1}],hasNextPage:false};},
  async page=>{started.push(['categories',page]);await gate;return {docs:[{id:2}],hasNextPage:false};},
 );
 const beforeResolution=[...started];
 release();
 assert.deepEqual(await result,[[{id:1}],[{id:2}]]);
 assert.deepEqual(beforeResolution,[['products',1],['categories',1]]);
});

test('pagination keeps every page in order with at most one request per collection',async()=>{
 const pages={products:[[{id:1}],[],[{id:2},{id:3}]],categories:[[{id:4}],[{id:5}]]};
 const calls={products:[],categories:[]},active={products:0,categories:0};
 let maxTotal=0;
 const reader=collection=>async page=>{
  calls[collection].push(page);
  active[collection]++;
  assert.equal(active[collection],1);
  maxTotal=Math.max(maxTotal,active.products+active.categories);
  await new Promise(resolve=>setImmediate(resolve));
  active[collection]--;
  return {docs:pages[collection][page-1],hasNextPage:page<pages[collection].length};
 };
 const result=await readCatalogueRecords(reader('products'),reader('categories'));
 assert.deepEqual(result,[[{id:1},{id:2},{id:3}],[{id:4},{id:5}]]);
 assert.deepEqual(calls,{products:[1,2,3],categories:[1,2]});
 assert.equal(maxTotal,2);
});

for(const collection of ['products','categories']){
 test(`a later ${collection} failure rejects the catalogue without a partial fallback`,async()=>{
  const failure=new Error('Catalogue read failed');
  const reader=name=>async page=>{
   if(name===collection&&page===2)throw failure;
   return {docs:[{id:`${name}-${page}`}],hasNextPage:page===1};
  };
  await assert.rejects(readCatalogueRecords(reader('products'),reader('categories')),error=>error===failure);
 });
}

test('a subsequent read observes changed publication data instead of cached records',async()=>{
 let products=[{id:'published'}];
 const readProducts=async()=>({docs:products,hasNextPage:false});
 const readCategories=async()=>({docs:[{id:'category'}],hasNextPage:false});
 assert.deepEqual((await readCatalogueRecords(readProducts,readCategories))[0],[{id:'published'}]);
 products=[];
 assert.deepEqual(await readCatalogueRecords(readProducts,readCategories),[[],[{id:'category'}]]);
});
