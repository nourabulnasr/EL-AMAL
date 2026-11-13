import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import ts from 'typescript';
import {VisibilityWindow} from '../src/lib/product-visibility.ts';
import {shouldMeasureActivation} from '../src/lib/product-interaction.ts';

// Execute the real observer with a deterministic clock and DOM/observer adapters.
// This specifically reproduces a delayed IntersectionObserver update on close.
function fixture(){
 let now=0,open=true,tick,mutate,intersection,id=0;
 const timers=new Map(),requests=[];
 const scope={dataset:{interestProduct:'cms-156',interestLocale:'en',interestList:'related'}};
 const card={isConnected:true,closest(selector){return selector==='[data-interest-product]'?scope:!open?{}:null;},getClientRects(){return open?[{}]:[];}};
 const document={hidden:false,body:{},querySelector:()=>null,querySelectorAll:()=>[card],addEventListener(){},removeEventListener(){}};
 const timeout=fn=>{const key=++id;timers.set(key,fn);return key;};
 const sandbox={exports:{},require(name){return name.includes('product-visibility')?{VisibilityWindow}:{shouldMeasureActivation};},document,performance:{now:()=>now},window:{setTimeout:timeout,setInterval:fn=>{tick=fn;return 1;}},clearTimeout:key=>timers.delete(key),clearInterval(){},requestAnimationFrame:fn=>{fn();return 1;},cancelAnimationFrame(){},fetch:async(_url,options)=>{requests.push(JSON.parse(options.body));return {ok:true};},IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){}unobserve(){}disconnect(){}},MutationObserver:class{constructor(fn){mutate=fn;}observe(){}disconnect(){}},HTMLElement:class{},Element:class{},HTMLAnchorElement:class{},HTMLButtonElement:class{}};
 const code=ts.transpileModule(readFileSync(new URL('../src/lib/product-interest-browser.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInContext(code,createContext(sandbox));
 const stop=sandbox.exports.observeProductInterest();
 return {requests,stop,show(){intersection([{target:card,intersectionRatio:1}]);},close(){open=false;},open(){open=true;},mutate(){mutate();},async advance(time){now=time;const pending=[...timers.values()];timers.clear();for(const fn of pending)fn();tick();await Promise.resolve();}};
}
test('a collapsed Suggestions panel cannot record a queued impression',async()=>{
 const f=fixture();f.show();f.close();await f.advance(1005);
 assert.deepEqual(f.requests,[]);f.stop();
});
test('open Suggestions record one impression after a full viewing interval',async()=>{
 const f=fixture();f.show();await f.advance(1005);
 assert.equal(f.requests.length,1);assert.equal(f.requests[0].events[0].kind,'impression');
 await f.advance(2500);assert.equal(f.requests.length,1);f.stop();
});
