'use client';
import {useEffect,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {CustomerEnquirySubmit} from './customer-enquiry-submit';
import './quotation.css';
export function ExistingQuotation({locale}:{locale:Locale}){
 const ar=locale==='ar';
 const [details,setDetails]=useState({name:'',email:'',company:'',notes:''});
 const [review,setReview]=useState(false),[enabled,setEnabled]=useState(false),[checked,setChecked]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch('/api/customer-enquiries',{signal:controller.signal}).then(r=>r.ok?r.json():null).then(result=>{setEnabled(result?.canSubmitQuotation===true);setChecked(true);}).catch(()=>{if(!controller.signal.aborted)setChecked(true);});return()=>controller.abort();},[]);
 return <section id="existing-quotation" className="enquiry-preview quotation-intake">
  <p className="section-kicker">{ar?'لديك عرض سعر بالفعل؟':'Already have a quotation?'}</p>
  <h2>{ar?'أرسل الملف كما هو.':'Send the file you already have.'}</h2>
  <p>{ar?'ارفع عرض سعر أو قائمة متطلبات بصيغة PDF أو Excel (.xlsx) أو صور JPEG وPNG. لا تحتاج إلى كتابة المنتجات والكميات مرة أخرى.':'Share an existing quotation or requirements list as PDF, Excel (.xlsx), or JPEG/PNG photos. No need to retype products and quantities.'}</p>
  <ol className="quotation-steps"><li>{ar?'أدخل بيانات التواصل':'Add contact details'}</li><li>{ar?'أكد بريدك الإلكتروني':'Confirm your email'}</li><li>{ar?'أرفق الملفات وأرسلها للمراجعة':'Attach files and send for review'}</li></ol>
  <p className="field-hint">{ar?'حتى ٣ ملفات، بحد أقصى ٢ ميجابايت للملف. يتاح التنزيل لفريق المبيعات لمدة ٣٠ يوماً. ملفات Excel القديمة (.xls) والملفات المحمية بكلمة مرور والماكرو والروابط الخارجية غير مدعومة.':'Up to 3 files, 2 MB each. Private sales access for 30 days. Legacy Excel (.xls), password protection, macros and external links are unsupported.'}</p>
  {checked&&!enabled&&<p className="review-notice" role="status">{ar?'الإرسال الإلكتروني غير متاح حالياً. يمكنك تجهيز الملفات، وسيُتاح رفعها بعد تفعيل خدمة التأكيد بالبريد. لم يتم استلام أي طلب أو ملف.':'Online submission is not available yet. Prepare your files; upload will become available once email confirmation is activated. No request or file has been received.'}</p>}
  {enabled&&<><form onSubmit={event=>{event.preventDefault();setReview(true);}}><fieldset disabled={review}><legend className="sr-only">{ar?'بيانات التواصل لعرض السعر':'Quotation contact details'}</legend><div className="enquiry-fields">
  {(['name','email','company'] as const).map(key=><div className="field" key={key}><label htmlFor={`quotation-${key}`}>{({name:ar?'الاسم':'Name',email:ar?'البريد الإلكتروني':'Email',company:ar?'الشركة':'Company'})[key]} *</label><input id={`quotation-${key}`} required pattern={key==='email'?undefined:'.*\\S.*'} type={key==='email'?'email':'text'} autoComplete={key==='company'?'organization':key} maxLength={key==='email'?254:key==='company'?160:120} value={details[key]} onChange={event=>setDetails({...details,[key]:event.target.value})}/></div>)}
  <div className="field field-notes"><label htmlFor="quotation-notes">{ar?'ملاحظات (اختياري)':'Notes (optional)'}</label><textarea id="quotation-notes" maxLength={2000} rows={3} value={details.notes} onChange={event=>setDetails({...details,notes:event.target.value})}/></div>
  </div></fieldset>{!review&&<button className="button button-dark">{ar?'مراجعة بيانات التواصل':'Review contact details'}</button>}</form>
  {review&&<button type="button" className="text-link" onClick={()=>setReview(false)}>{ar?'تعديل البيانات':'Edit details'}</button>}
  <CustomerEnquirySubmit locale={locale} details={details} active={review} quotation/></>}
  <noscript>{ar?'يلزم تفعيل جافاسكريبت لتأكيد البريد ورفع الملفات.':'JavaScript is required for email confirmation and file upload.'}</noscript>
 </section>;
}
