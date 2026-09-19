'use client';
import {useEffect,useRef,useState} from 'react';
import {LazyMotion,m,useMotionValue,useSpring,useScroll,useTransform,useReducedMotion} from 'motion/react';
import {Instrument} from './instrument';
import type {Locale} from '@/lib/catalogue';

const features=()=>import('./motion-features').then(mod=>mod.default);
const spring={stiffness:95,damping:22,mass:.7};

export function HeroInstrument({locale}:{locale:Locale}){
 const ref=useRef<HTMLDivElement>(null);
 const reduced=useReducedMotion();
 const [interactive,setInteractive]=useState(false);
 const [paused,setPaused]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:768px)');
  const update=()=>setInteractive(media.matches);update();
  media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
 },[]);
 const active=interactive&&!reduced&&!paused;
 const x=useMotionValue(0),y=useMotionValue(0);
 const rotateX=useSpring(y,spring),rotateY=useSpring(x,spring);
 const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']});
 const progress=useSpring(scrollYProgress,{stiffness:100,damping:30});
 const scale=useTransform(progress,[0,1],[1,.88]);
 const drift=useTransform(progress,[0,1],[0,45]);
 const ar=locale==='ar';
 return <LazyMotion features={features} strict><div ref={ref} className="hero-art instrument-stage"
  onPointerMove={event=>{if(!active)return;const r=event.currentTarget.getBoundingClientRect();x.set(((event.clientX-r.left)/r.width-.5)*18);y.set(-((event.clientY-r.top)/r.height-.5)*14);}}
  onPointerLeave={()=>{x.set(0);y.set(0);}}>
  <div className="stage-light" aria-hidden="true"/><div className="engineering-circle circle-one"/><div className="engineering-circle circle-two"/>
  <span className="stage-coordinate" aria-hidden="true">P / T</span>
  <m.div className="instrument-parallax" style={{scale:active?scale:1,y:active?drift:0}}>
   <m.div className="instrument-tilt" style={{rotateX:active?rotateX:0,rotateY:active?rotateY:0,transformPerspective:1000}}><Instrument/></m.div>
  </m.div>
  <div className="stage-caption"><span className="caption-line"/><p>{ar?'دراسة في الدقة':'A study in precision'}<small>{ar?'رسم توضيحي، وليس صورة منتج':'Illustrative study, not product photography'}</small></p></div>
  {interactive&&!reduced&&<button className="motion-control" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?(ar?'تشغيل الحركة':'Enable motion'):(ar?'إيقاف الحركة':'Pause motion')}<span aria-hidden="true">{paused?'▷':'Ⅱ'}</span></button>}
 </div></LazyMotion>;
}
