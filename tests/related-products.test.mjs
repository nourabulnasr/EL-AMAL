import test from 'node:test';
import assert from 'node:assert/strict';
import {selectRelatedProducts} from '../src/lib/related-products.ts';

const date=new Date('2026-10-15T10:00:00Z');
const make=(id,overrides={})=>({id,model:`model-${id}`,category:'pressure',name:{en:id,ar:id},description:{en:id,ar:id},instrumentType:'gauges',applications:['oil-gas'],...overrides});
const choose=(current,products,options={})=>selectRelatedProducts(current,products,{now:date,...options});

test('recommendations exclude the viewed product, duplicate identities and duplicate models',()=>{
 const current=make('current',{model:'232.50 / 233.50'});
 const candidates=[current,make('same-model',{model:'232.50, 233.50'}),make('a'),make('a'),make('b',{model:'model-a'}),make('c'),make('d')];
 const selected=choose(current,candidates);
 assert.equal(selected.length,3);
 assert.ok(selected.every(product=>product.id!=='current'&&product.id!=='same-model'));
 assert.equal(new Set(selected.map(product=>product.id)).size,3);
 assert.equal(new Set(selected.map(product=>product.model)).size,3);
});

test('matching instrument types take precedence, then documented industry overlap',()=>{
 const current=make('current');
 const sameType=make('same-type',{applications:[]});
 const sameTypeAndIndustry=make('same-type-and-industry');
 const differentType=make('different-type',{instrumentType:'transmitters'});
 const wrongCategory=make('temperature',{category:'temperature'});
 assert.deepEqual(choose(current,[differentType,sameType,wrongCategory,sameTypeAndIndustry]).map(product=>product.id),['same-type-and-industry','same-type','different-type']);
});

test('an unrelated category is never used just to fill the section',()=>{
 const current=make('current');
 const other=make('other');
 assert.deepEqual(choose(current,[current,other,make('wrong',{category:'temperature'})]),[other]);
 assert.deepEqual(choose(current,[current,make('wrong',{category:'temperature'})]),[]);
});

test('the same product and day give the same selection regardless of catalogue order',()=>{
 const current=make('current'),products=Array.from({length:20},(_,index)=>make(String(index)));
 const before=products.slice();
 assert.deepEqual(choose(current,products),choose(current,[...products].reverse()));
 assert.deepEqual(choose(current,products),choose(current,products,{now:new Date('2026-10-15T23:59:59Z')}));
 assert.deepEqual(products,before);
});

test('equally relevant models vary by viewed product and rotate across days',()=>{
 const products=Array.from({length:24},(_,index)=>make(String(index)));
 const sets=new Set(products.slice(0,8).map(product=>choose(product,products).map(candidate=>candidate.id).sort().join(',')));
 assert.ok(sets.size>=6,'different product pages should not share one universal shortlist');
 const dailySets=new Set(Array.from({length:10},(_,index)=>choose(products[0],products,{now:new Date(`2026-10-${String(index+15).padStart(2,'0')}T10:00:00Z`)}).map(candidate=>candidate.id).sort().join(',')));
 assert.ok(dailySets.size>=6,'daily seeds should rotate relevant candidates');
});

test('missing optional fields and requested limits remain bounded and graceful',()=>{
 const current=make('current',{instrumentType:undefined,applications:undefined});
 const products=Array.from({length:8},(_,index)=>make(String(index),{instrumentType:undefined,applications:undefined}));
 assert.equal(choose(current,products).length,3);
 assert.equal(choose(current,products,{limit:100}).length,3);
 assert.equal(choose(current,products,{limit:2}).length,2);
 assert.equal(choose(current,products,{limit:0}).length,0);
 assert.equal(choose(current,products,{limit:-1}).length,0);
 assert.equal(choose(current,[]).length,0);
});
