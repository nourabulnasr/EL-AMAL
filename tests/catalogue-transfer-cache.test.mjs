import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {toPublicCatalogue,catalogueSource} from '../src/lib/public-catalogue.ts';
import {readCatalogueRecords} from '../src/lib/read-catalogue-records.ts';

function fixture(){
 const text={en:'Pressure',ar:'ضغط'};
 const state={products:[{id:7,model:'P7',category:3,name:text,description:text,_status:'published',sourceRef:'PRIVATE',reviewedBy:1,reviewedAt:'2026-09-19',rightsConfirmed:true,updatedAt:'2026-10-26T00:00:00Z'}],categories:[{id:3,key:'pressure',name:text,description:text,updatedAt:'2026-10-26T00:00:00Z'}],fail:false,fullReads:0,revisions:0};
 const stored=new Map();
 const payload={find:async options=>{
  assert.equal(options.depth,0);
  assert.equal(options.overrideAccess,true);
  if(options.collection==='products'){
   assert.equal(options.draft,false);
   assert.equal(JSON.stringify(options.where),JSON.stringify({_status:{equals:'published'}}));
  }
  if(options.select)assert.equal(JSON.stringify(options.select),JSON.stringify({updatedAt:true}));
  if(state.fail)throw new Error('database unavailable');
  const records=state[options.collection].filter(x=>options.collection!=='products'||x._status==='published');
  if(options.select){state.revisions++;return {docs:records.map(({id,updatedAt})=>({id,updatedAt})),hasNextPage:false};}
  state.fullReads++;
  return {docs:structuredClone(records),hasNextPage:false};
 }};
 const modules={'server-only':{},react:{cache:fn=>fn},'next/server':{connection:async()=>{}},'next/cache':{unstable_cache:(fn,parts)=>async(...args)=>{
  const key=JSON.stringify([parts,args]);if(!stored.has(key))stored.set(key,await fn(...args));return stored.get(key);
 }},'node:crypto':{createHash},'@/content/catalogue':{products:[],categories:[]},'./cms-runtime':{cmsEnabled:()=>true},'./public-catalogue':{toPublicCatalogue,catalogueSource},'./read-catalogue-records':{readCatalogueRecords},payload:{getPayload:async()=>payload},'@/payload.config':{default:{}}};
 const sandbox={exports:{},require:name=>{assert.ok(name in modules,name);return modules[name];},process:{env:{CATALOGUE_SOURCE:'cms',DATABASE_URL:'postgres://test-only',VERCEL_GIT_COMMIT_SHA:'test-release'}}};
 const source=readFileSync(new URL('../src/lib/load-catalogue.ts',import.meta.url),'utf8');
 runInContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,createContext(sandbox));
 return {state,stored,load:sandbox.exports.loadCatalogue};
}
test('separate requests reuse catalogue bodies after a lightweight publication check',async()=>{
 const f=fixture();await f.load();await f.load();
 assert.equal(f.state.fullReads,2,'one full read of each collection, not one per request');
 assert.equal(f.state.revisions,4);
 assert.equal(JSON.stringify([...f.stored.values()]).includes('PRIVATE'),false);
});
test('unpublishing or deleting a product invalidates the cached public result immediately',async()=>{
 for(const remove of [f=>{f.state.products[0]._status='draft';},f=>{f.state.products=[];}]){
  const f=fixture();assert.equal((await f.load()).products.length,1);remove(f);assert.equal((await f.load()).products.length,0);
 }
});
test('product and category edits create a fresh cache revision',async()=>{
 const f=fixture();await f.load();f.state.products[0].model='P8';f.state.products[0].updatedAt='2026-10-26T01:00:00Z';
 assert.equal((await f.load()).products[0].model,'P8');
 f.state.categories[0].name={en:'New category',ar:'ضغط'};f.state.categories[0].updatedAt='2026-10-26T02:00:00Z';
 assert.equal((await f.load()).categories[0].name.en,'New category');
});
test('a failed live publication check never returns potentially withdrawn cached products',async()=>{
 const f=fixture();await f.load();f.state.fail=true;await assert.rejects(f.load(),/database unavailable/);
});
