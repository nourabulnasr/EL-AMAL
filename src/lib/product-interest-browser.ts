import {VisibilityWindow} from './product-visibility';
import {shouldMeasureActivation} from './product-interaction';
import type {InterestEvent,InterestKind,InterestList} from './product-interest';

/** Loaded only after an affirmative visitor choice. Content remains server-rendered. */
export function observeProductInterest(){
  let stopped=false,inFlight=false;
  let queue:InterestEvent[]=[];
  const sent=new Set<string>();
  const states=new Map<HTMLElement,{state:VisibilityWindow;ratio:number;timer:number|undefined;signature:string}>();
  const visible=()=>!document.hidden&&!document.querySelector('.site-intro');
  const context=(element:HTMLElement,kind:InterestKind):InterestEvent|undefined=>{
    const scope=element.closest<HTMLElement>('[data-interest-product]');
    const productId=scope?.dataset.interestProduct,locale=scope?.dataset.interestLocale;
    const list=scope?.dataset.interestList as InterestList|undefined;
    if(!productId?.match(/^cms-[1-9]\d*$/)||!list||(locale!=='ar'&&locale!=='en'))return;
    return {productId,locale,list,kind};
  };
  const flush=async()=>{
    if(stopped||inFlight||queue.length===0)return;
    const batch=queue.splice(0,32);inFlight=true;
    try{
      const result=await fetch('/api/product-interest',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:batch}),keepalive:true});
      if(!result.ok){
        // No endless retries, and no replay into a different/expired session.
        for(const event of batch)sent.delete(JSON.stringify(event));
      }
    }catch{for(const event of batch)sent.delete(JSON.stringify(event));}
    finally{inFlight=false;}
  };
  const enqueue=(event:InterestEvent|undefined)=>{
    if(!event||stopped)return;
    const key=JSON.stringify(event);if(sent.has(key)||queue.length>=128)return;
    sent.add(key);queue.push(event);
  };
  const evaluate=(element:HTMLElement)=>{
    const value=states.get(element);if(!value)return;
    const eligible=value.ratio>=.5&&visible()&&element.isConnected;
    value.state.update(value.ratio,eligible,performance.now());
    if(!eligible){if(value.timer!==undefined)clearTimeout(value.timer);value.timer=undefined;}
    if(eligible&&value.timer===undefined)value.timer=window.setTimeout(()=>{
      value.timer=undefined;
      value.state.update(value.ratio,visible()&&element.isConnected,performance.now());
      if(value.state.take(performance.now()))enqueue(context(element,element.closest<HTMLElement>('[data-interest-product]')?.dataset.interestList==='detail'?'view':'impression'));
    },1005);
  };
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){const element=entry.target as HTMLElement,value=states.get(element);if(value){value.ratio=entry.intersectionRatio;evaluate(element);}}
  },{threshold:[0,.5]});
  const scan=()=>{
    for(const [element,value] of states)if(!element.isConnected){if(value.timer!==undefined)clearTimeout(value.timer);observer.unobserve(element);states.delete(element);}
    for(const element of document.querySelectorAll<HTMLElement>('[data-interest-observe]')){
      const signature=JSON.stringify(context(element,'impression')),previous=states.get(element);
      if(previous?.signature===signature)continue;
      if(previous?.timer!==undefined)clearTimeout(previous.timer);
      states.set(element,{state:new VisibilityWindow(),ratio:previous?.ratio??0,timer:undefined,signature});observer.observe(element);
    }
  };
  let frame:number|undefined;
  const mutations=new MutationObserver(()=>{if(frame!==undefined)return;frame=requestAnimationFrame(()=>{frame=undefined;scan();for(const element of states.keys())evaluate(element);});});
  const click=(event:MouseEvent)=>{
    if(!event.isTrusted||!visible()||!(event.target instanceof Element))return;
    const action=event.target.closest<HTMLElement>('[data-interest-kind]');
    if(action){if(!shouldMeasureActivation(event.type,event.button,action instanceof HTMLAnchorElement)||action instanceof HTMLButtonElement&&action.disabled)return;enqueue(context(action,action.dataset.interestKind as InterestKind));void flush();return;}
    const link=event.target.closest<HTMLAnchorElement>('a[href]'),card=link?.closest<HTMLElement>('[data-interest-product]');
    if(card&&shouldMeasureActivation(event.type,event.button,true)&&card.dataset.interestList!=='detail'&&link?.pathname===`/${card.dataset.interestLocale}/products/${card.dataset.interestProduct}`&&sent.has(JSON.stringify(context(card,'impression')))){enqueue(context(card,'selection'));void flush();}
  };
  const visibility=()=>{for(const element of states.keys())evaluate(element);if(document.hidden)void flush();};
  const flushTimer=window.setInterval(()=>void flush(),1500);
  scan();mutations.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-interest-product','data-interest-list','data-interest-locale']});
  document.addEventListener('click',click);document.addEventListener('auxclick',click);document.addEventListener('visibilitychange',visibility);
  return ()=>{
    // Withdrawal/navigation stops new measurements immediately. Pending unsent
    // events are discarded so opting out cannot trigger one final analytics send.
    stopped=true;queue=[];clearInterval(flushTimer);if(frame!==undefined)cancelAnimationFrame(frame);
    for(const value of states.values())if(value.timer!==undefined)clearTimeout(value.timer);
    observer.disconnect();mutations.disconnect();document.removeEventListener('click',click);document.removeEventListener('auxclick',click);document.removeEventListener('visibilitychange',visibility);
  };
}
