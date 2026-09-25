 'use client';
import {useRef,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
export function TestVerificationLink({reference,locale}:{reference:string;locale:Locale}){
 const ar=locale==='ar',lock=useRef(false);const [busy,setBusy]=useState(false),[url,setUrl]=useState(''),[error,setError]=useState(false);
 return <div><p>{ar?'يمكنك اختبار رابط التأكيد دون إرسال بريد إلكتروني.':'You can test confirmation without sending an email.'}</p>{url?<a className="text-link" href={url}>{ar?'فتح رابط التأكيد التجريبي':'Open test confirmation link'}</a>:<button type="button" className="text-link" disabled={busy} onClick={async()=>{
  if(lock.current)return;lock.current=true;setBusy(true);setError(false);
  try{const response=await fetch('/api/enquiry-verification/test-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Unavailable');const result=await response.json();if(typeof result.token!=='string'||!/^[a-f0-9]{64}$/.test(result.token))throw new Error('Invalid token');setUrl(`/${locale}/verify#token=${result.token}`);
  }catch{setError(true);}finally{lock.current=false;setBusy(false);}
 }}>{busy?(ar?'جارٍ الإنشاء…':'Creating…'):(ar?'إنشاء رابط تأكيد تجريبي':'Create test confirmation link')}</button>}{error&&<p role="alert">{ar?'تعذّر إنشاء رابط. قد يكون الطلب مؤكداً بالفعل؛ تحقق من لوحة الإدارة أو حاول لاحقاً.':'Could not create a link. The request may already be confirmed; check the admin inbox or try later.'}</p>}</div>;
}
