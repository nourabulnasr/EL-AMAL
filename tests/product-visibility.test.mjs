import test from 'node:test';
import assert from 'node:assert/strict';
import {VisibilityWindow} from '../src/lib/product-visibility.ts';
test('impressions need one continuous second at half visibility and only emit once',()=>{
  const state=new VisibilityWindow();
  state.update(.49,true,0);assert.equal(state.take(2000),false);
  state.update(.5,true,2000);assert.equal(state.take(2999),false);assert.equal(state.take(3000),true);assert.equal(state.take(4000),false);
});
test('hidden documents and scroll departures reset the entire visibility interval',()=>{
  const state=new VisibilityWindow();
  state.update(1,true,0);state.update(1,false,800);assert.equal(state.take(3000),false);
  state.update(1,true,3000);state.update(.2,true,3800);assert.equal(state.take(4000),false);
  state.update(1,true,5000);assert.equal(state.take(6000),true);
});
