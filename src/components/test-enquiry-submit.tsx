'use client';
import {useEffect,useRef,useState} from 'react';
import type {EnquiryDetails} from '@/lib/enquiry-preview';
import type {Locale} from '@/lib/catalogue';
import {useBasket} from './basket-provider';

export function TestEnquirySubmit({details,locale,active,manual}:{details:EnquiryDetails;locale:Locale;active:boolean;manual?:{model:string;quantity:number;range:string}}){
  const {lines,catalogue}=useBasket();const ar=locale==='ar';
  const [allowed,setAllowed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(false);
  const [saved,setSaved]=useState<{signature:string;reference:string}|null>(null);
  const keys=useRef(new Map<string,string>());const lock=useRef(false);
  const requestLines=manual?[]:lines;
  const signature=JSON.stringify({locale,contact:details,lines:requestLines,manual});
  useEffect(()=>{const controller=new AbortController();
    fetch('/api/enquiry-submissions',{cache:'no-store',signal:controller.signal}).then(r=>r.json()).then(value=>setAllowed(value.canSaveTest===true)).catch(()=>{});
    return()=>controller.abort();
  },[]);
  if(!active||!allowed||catalogue.source!=='demo')return null;
  if(saved?.signature===signature)return <div className="review-notice" role="status"><strong>{ar?'تم حفظ الاستفسار التجريبي':'Test enquiry saved'}</strong><p><bdi>{saved.reference}</bdi></p><p>{ar?'لم يُرسل بريد إلكتروني ولم يُحجز مخزون.':'No email was sent and no stock was reserved.'}</p><a className="text-link" href="/admin/collections/enquiries">{ar?'فتح الاستفسارات في لوحة الإدارة':'Open the admin enquiry inbox'}</a></div>;
  return <div className="review-notice">
    <p>{ar?'اختبار للموظفين: سيحفظ هذا الإجراء بياناتك والعناصر التجريبية في لوحة الإدارة. لن يُرسل بريد إلكتروني ولن يُحجز مخزون.':'Staff test: this saves your details and sample items in the admin inbox. It sends no email and reserves no stock.'}</p>
    {error&&<p role="alert">{ar?'تعذّر تأكيد الحفظ. حاول مجدداً بنفس البيانات؛ لن تتكرر العملية.':'We could not confirm the save. Retry with the same details; the request will not be duplicated.'}</p>}
    <button type="button" className="button button-dark" disabled={busy} onClick={async()=>{
      if(lock.current)return;lock.current=true;setBusy(true);setError(false);
      const requestKey=keys.current.get(signature)??crypto.randomUUID();keys.current.set(signature,requestKey);
      try {
        const response=await fetch('/api/enquiry-submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestKey,locale,contact:details,lines:requestLines,manual})});
        const result=await response.json();if(!response.ok||typeof result.reference!=='string')throw new Error('Save failed');
        setSaved({signature,reference:result.reference});
      }catch{setError(true);}finally{lock.current=false;setBusy(false);}
    }}>{busy?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ استفسار تجريبي':'Save test enquiry')}</button>
  </div>;
}
