import {test} from 'node:test';
import assert from 'node:assert/strict';
import {toPublicCatalogue, catalogueSource} from '../src/lib/public-catalogue.ts';

const translated={en:'Pressure',ar:'ضغط'};
const category={id:3,key:'pressure',name:translated,description:translated};
const published={id:7,externalId:'real-7',model:'P7',category:3,name:translated,description:translated,_status:'published',sourceRef:'PRIVATE',reviewedBy:1,reviewedAt:'2026-09-19',rightsConfirmed:true};
test('public projection excludes drafts and private fields',()=>{
 const result=toPublicCatalogue([published,{...published,id:8,_status:'draft'}],[category]);
 assert.equal(result.products.length,1);
 assert.deepEqual(Object.keys(result.products[0]).sort(),['category','description','id','model','name']);
 assert.equal(result.products[0].id,'cms-7');
 assert.equal(JSON.stringify(result).includes('PRIVATE'),false);
});
test('unreviewed, incomplete and orphaned records cannot appear publicly',()=>{
 for(const change of [{rightsConfirmed:false},{reviewedAt:null},{name:{en:'Pressure',ar:''}},{category:999}]){
  assert.equal(toPublicCatalogue([{...published,...change}],[category]).products.length,0);
 }
 assert.deepEqual(toPublicCatalogue([], [category]).categories,[]);
});
test('populated category relationships map to the public category key',()=>{
 assert.equal(toPublicCatalogue([{...published,category}],[category]).products[0].category,'pressure');
});
test('demo is explicit default, invalid source fails instead of silently showing fixtures',()=>{
 assert.equal(catalogueSource(undefined),'demo');
 assert.equal(catalogueSource('cms'),'cms');
 assert.throws(()=>catalogueSource('production'));
});
