'use client';

import {useEffect,useId,useReducer,useRef,type ReactNode} from 'react';
import {
 SUGGESTION_PROMPT_DELAY_MS,
 initialSuggestionPromptState,
 reduceSuggestionPrompt,
} from '@/lib/suggestion-prompt';

type Props={children:ReactNode;count:number;locale:'en'|'ar'};

export function SuggestionDisclosure({children,count,locale}:Props) {
 const [state,dispatch]=useReducer(reduceSuggestionPrompt,initialSuggestionPromptState);
 const panelId=useId(),headingId=useId(),rootRef=useRef<HTMLElement>(null);
 const ar=locale==='ar';

 useEffect(()=>{
  let timer:number;
  const offer=()=>{
   if(document.querySelector('.analytics-notice')){
    timer=window.setTimeout(offer,2_000);
    return;
   }
   dispatch({type:'timer'});
  };
  timer=window.setTimeout(offer,SUGGESTION_PROMPT_DELAY_MS);
  return ()=>window.clearTimeout(timer);
 },[]);

 const openPanel=()=>{
  dispatch({type:'open'});
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.requestAnimationFrame(()=>rootRef.current?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
 };

 return <section ref={rootRef} className="related-products suggestions-disclosure" aria-labelledby={headingId}>
  <button className="suggestions-trigger" type="button" aria-expanded={state.panelOpen} aria-controls={panelId} onClick={()=>dispatch({type:state.panelOpen?'close':'open'})}>
   <span className="suggestions-symbol" aria-hidden="true">＋</span>
   <span><strong id={headingId}>{ar?'مقترحات تُكمل اختيارك':'Complete your setup'}</strong><span>{ar?'اعرض المنتجات المتكاملة أو اطلب مساعدة فنية':'See complementary products or get configuration help'}</span></span>
   <span className="suggestions-count">{count|| (ar?'اسأل':'Ask')}</span>
  </button>
  <div id={panelId} className="suggestions-content" hidden={!state.panelOpen}>{children}</div>
  {state.promptVisible?<SuggestionPrompt locale={locale} count={count} onOpen={openPanel} onDismiss={()=>dispatch({type:'dismiss'})}/>:null}
 </section>;
}

function SuggestionPrompt({locale,count,onOpen,onDismiss}:{locale:'en'|'ar';count:number;onOpen:()=>void;onDismiss:()=>void}) {
 const ar=locale==='ar',titleId=useId();
 return <aside className="suggestions-prompt" aria-labelledby={titleId} aria-live="polite">
  <button className="suggestions-prompt-close" type="button" onClick={onDismiss} aria-label={ar?'إغلاق المقترح':'Dismiss suggestion'}>×</button>
  <span className="suggestions-prompt-mark" aria-hidden="true">＋</span>
  <div>
   <strong id={titleId}>{ar?'أكمل منظومة القياس':'Complete the measurement setup'}</strong>
   <p>{count
    ? ar?`وجدنا ${count} من المنتجات المتكاملة لهذا الاختيار.`:`We found ${count} complementary ${count===1?'product':'products'} for this instrument.`
    : ar?'يمكن لفريقنا مراجعة التوصيلات والنطاق والمواد معك.':'Our team can review the connections, range and materials with you.'}</p>
   <button className="suggestions-prompt-action" type="button" onClick={onOpen}>{ar?'عرض المقترحات':'View suggestions'}<span aria-hidden="true">↗</span></button>
  </div>
 </aside>;
}
