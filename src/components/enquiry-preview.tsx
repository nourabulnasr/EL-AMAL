'use client';
import {useRef,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {validateEnquiry,type EnquiryDetails} from '@/lib/enquiry-preview';

export function EnquiryPreview({locale}:{locale:Locale}){
 const ar=locale==='ar';
 const [details,setDetails]=useState<EnquiryDetails>({name:'',email:'',company:'',notes:''});
 const [errors,setErrors]=useState<ReturnType<typeof validateEnquiry>>({});
 const [review,setReview]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 const form=useRef<HTMLFormElement>(null);
 const labels={name:ar?'الاسم':'Your name',email:ar?'البريد الإلكتروني للعمل':'Work email',company:ar?'الشركة':'Company',notes:ar?'متطلبات التطبيق أو التكوين':'Application or configuration notes'};
 const messages={name:ar?'أدخل اسمك (١٢٠ حرفاً بحد أقصى).':'Enter your name (up to 120 characters).',email:ar?'أدخل بريداً إلكترونياً صالحاً.':'Enter a valid email address.',company:ar?'أدخل اسم شركتك.':'Enter your company name.',notes:ar?'استخدم ٢٠٠٠ حرف بحد أقصى.':'Use no more than 2,000 characters.'};
 return <section className="enquiry-preview" id="enquiry-details" aria-labelledby="enquiry-heading">
  <div className="enquiry-heading"><span className="step-marker" aria-hidden="true">02</span><div><h2 id="enquiry-heading" ref={heading} tabIndex={-1}>{review?(ar?'راجع متطلباتك':'Review your requirement'):(ar?'أضف تفاصيل متطلباتك':'Tell us what you need')}</h2><p>{ar?'معاينة للنموذج فقط. لا يتم إرسال هذه التفاصيل أو حفظها.':'Form preview only. These details are not sent or saved.'}</p></div></div>
  {review?<div className="enquiry-review"><dl>{(['name','email','company','notes'] as const).map(key=><div key={key}><dt>{labels[key]}</dt><dd dir={key==='email'?'ltr':undefined}>{details[key]||(ar?'لم يُحدد':'Not provided')}</dd></div>)}</dl><div className="review-notice" role="status"><strong>{ar?'المعاينة جاهزة — لم يُرسل أي استفسار':'Preview ready — no enquiry has been sent'}</strong><p>{ar?'عند تفعيل الخدمة، ستكون الخطوة التالية تأكيد بريدك الإلكتروني. لم يتم حجز أي مخزون.':'Once the service is enabled, the next step will be email verification. No stock has been reserved.'}</p></div><button className="button button-dark" onClick={()=>{setReview(false);requestAnimationFrame(()=>form.current?.querySelector('input')?.focus());}}>{ar?'تعديل التفاصيل':'Edit details'}</button></div>:<form ref={form} noValidate onSubmit={event=>{
   event.preventDefault();const next=validateEnquiry(details);setErrors(next);
   if(Object.keys(next).length){requestAnimationFrame(()=>form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus());return;}
   setReview(true);requestAnimationFrame(()=>heading.current?.focus());
  }}>
   <div className="enquiry-fields">{(['name','email','company'] as const).map(key=><div className={`field field-${key}`} key={key}><label htmlFor={`enquiry-${key}`}>{labels[key]} <span aria-hidden="true">*</span></label><input id={`enquiry-${key}`} name={key} type={key==='email'?'email':'text'} dir={key==='email'?'ltr':undefined} autoComplete={key==='company'?'organization':key} value={details[key]} required maxLength={key==='email'?254:key==='name'?120:160} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined} onChange={event=>setDetails({...details,[key]:event.target.value})}/>{errors[key]&&<p className="field-error" id={`error-${key}`}>{messages[key]}</p>}</div>)}
   <div className="field field-notes"><label htmlFor="enquiry-notes">{labels.notes} <span className="optional">{ar?'اختياري':'Optional'}</span></label><textarea id="enquiry-notes" name="notes" rows={4} maxLength={2000} value={details.notes} onChange={event=>setDetails({...details,notes:event.target.value})} placeholder={ar?'اذكر الوسط أو نطاق القياس أو نوع التوصيل المطلوب، إن كان معروفاً.':'Medium, measurement range or connection requirements, if known.'}/><p className="field-hint">{ar?'المواصفات النهائية تحتاج إلى مراجعة فنية.':'Final specifications require technical review.'}</p></div></div>
   <div className="attachment-preview"><span aria-hidden="true">＋</span><div><strong>{ar?'المخططات والملفات الفنية':'Drawings & technical documents'}</strong><p>{ar?'سيتاح رفع الملفات عند تفعيل خدمة الاستفسارات الآمنة.':'File uploads will become available with the secure enquiry service.'}</p></div></div>
   <div className="form-actions"><button type="submit" className="button button-dark">{ar?'معاينة المتطلبات':'Preview requirement'}<span aria-hidden="true">↗</span></button><p>{ar?'لن يتم إرسال بريد إلكتروني من هذه المعاينة.':'This preview does not send an email.'}</p></div>
  </form>}
 </section>;
}
