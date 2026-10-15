import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getProductIndustries,getIndustryUseNote} from '../src/lib/product-industries.ts';

const wika=(model,applications=[])=>({model,applications,datasheetUrl:'https://www.wika.com/media/Data-sheets/test.pdf'});
const publications=['2026-09-27','2026-10-13'].flatMap(date=>JSON.parse(readFileSync(new URL(`../catalogue/${date}/publication.json`,import.meta.url),'utf8')).products);

test('all 165 catalogue groups have an explicit review without forcing medical gases into pharma',()=>{
  assert.equal(publications.length,165);
  const counts={'oil-gas':0,pharmaceuticals:0,'food-beverage':0,'general-industry':0};
  const unassigned=[];
  for(const product of publications){
    const industries=getProductIndustries(product);
    assert.equal(new Set(industries).size,industries.length);
    if(!industries.length)unassigned.push(product.model);
    for(const industry of industries){assert.ok(Object.hasOwn(counts,industry));counts[industry]++;}
  }
  assert.deepEqual(unassigned,['MG-1']);
  assert.deepEqual(counts,{'oil-gas':62,pharmaceuticals:13,'food-beverage':24,'general-industry':164});
});

test('known manufacturer classifications replace historic boiler and engine-oil substring matches',()=>{
  for(const model of ['DPGT40','DPGS40','DPGS40TA','DPG40','TC53','TR53','SB15']){
    assert.deepEqual(getProductIndustries(wika(model,['oil-gas','general-industry'])),['general-industry'],model);
  }
  assert.ok(getProductIndustries(wika('232.50 / 233.50')).includes('oil-gas'));
  assert.ok(getProductIndustries(wika('TC59-T')).includes('oil-gas'));
});

test('industry selections may overlap while plant utilities carry an explicit contact limit',()=>{
  assert.deepEqual(getProductIndustries(wika('PSD-4')),['pharmaceuticals','food-beverage','general-industry']);
  assert.deepEqual(getProductIndustries(wika('R-1')),['pharmaceuticals','food-beverage','general-industry']);
  for(const model of ['R-1','TF44','TR60']){
    assert.match(getIndustryUseNote(wika(model),'pharmaceuticals','en'),/utilities, not direct product contact/);
    assert.match(getIndustryUseNote(wika(model),'food-beverage','ar'),/ليس كتوصية للملامسة المباشرة/);
  }
  assert.match(getIndustryUseNote(wika('PSD-4'),'pharmaceuticals','en'),/Select the process connection/);
  assert.match(getIndustryUseNote(wika('TC10-F'),'food-beverage','en'),/thermowell/);
});

test('variants and similar names do not inherit an unrelated exact-family review',()=>{
  for(const model of ['PSD-4-ECO','PGS25','MG-1','MH-4','MH-4-CAN']){
    assert.ok(!getProductIndustries(wika(model)).includes('pharmaceuticals'),model);
  }
  assert.deepEqual(getProductIndustries(wika('555')),[]);
  assert.deepEqual(getProductIndustries(wika('232.50 with contacts')),[]);
  assert.equal(getIndustryUseNote(wika('55'),'pharmaceuticals','en'),undefined);
});

test('demo and other manufacturers cannot gain tags solely by matching a WIKA model name',()=>{
  assert.deepEqual(getProductIndustries({model:'PSD-4'}),[]);
  assert.deepEqual(getProductIndustries({model:'PSD-4',datasheetUrl:'https://wika.com.example.org/product.pdf'}),[]);
  assert.deepEqual(getProductIndustries({model:'PSD-4',datasheetUrl:'https://user:password@www.wika.com/product.pdf'}),[]);
  assert.deepEqual(getProductIndustries({model:'PSD-4',datasheetUrl:'http://www.wika.com/product.pdf'}),[]);
  assert.deepEqual(getProductIndustries({model:'PSD-4',details:{manufacturer:'WIKA'}}),['pharmaceuticals','food-beverage','general-industry']);
});

test('future reviewed CMS products retain allowlisted tags without stale or invented fields',()=>{
  const input={model:'FUTURE-MODEL',applications:['food-beverage','unsupported','food-beverage','oil-gas','pharmaceuticals']};
  assert.deepEqual(getProductIndustries(input),['oil-gas','pharmaceuticals','food-beverage']);
  assert.deepEqual(input.applications,['food-beverage','unsupported','food-beverage','oil-gas','pharmaceuticals']);
  assert.equal(getIndustryUseNote(input,'general-industry','en'),undefined);
  assert.match(getIndustryUseNote(input,'pharmaceuticals','ar'),/أكّد التطبيق/);
});
