import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productSuggestionPurpose,selectRelatedProducts} from '../src/lib/related-products.ts';

const date=new Date('2026-10-16T10:00:00Z');
const source=['2026-09-27','2026-10-13'].flatMap(day=>JSON.parse(readFileSync(new URL(`../catalogue/${day}/publication.json`,import.meta.url),'utf8')).products);
const products=source.map((p,index)=>({...p,id:`cms-${index+1}`,details:p.catalogueDetails}));
const product=model=>{const found=products.find(p=>p.model===model);assert.ok(found,model);return found;};
const choose=(current,candidates=products,options={})=>selectRelatedProducts(current,candidates,{now:date,...options});
const models=items=>items.map(p=>p.model);

test('a process gauge suggests complementary accessories instead of alternative gauges',()=>{
 const gauge=product('232.50, 233.50');
 const valve=product('IV2');
 assert.deepEqual(choose(gauge,[gauge,product('232.30, 233.30'),valve]),[valve]);
 assert.ok(choose(gauge).every(p=>p.category==='accessories'));
});

test('a valve suggests pressure measuring instruments in the opposite direction',()=>{
 const valve=product('IV2');
 const gauge=product('232.50, 233.50');
 assert.deepEqual(choose(valve,[valve,product('IV1'),product('55'),gauge]),[gauge]);
 assert.ok(choose(valve).every(p=>p.category==='pressure'));
});

test('a valve presents a gauge before other instruments when a reviewed gauge is available',()=>{
 const gauge={...product('232.50, 233.50'),applications:[]};
 assert.deepEqual(choose(product('IV2'),[product('APW, APA'),gauge],{limit:1}),[gauge]);
});

test('differential manifolds and single-pressure valves are not interchanged',()=>{
 const differential=product('DPGT43'),manifold=product('IV3, IV5'),gauge=product('232.50, 233.50'),valve=product('IV2');
 assert.deepEqual(choose(differential,[gauge,valve,manifold]),[manifold]);
 assert.deepEqual(choose(manifold,[gauge,valve,differential]),[differential]);
 assert.deepEqual(choose(gauge,[manifold]),[]);
});

test('temperature sensor input types determine transmitter suggestions',()=>{
 const rtd=product('TR10-A'),thermocouple=product('TC10-A');
 const rtdTransmitter=product('T15'),tcTransmitter=product('T16'),universal=product('T38');
 const candidates=[rtdTransmitter,tcTransmitter,universal,product('IV2')];
 assert.deepEqual(new Set(models(choose(rtd,candidates))),new Set(['T15','T38']));
 assert.deepEqual(new Set(models(choose(thermocouple,candidates))),new Set(['T16','T38']));
 assert.deepEqual(choose(rtdTransmitter,[thermocouple,rtd]),[rtd]);
});

test('directly documented temperature accessories retain their specific model pairing',()=>{
 const display=product('TND'),transmitter=product('T38'),tc=product('TC82');
 assert.deepEqual(choose(display,[product('T32'),product('T15'),transmitter]),[transmitter]);
 assert.ok(choose(transmitter).some(p=>p.model==='TND'));
 assert.deepEqual(new Set(models(choose(tc,[product('PP82'),product('IR80'),product('IV2')]))),new Set(['PP82','IR80']));
});

test('there is no invented match for dial thermometers, specialised sensors or unknown models',()=>{
 for(const model of ['55','TG53','MG-1','MH-3-HY'])assert.deepEqual(choose(product(model)),[],model);
 const unknown={...product('232.50, 233.50'),model:'New pressure gauge'};
 assert.deepEqual(choose(unknown),[]);
 assert.deepEqual(choose(product('IV2'),[unknown]),[]);
});

test('high-pressure fittings are not paired with ordinary lower-pressure instrument families',()=>{
 const valve=product('HPNV'),fittings=product('HPFA');
 assert.deepEqual(choose(valve,[product('232.50, 233.50'),product('910.12'),fittings]),[fittings]);
 assert.deepEqual(choose(fittings,[product('IV2'),valve]),[valve]);
});

test('unreviewed manufacturers do not inherit WIKA model associations',()=>{
 const unknown={...product('IV2'),details:undefined,datasheetUrl:'https://example.com/iv2.pdf'};
 assert.deepEqual(choose(unknown),[]);
 assert.deepEqual(choose(product('232.50, 233.50'),[unknown]),[]);
});

test('each suggestion explains its function in both languages and unrelated pairs have no purpose',()=>{
 for(const current of products)for(const candidate of choose(current)){
  const en=productSuggestionPurpose(current,candidate,'en'),ar=productSuggestionPurpose(current,candidate,'ar');
  assert.ok(en?.length,`${current.model} -> ${candidate.model}`);
  assert.match(ar,/[\u0600-\u06ff]/u);
  assert.notEqual(en,ar);
 }
 assert.equal(productSuggestionPurpose(product('55'),product('IV2'),'en'),undefined);
});

test('selection excludes duplicate identities, models and the viewed item',()=>{
 const valve=product('IV2'),gauge=product('232.50, 233.50');
 const candidates=[valve,gauge,{...gauge},{...gauge,id:'alias',model:'232.50 / 233.50'},product('212.20'),product('213.40')];
 const selected=choose(valve,candidates);
 assert.equal(selected.length,3);
 assert.equal(new Set(selected.map(p=>p.id)).size,3);
 assert.equal(selected.filter(p=>/232/.test(p.model)).length,1);
});

test('the same product and UTC day give the same selection without mutating catalogue order',()=>{
 const valve=product('IV2'),before=products.slice();
 assert.deepEqual(choose(valve),choose(valve,[...products].reverse()));
 assert.deepEqual(choose(valve),choose(valve,products,{now:new Date('2026-10-16T23:59:59Z')}));
 assert.deepEqual(products,before);
});

test('eligible instruments stay reviewed and never rotate randomly',()=>{
 for(const model of ['IV1','IV2','BV','910.12'])for(const candidate of choose(product(model)))
  assert.ok(productSuggestionPurpose(product(model),candidate,'en'));
 const daily=new Set(Array.from({length:10},(_,day)=>models(choose(product('IV2'),products,{now:new Date(Date.UTC(2026,9,16+day))})).sort().join(',')));
 assert.equal(daily.size,1);
});

test('limits and empty input remain bounded and graceful',()=>{
 const valve=product('IV2');
 assert.equal(choose(valve,products,{limit:100}).length,3);
 assert.equal(choose(valve,products,{limit:2}).length,2);
 assert.equal(choose(valve,products,{limit:0}).length,0);
 assert.equal(choose(valve,products,{limit:-1}).length,0);
 assert.equal(choose(valve,products,{limit:Number.NaN,now:new Date('invalid')}).length,3);
 assert.deepEqual(choose(valve,[]),[]);
});
