'use client';
import {useEffect,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
const storageKey='el-amal:product-analytics:v1';
export function ProductAnalyticsChoice({locale}:{locale:Locale}){
  const ar=locale==='ar';
  const [choice,setChoice]=useState<string|null>('loading'),[cycle,setCycle]=useState(0),[privacySignal,setPrivacySignal]=useState(false);
  useEffect(()=>{
    const signal=navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl===true;
    setPrivacySignal(signal);
    const read=()=>{try{const stored=localStorage.getItem(storageKey);setChoice(signal?'denied':stored==='granted'||stored==='denied'?stored:null);}catch{setChoice('denied');}};
    read();window.addEventListener('storage',read);return ()=>window.removeEventListener('storage',read);
  },[]);
  useEffect(()=>{
    if(choice!=='granted')return;
    let cancelled=false,cleanup:(()=>void)|undefined,timer:number|undefined;
    const start=async()=>{
      try{
        const response=await fetch('/api/product-interest',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'start',consent:true,device:matchMedia('(max-width: 767px)').matches?'mobile':'desktop'})});
        if(!response.ok||cancelled)return;
        const result=await response.json();if(!result.active||!Number.isFinite(result.expiresAt)||cancelled)return;
        const {observeProductInterest}=await import('@/lib/product-interest-browser');
        if(cancelled)return;cleanup=observeProductInterest();
        timer=window.setTimeout(()=>{cleanup?.();setCycle(value=>value+1);},Math.max(1000,result.expiresAt-Date.now()));
      }catch{/* Analytics must never interrupt browsing or a quote. */}
    };
    void start();return ()=>{cancelled=true;cleanup?.();if(timer!==undefined)clearTimeout(timer);};
  },[choice,cycle]);
  const choose=(value:'granted'|'denied')=>{
    try{localStorage.setItem(storageKey,value);}catch{}
    setChoice(value);
    if(value==='denied')void fetch('/api/product-interest',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'stop'})}).catch(()=>{});
  };
  return <div className="analytics-choice">
    <button type="button" className="intro-replay" onClick={()=>setChoice(null)}>{ar?'إعدادات إحصاءات المنتجات':'Product analytics settings'}</button>
    {choice===null&&<aside className="analytics-notice" aria-labelledby="analytics-choice-title">
      <h2 id="analytics-choice-title">{ar?'هل تسمح بإحصاءات المنتجات؟':'Allow product analytics?'}</h2>
      <p>{ar?'تساعدنا مشاهدات المنتجات والنقرات المجهولة الاسم على فهم اهتمام العملاء. نستخدم ملف تعريف ارتباط لمدة ٣٠ دقيقة ونحتفظ بالقياسات لمدة ٩٣ يوماً. لا نرسل بيانات الاتصال أو الملفات أو كلمات البحث. اختيارك لا يؤثر على طلب عرض السعر.':'Product views and clicks help us understand customer interest. We use a 30-minute pseudonymous cookie and keep measurements for 93 days. Contact details, files and search terms are excluded. Your choice does not affect quotation requests.'}</p>
      {privacySignal&&<p>{ar?'إشارة الخصوصية في متصفحك تمنع التتبع.':'Your browser privacy signal keeps measurement off.'}</p>}
      <div className="analytics-actions"><button className="button button-dark" type="button" disabled={privacySignal} onClick={()=>choose('granted')}>{ar?'السماح':'Allow'}</button><button className="button button-ghost" type="button" onClick={()=>choose('denied')}>{ar?'عدم السماح':'Decline'}</button></div>
    </aside>}
  </div>;
}
