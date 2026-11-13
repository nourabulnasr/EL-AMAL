'use client';

import {useEffect,useState} from 'react';
import type {EditorProps} from '@monaco-editor/react';
// Deep import deliberately bypasses the exact webpack alias for the public entry.
import Editor,{loader} from '@monaco-editor/react/dist/index.js';

let preparation:Promise<void>|undefined;
function prepareEditor(){
 if(!preparation){
  preparation=(async()=>{
   self.MonacoEnvironment={getWorker(_id:string,label:string){
    if(label==='json')return new Worker(new URL('monaco-editor/language/json/json.worker.js',import.meta.url));
    return new Worker(new URL('monaco-editor/editor/editor.worker.js',import.meta.url));
   }};
   const monaco=await import('monaco-editor');
   // Payload uses the pre-0.56 language namespace for JSON diagnostics.
   loader.config({monaco:{...monaco,languages:{...monaco.languages,json:monaco.json}}});
  })().catch(error=>{preparation=undefined;throw error;});
 }
 return preparation;
}

/** Loaded by Payload only when an editor is required. Never falls back to a CDN. */
export default function LocalMonacoEditor(props:EditorProps){
 const [state,setState]=useState<'loading'|'ready'|'failed'>('loading');
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let active=true;
  void prepareEditor().then(()=>{if(active)setState('ready');},()=>{if(active)setState('failed');});
  return ()=>{active=false;};
 },[attempt]);
 if(state==='failed')return <div role="alert">The editor could not load. Your saved data has not changed. <button type="button" onClick={()=>{setState('loading');setAttempt(value=>value+1);}}>Retry editor</button></div>;
 if(state!=='ready')return <>{props.loading??<p role="status">Loading editor…</p>}</>;
 return <Editor {...props}/>;
}
