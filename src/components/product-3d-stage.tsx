'use client';

import {createContext,useContext,useEffect,useId,useRef,useState,type ReactNode} from 'react';
import type {FeaturedKind} from '@/lib/featured-products';
import type {Locale} from '@/lib/catalogue';
import type {ProductScene} from './product-3d-scene';
import './product-3d-stage.css';

const ActiveScene=createContext<{active:string|null;setActive:(id:string|null)=>void}>({active:null,setActive:()=>{}});

/** Share only one optional GPU viewer across the three server-rendered products. */
export function Product3DGallery({children}:{children:ReactNode}) {
  const [active,setActive]=useState<string|null>(null);
  return <ActiveScene.Provider value={{active,setActive}}>{children}</ActiveScene.Provider>;
}

export function Product3DStage({children,kind,locale,model}:{children:ReactNode;kind:FeaturedKind;locale:Locale;model:string}) {
  const {active,setActive}=useContext(ActiveScene);
  const id=useId(),open=active===id,ar=locale==='ar';
  const host=useRef<HTMLDivElement>(null),scene=useRef<ProductScene|null>(null);
  const [mounted,setMounted]=useState(false),[status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  useEffect(()=>setMounted(true),[]);
  useEffect(()=>{
    if(!open||!host.current)return;
    let cancelled=false;
    setStatus('loading');
    // No Three.js download, WebGL context or animation before a deliberate click.
    void import('./product-3d-scene').then(({createProductScene})=>{
      if(cancelled||!host.current)return;
      scene.current=createProductScene(host.current,kind,()=>{if(!cancelled)setStatus('error');});
      setStatus('ready');
    }).catch(()=>{if(!cancelled)setStatus('error');});
    return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};
  },[open,kind]);
  return <div className="featured-stage product-3d-stage" data-3d-open={open&&status==='ready'?true:undefined}>
    <div className="product-3d-photo" hidden={open&&status==='ready'}>{children}</div>
    {open&&<div ref={host} className="product-3d-canvas" hidden={status==='error'}
      role="group" aria-label={`${ar?'عرض ثلاثي الأبعاد توضيحي':'Illustrative 3D view'} — ${model}`} tabIndex={status==='ready'?0:-1}
      aria-describedby={`${id}-instructions`} onKeyDown={event=>{
        const keys:Record<string,[number,number]>={ArrowLeft:[-.22,0],ArrowRight:[.22,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]};
        if(keys[event.key]){event.preventDefault();scene.current?.rotate(...keys[event.key]);}
        if(event.key==='Home'){event.preventDefault();scene.current?.reset();}
      }}/ >}
    {mounted&&<div className="product-3d-toolbar">
      <button type="button" className="product-3d-toggle" aria-expanded={open} onClick={()=>setActive(open?null:id)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7Z M3 7l9 5 9-5 M12 12v10"/></svg>
        {open?(ar?'الصورة الحقيقية':'Actual photo'):(ar?'استكشف بالأبعاد الثلاثة':'Explore in 3D')}
      </button>
      {open&&status==='ready'&&<div className="product-3d-controls">
        <button type="button" onClick={()=>scene.current?.rotate(-.3,0)} aria-label={ar?'تدوير إلى اليسار':'Rotate left'}>↶</button>
        <button type="button" onClick={()=>scene.current?.reset()}>{ar?'إعادة الضبط':'Reset'}</button>
        <button type="button" onClick={()=>scene.current?.rotate(.3,0)} aria-label={ar?'تدوير إلى اليمين':'Rotate right'}>↷</button>
      </div>}
    </div>}
    {open&&<p id={`${id}-instructions`} className="product-3d-note" role="status">
      {status==='loading'?(ar?'جارٍ تجهيز العرض…':'Preparing the view…'):status==='error'?(ar?'العرض ثلاثي الأبعاد غير متاح على هذا الجهاز. الصورة الحقيقية متاحة.':'3D is unavailable on this device. The actual photo is still available.'):
        (ar?'اسحب للتدوير أو استخدم مفاتيح الأسهم. نموذج توضيحي مبسّط؛ راجع الصورة والمواصفات للتكوين الفعلي.':'Drag or use arrow keys to rotate. Simplified illustration; see the photo and specifications for the actual configuration.')}
    </p>}
  </div>;
}
