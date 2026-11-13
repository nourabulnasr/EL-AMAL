import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import * as esm from 'zod/v3';
const require=createRequire(import.meta.url);
const fromSdk=createRequire(require.resolve('inngest'));
const cjs=fromSdk('zod/v3');
test('Inngest resolves the patched compatibility parser',()=>{
 assert.equal(fromSdk.resolve('zod/v3'),require.resolve('zod/v3'));
});

// Exercise the compatibility API actually imported by Inngest, not zod's v4 entry.
for(const [format,z] of [['ESM',esm],['CommonJS',cjs]]){
 for(const kind of ['array max','array exact','set max']){
  test(format+' rejects oversized '+kind+' before parsing children',async()=>{
   let visited=0;
   const item=z.string().superRefine(()=>{visited++;});
   const schema=kind==='set max'?z.set(item).max(2):kind==='array exact'?z.array(item).length(2):z.array(item).max(2);
   const input=kind==='set max'?new Set(['a','b','c']):['a','b','c'];
   const result=schema.safeParse(input);
   assert.equal(result.success,false);
   assert.equal(visited,0,'Oversized collections must fail before child validation');
   assert.equal(result.error.issues.length,1);
   assert.equal(result.error.issues[0].code,'too_big');
   const asyncResult=await schema.safeParseAsync(input);
   assert.equal(asyncResult.success,false);
   assert.equal(visited,0);
   const valid=kind==='set max'?new Set(['a','b']):['a','b'];
   assert.equal(schema.safeParse(valid).success,true);
   assert.equal(visited,2,'Valid collections still validate their children');
  });
 }
 test(format+' retains malformed-child errors within allowed size',()=>{
  const result=z.array(z.string()).max(2).safeParse([123]);
  assert.equal(result.success,false);
  assert.deepEqual(result.error.issues[0].path,[0]);
  assert.equal(result.error.issues[0].code,'invalid_type');
 });
}
