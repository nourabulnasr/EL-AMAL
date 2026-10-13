import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateImportantPublication, valveStockPatch, planImportantImport, assertImportTarget, resolveTargetPublication} from '../scripts/import-important-products.ts';

const read = file => JSON.parse(readFileSync(new URL(`../catalogue/2026-10-13/${file}`, import.meta.url), 'utf8'));
const dataset = () => read('publication.json');
const source = () => read('official-extraction.json');
const intake = () => read('intake-review.json');
const published = (p, id) => ({...structuredClone(p),id,category:p.category === 'pressure' ? 1 : 2,_status:'published',rightsConfirmed:true,reviewedBy:1,reviewedAt:'2026-10-13T00:00:00Z'});
const valves = () => dataset().stockUpdates.map((u, i) => published({externalId:u.externalId,model:u.model,category:'accessories',name:{en:'Live edited name',ar:'اسم محدث'},description:{en:'Live edited description',ar:'وصف محدث'},sourceRef:'Existing owner evidence',catalogueDetails:{...dataset().products[0].catalogueDetails,availability:'out-of-stock',availabilityReportedAt:'2026-09-27'}},u.id));
const categories = [{id:1,key:'pressure'},{id:2,key:'temperature'}];

test('dated publication exactly covers 14 additions and three existing valves with reviewed stock', () => {
  assert.equal(validateImportantPublication(dataset(), source(), intake()), true);
  for (const mutate of [d=>d.products.pop(),d=>d.products[0].model='OTHER',d=>d.products[0].catalogueDetails.availability='check',d=>d.stockUpdates[0].id=999,d=>d.products[0].catalogueDetails.availabilityReportedAt='2026-09-27']) {
    const d=dataset();mutate(d);assert.throws(()=>validateImportantPublication(d,source(),intake()));
  }
});

test('connection options retain direct 111 models while filling families have no invented model mapping', () => {
  const d=dataset();
  assert.deepEqual(d.products.find(p=>p.model==='111.10, 111.12').catalogueDetails.options.map(o=>o.model),['111.10','111.12']);
  assert.equal(d.products.filter(p=>p.catalogueDetails.options?.length).length,3);
  const family=d.products.find(p=>p.model==='232.50, 233.50');
  assert.ok(family.catalogueDetails.options.every(o=>o.model===undefined));
  family.catalogueDetails.options[1].model='233.50';
  assert.throws(()=>validateImportantPublication(d,source(),intake()),/option/i);
});

test('manufacturer applications retain oil/gas for process gauges without treating boilers as oil',()=>{
  const d=dataset();
  assert.deepEqual(d.products.find(p=>p.model==='232.50, 233.50').applications,['oil-gas','general-industry']);
  assert.deepEqual(d.products.find(p=>p.model==='DPG40').applications,['general-industry']);
});

test('valve stock patch preserves current bilingual content, provenance, image, options and identity', () => {
  const original=valves()[0];const before=structuredClone(original);
  const patch=valveStockPatch(original,dataset().stockUpdates[0]);
  assert.deepEqual(Object.keys(patch),['catalogueDetails']);
  assert.deepEqual(patch.catalogueDetails,{...original.catalogueDetails,availability:'in-stock',availabilityReportedAt:'2026-10-13'});
  assert.deepEqual(original,before);
  assert.throws(()=>valveStockPatch({...original,id:999},dataset().stockUpdates[0]),/identity/i);
  assert.throws(()=>valveStockPatch({...original,_status:'draft'},dataset().stockUpdates[0]),/published/i);
});

test('import planning preserves valve IDs, leaves unrelated contact models alone, and is idempotent', () => {
  const d=dataset();const first=planImportantImport(d,valves(),categories);
  assert.equal(first.create.length,14);assert.equal(first.stockUpdates.length,3);
  const current=d.products.map((p,i)=>published(p,i+200));
  const updated=valves().map(v=>({...v,...valveStockPatch(v,d.stockUpdates.find(u=>u.id===v.id))}));
  const next=planImportantImport(d,[...current,...updated,published({...d.products[0],externalId:'wika-contact',model:'432.36, 432.56 with 8xx'},999)],categories);
  assert.equal(next.create.length,0);assert.equal(next.unchanged.length,14);assert.equal(next.stockUpdates.length,0);
  assert.deepEqual(next.valveIds,[135,138,139]);
});

test('preflight refuses duplicate identities, model collisions and newer live edits before any mutation', () => {
  const d=dataset();const p=published(d.products[0],200);
  assert.throws(()=>planImportantImport(d,[...valves(),p,{...p,id:201}],categories),/duplicate/i);
  assert.throws(()=>planImportantImport(d,[...valves(),{...p,externalId:'unrelated'}],categories),/collision/i);
  assert.throws(()=>planImportantImport(d,[...valves(),{...p,name:{en:'Newer edit',ar:'تعديل أحدث'}}],categories),/changed/i);
  assert.throws(()=>planImportantImport(d,valves().slice(1),categories),/existing valve/i);
  assert.throws(()=>planImportantImport(d,valves(),[]),/category/i);
});

test('apply requires an explicit environment target and exact database match', () => {
  assert.equal(assertImportTarget('hosted',{DATABASE_URL:'postgres://expected'},{DATABASE_URL:'postgres://expected',OWNER_EMAIL:'owner',OWNER_PASSWORD:'secret'}),true);
  for(const [target,expected,env] of [[undefined,{},{}],['production',{},{}],['hosted',{DATABASE_URL:'postgres://expected'},{DATABASE_URL:'postgres://other',OWNER_EMAIL:'owner',OWNER_PASSWORD:'secret'}],['development',{DATABASE_URL:'postgres://expected'},{DATABASE_URL:'postgres://expected'}]])assert.throws(()=>assertImportTarget(target,expected,env));
});

test('development resolves stable valve identities to that database IDs while hosted retains production IDs',()=>{
  const d=dataset();const current=valves().map((v,i)=>({...v,id:50+i}));
  const target=resolveTargetPublication(d,current,'development');
  assert.deepEqual(target.stockUpdates.map(u=>u.id),[50,51,52]);
  assert.deepEqual(d.stockUpdates.map(u=>u.id),[135,138,139]);
  assert.deepEqual(planImportantImport(target,current,categories).valveIds,[50,51,52]);
  assert.throws(()=>resolveTargetPublication(d,current,'hosted'),/identity/i);
  assert.throws(()=>resolveTargetPublication(d,[{...current[0],model:'OTHER'},...current.slice(1)],'development'),/identity/i);
  assert.throws(()=>resolveTargetPublication(d,current.slice(1),'development'),/existing valve/i);
  assert.throws(()=>resolveTargetPublication(d,[...current,current[0]],'development'),/duplicate/i);
});
