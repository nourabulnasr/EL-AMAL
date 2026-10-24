import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchProducts,paginateProducts} from '../src/lib/catalogue.ts';
const products=['2026-09-27','2026-10-13'].flatMap(day=>JSON.parse(readFileSync(new URL('../catalogue/'+day+'/publication.json',import.meta.url),'utf8')).products).map((p,index)=>({...p,id:'cms-'+(index+1)}));
test('pressure promotes the requested late catalogue groups while preserving every record',()=>{
 const source=products.filter(p=>p.category==='pressure');
 const result=searchProducts(products,'','pressure');
 assert.deepEqual(result.slice(0,4).map(p=>p.model),['212.20','213.40','113.53, 213.53','232.50, 233.50']);
 assert.equal(result[10].model,'DPG40');
 assert.deepEqual(new Set(result.map(p=>p.id)),new Set(source.map(p=>p.id)));
 assert.equal(result.length,source.length);
 assert.deepEqual(result.slice(11),source.filter(p=>!result.slice(0,11).includes(p)));
});
test('temperature first page contains the original third-page cohort, in its requested order',()=>{
 const first=paginateProducts(searchProducts(products,'','temperature'),'1').items;
 assert.equal(first.length,24);
 assert.equal(first[0].model,'TR53');
 assert.equal(first[23].model,'TFS135');
 assert.deepEqual(first.slice(13,19).map(p=>p.model),['T15','T32','T16','T91','T38','TIF50, TIF52']);
 const result=searchProducts(products,'','temperature');
 assert.equal(new Set(result.map(p=>p.id)).size,result.length);
 assert.equal(result.length,products.filter(p=>p.category==='temperature').length);
});
test('priority is independent of CMS identity and leaves all-category order intact',()=>{
 const renamed=products.map(p=>({...p,id:'preview-'+p.id}));
 assert.deepEqual(searchProducts(renamed,'','pressure').map(p=>p.model),searchProducts(products,'','pressure').map(p=>p.model));
 assert.deepEqual(searchProducts(products,'',''),products);
});
test('exact searches and combined filters retain precedence over merchandising',()=>{
 const preferred=products.find(p=>p.model==='TR53');
 const exact={...preferred,id:'exact',model:'SPECIAL',instrumentType:'sensor',applications:['pharmaceuticals']};
 const mention={...preferred,id:'mention',description:{en:'SPECIAL accessory',ar:'ملحق'},instrumentType:'sensor',applications:['pharmaceuticals']};
 const excluded={...preferred,id:'excluded',model:'TR75',description:{en:'SPECIAL accessory',ar:'ملحق'},instrumentType:'other',applications:['pharmaceuticals']};
 assert.deepEqual(searchProducts([mention,excluded,exact],'SPECIAL','temperature','sensor','pharmaceuticals').map(p=>p.id),['exact','mention']);
 assert.deepEqual(searchProducts([mention,exact],'SPECIAL','pressure'),[]);
});
