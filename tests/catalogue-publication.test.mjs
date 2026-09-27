import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePublication,publicationUnchanged} from '../scripts/catalogue-publication.ts';
const text={en:'Pressure gauge',ar:'مقياس ضغط'};
const product={externalId:'wika-test',model:'TEST',category:'pressure',name:text,description:text,instrumentType:'pressure-gauge',applications:[],sourceRef:'source-page-1',catalogueDetails:{manufacturer:'WIKA',image:{src:'/images/products/wika-test.png',width:100,height:200,alt:text,sourceUrl:'https://www.wika.com/catalogue.pdf'},specifications:[{label:text,value:{en:'0 … 10 bar',ar:'0 … 10 bar'}}],availability:'in-stock',availabilityReportedAt:'2026-09-27',datasheets:[{title:'TEST',url:'https://www.wika.com/test.pdf'}]}};
const source=[{model:'TEST',sourceId:'source-page-1',availability:'in-stock'}];
const dataset=()=>({categories:[{key:'pressure',name:text,description:text}],products:[structuredClone(product)]});
test('catalogue publication requires complete exact source coverage',()=>{
 assert.equal(validatePublication(dataset(),source),true);
 assert.throws(()=>validatePublication({...dataset(),products:[]},source),/coverage/);
 const duplicate=dataset();duplicate.products.push(structuredClone(product));assert.throws(()=>validatePublication(duplicate,source),/coverage|duplicate/);
 const replaced=dataset();replaced.products[0].model='OTHER';assert.throws(()=>validatePublication(replaced,source),/source/);
});
test('catalogue publication rejects changed stock, incomplete translations and fake photos',()=>{
 for(const mutate of [p=>p.catalogueDetails.availability='out-of-stock',p=>p.name.ar='Pressure gauge',p=>p.catalogueDetails.image.src='/images/demo.png',p=>p.catalogueDetails.specifications=[],p=>p.category='absent']){
  const data=dataset();mutate(data.products[0]);assert.throws(()=>validatePublication(data,source));
 }
});
test('idempotent comparison ignores CMS metadata but detects content and publication changes',()=>{
 const published={...product,category:42,_status:'published',id:1,updatedAt:'today',rightsConfirmed:true,reviewedBy:1,reviewedAt:'2026-09-27T00:00:00Z'};
 assert.equal(publicationUnchanged(published,{...product,category:42}),true);
 assert.equal(publicationUnchanged({...published,_status:'draft'},{...product,category:42}),false);
 assert.equal(publicationUnchanged({...published,name:{...text,en:'Changed'}},{...product,category:42}),false);
 assert.equal(publicationUnchanged({...published,rightsConfirmed:false},{...product,category:42}),false);
});
