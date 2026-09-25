 'use client';
import {useEffect,useRef,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
export function VerifyEnquiry({locale}:{locale:Locale}){
 const ar=locale==='ar',read=useRef(false),lock=useRef(false);
 const [token,setToken]=useState(''),[state,setState]=useState<'loading'|'ready'|'busy'|'invalid'|'error'|'limited'|'test'|'customer'>('loading');
 useEffect(()=>{if(read.current)return;read.current=true;
  const value=new URLSearchParams(window.location.hash.slice(1)).get('token')??'';
  if(/^[a-f0-9]{64}$/.test(value)){setToken(value);setState('ready');}else setState('invalid');
 },[]);
 const success=state==='test'||state==='customer';
 const messages={loading:ar?'جارٍ قراءة الرابط…':'Reading your link…',ready:ar?'اضغط للتأكيد. لن يتم حجز مخزون أو إنشاء طلب شراء.':'Select confirm to continue. This does not reserve stock or place an order.',busy:ar?'جارٍ التأكيد…':'Confirming…',invalid:ar?'هذا الرابط غير متاح أو انتهت صلاحيته أو استُخدم بالفعل.':'This link is unavailable, expired or already used.',error:ar?'تعذّر تأكيد النتيجة. حاول مجدداً؛ إذا استُخدم الرابط بالفعل فتحقق مع فريق المبيعات.':'We could not confirm the result. Retry; if the link is already used, check with the sales team.',limited:ar?'محاولات كثيرة. انتظر دقيقة ثم حاول مجدداً.':'Too many attempts. Wait a minute, then try again.',test:ar?'اكتمل اختبار التأكيد. لم يُرسل بريد إلكتروني؛ هذا لا يثبت ملكية بريد العميل.':'Test confirmation complete. No email was sent; this does not verify a customer’s email ownership.',customer:ar?'تم تأكيد البريد الإلكتروني لهذا الاستفسار. لم يُحجز أي مخزون.':'Your email is confirmed for this enquiry. No stock has been reserved.'};
 return <section className="enquiry-preview"><p role="status">{messages[state]}</p>{!success&&token&&state!=='invalid'&&<button className="button button-dark" disabled={state==='busy'} onClick={async()=>{
  if(lock.current)return;lock.current=true;setState('busy');
  window.history.replaceState(null,'',window.location.pathname);
  try{const response=await fetch('/api/enquiry-verification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),signal:AbortSignal.timeout(15000)});
   if(response.status===429){setState('limited');return;}
   if(response.status===400){setState('invalid');setToken('');return;}
   if(!response.ok)throw new Error('Unavailable');const result=await response.json();
   if(result.mode!=='test'&&result.mode!=='customer')throw new Error('Invalid response');setState(result.mode);setToken('');
  }catch{setState('error');}finally{lock.current=false;}
 }}>{ar?'تأكيد الاستفسار':'Confirm enquiry'}</button>}</section>;
}
