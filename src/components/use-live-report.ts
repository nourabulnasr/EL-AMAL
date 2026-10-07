'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
export function useLiveReport<T>(initial:T,url:string,initialUpdatedAt:string){
  const [data,setData]=useState(initial),[updatedAt,setUpdatedAt]=useState(initialUpdatedAt),[automatic,setAutomatic]=useState(true),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  const inFlight=useRef(false),active=useRef(true),controller=useRef<AbortController|null>(null);
  useEffect(()=>{setData(initial);setUpdatedAt(initialUpdatedAt);setError('');},[initial,initialUpdatedAt]);
  const refresh=useCallback(async()=>{
    if(inFlight.current)return;inFlight.current=true;setLoading(true);
    const abort=new AbortController();controller.current=abort;
    const timeout=window.setTimeout(()=>abort.abort(),15000);
    try{
      const response=await fetch(url,{cache:'no-store',credentials:'same-origin',signal:abort.signal});
      if(!response.ok){if(response.status===403)setAutomatic(false);throw new Error(response.status===403?'Your session or report permission has changed. Sign in again.':'Refresh failed. The table shows the last successful result.');}
      const result=await response.json();if(active.current){setData(result);setUpdatedAt(new Date().toISOString());setError('');}
    }catch(reason){if(active.current)setError(reason instanceof Error&&reason.name!=='AbortError'?reason.message:'Refresh could not finish. The table shows the last successful result.');}
    finally{clearTimeout(timeout);inFlight.current=false;if(active.current)setLoading(false);}
  },[url]);
  useEffect(()=>{active.current=true;return()=>{active.current=false;controller.current?.abort();};},[]);
  useEffect(()=>{const update=()=>{if(automatic&&!document.hidden)void refresh();};const timer=window.setInterval(update,30000);document.addEventListener('visibilitychange',update);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update);};},[automatic,refresh]);
  return {data,updatedAt,automatic,setAutomatic,error,loading,refresh};
}
