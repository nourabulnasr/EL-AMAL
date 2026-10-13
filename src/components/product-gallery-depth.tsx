'use client';

import {useEffect,useRef,useState,type ComponentType,type ReactNode} from 'react';

type DepthProps={children:ReactNode};

/** Download the motion code only near the gallery on a suitable device. */
export function ProductGalleryDepth({children}:DepthProps) {
  const scene=useRef<HTMLDivElement>(null);
  const [Interactive,setInteractive]=useState<ComponentType<DepthProps>|null>(null);
  useEffect(()=>{
    const media=matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let alive=true,near=false;
    const sync=()=>{
      if(!media.matches){setInteractive(null);return;}
      if(near)void import('./product-gallery-motion').then(module=>{
        if(alive&&media.matches)setInteractive(()=>module.default);
      }).catch(()=>{/* The server-rendered product remains fully usable. */});
    };
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){near=true;observer.disconnect();sync();}
    },{rootMargin:'240px'});
    if(scene.current)observer.observe(scene.current);
    media.addEventListener('change',sync);
    return()=>{alive=false;observer.disconnect();media.removeEventListener('change',sync);};
  },[]);
  return <div className="featured-depth" ref={scene}>
    {Interactive?<Interactive>{children}</Interactive>:<div className="featured-tilt">{children}</div>}
  </div>;
}
