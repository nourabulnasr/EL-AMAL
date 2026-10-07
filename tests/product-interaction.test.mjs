import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldMeasureActivation} from '../src/lib/product-interaction.ts';
test('right-click never counts; middle button is limited to links, not basket controls',()=>{
  assert.equal(shouldMeasureActivation('auxclick',2,true),false);
  assert.equal(shouldMeasureActivation('auxclick',1,true),true);
  assert.equal(shouldMeasureActivation('auxclick',1,false),false);
  assert.equal(shouldMeasureActivation('click',0,false),true);
  assert.equal(shouldMeasureActivation('click',1,false),false);
});
