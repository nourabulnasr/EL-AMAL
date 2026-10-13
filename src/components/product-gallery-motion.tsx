'use client';

import {useEffect,type ReactNode} from 'react';
import {LazyMotion,m,useMotionValue,useSpring} from 'motion/react';

const features=()=>import('./motion-features').then(module=>module.default);
const spring={stiffness:100,damping:24,mass:0.75};

export default function ProductGalleryMotion({children}:{children:ReactNode}) {
  const x=useMotionValue(0),y=useMotionValue(0);
  const rotateX=useSpring(y,spring),rotateY=useSpring(x,spring);
  const reset=()=>{x.set(0);y.set(0);};
  useEffect(()=>{
    const clear=()=>{x.set(0);y.set(0);};
    document.addEventListener('visibilitychange',clear);
    return()=>document.removeEventListener('visibilitychange',clear);
  },[x,y]);
  return <LazyMotion features={features} strict>
    <div className="featured-pointer" onPointerMove={event=>{
      if(event.pointerType!=='mouse')return;
      const rect=event.currentTarget.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      x.set(Math.max(-0.5,Math.min(0.5,(event.clientX-rect.left)/rect.width-0.5))*10);
      y.set(Math.max(-0.5,Math.min(0.5,(event.clientY-rect.top)/rect.height-0.5))*-8);
    }} onPointerLeave={reset} onPointerCancel={reset}>
      <m.div className="featured-tilt" style={{rotateX,rotateY,transformPerspective:1000}}>{children}</m.div>
    </div>
  </LazyMotion>;
}
