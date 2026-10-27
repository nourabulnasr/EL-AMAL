import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUGGESTION_PROMPT_DELAY_MS,
  initialSuggestionPromptState,
  reduceSuggestionPrompt,
  suggestionPanelMode,
} from '../src/lib/suggestion-prompt.ts';

test('the suggestion prompt becomes visible after ten seconds',()=>{
  assert.equal(SUGGESTION_PROMPT_DELAY_MS,10_000);
  assert.deepEqual(
    reduceSuggestionPrompt(initialSuggestionPromptState,{type:'timer'}),
    {panelOpen:false,promptVisible:true,settled:false},
  );
});

test('opening suggestions suppresses the timed prompt for the rest of the product view',()=>{
  const opened=reduceSuggestionPrompt(initialSuggestionPromptState,{type:'open'});
  assert.deepEqual(opened,{panelOpen:true,promptVisible:false,settled:true});
  assert.equal(reduceSuggestionPrompt(opened,{type:'timer'}).promptVisible,false);
});

test('dismissing the timed prompt does not open the suggestions panel',()=>{
  const prompted=reduceSuggestionPrompt(initialSuggestionPromptState,{type:'timer'});
  assert.deepEqual(
    reduceSuggestionPrompt(prompted,{type:'dismiss'}),
    {panelOpen:false,promptVisible:false,settled:true},
  );
});

test('every product receives either reviewed products or engineering assistance',()=>{
  assert.equal(suggestionPanelMode(3),'products');
  assert.equal(suggestionPanelMode(0),'assistance');
});
