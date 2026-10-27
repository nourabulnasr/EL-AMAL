export const SUGGESTION_PROMPT_DELAY_MS=10_000;

export type SuggestionPromptState={
 panelOpen:boolean;
 promptVisible:boolean;
 settled:boolean;
};

export type SuggestionPromptEvent={type:'timer'|'open'|'close'|'dismiss'};

export const initialSuggestionPromptState:SuggestionPromptState={
 panelOpen:false,
 promptVisible:false,
 settled:false,
};

export function reduceSuggestionPrompt(state:SuggestionPromptState,event:SuggestionPromptEvent):SuggestionPromptState {
 switch(event.type){
  case 'timer':return state.settled?state:{...state,promptVisible:true};
  case 'open':return {panelOpen:true,promptVisible:false,settled:true};
  case 'close':return {...state,panelOpen:false,settled:true};
  case 'dismiss':return {panelOpen:false,promptVisible:false,settled:true};
 }
}

export function suggestionPanelMode(count:number):'products'|'assistance' {
 return count>0?'products':'assistance';
}
