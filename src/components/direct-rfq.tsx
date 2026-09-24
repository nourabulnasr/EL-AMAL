 'use client';
import {useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {TestEnquirySubmit} from './test-enquiry-submit';
export function DirectRFQ({locale,whatsapp}:{locale:Locale;whatsapp?:string}){
 const ar=locale==='ar';
 const [details,setDetails]=useState({name:'',email:'',company:'',notes:''});
 const [manual,setManual]=useState({model:'',quantity:1,range:''});
 const [review,setReview]=useState(false);
 const summary=`EL AMAL RFQ\nModel: ${manual.model}\nQuantity: ${manual.quantity}\nRange: ${manual.range}\nName: ${details.name}\nCompany: ${details.company}\nEmail: ${details.email}\nNotes: ${details.notes}`;
 return <section className="enquiry-preview direct-rfq"><h2>{ar?'الطراز، الكمية، نطاق القياس.':'Model, quantity, measurement range.'}</h2><p>{ar?'أدخل مرجع الطراز حتى لو لم يكن موجوداً في الكتالوج.':'Enter your model reference, even if it is not in the catalogue.'}</p>
 <form onSubmit={event=>{event.preventDefault();setReview(true);}}>
 <fieldset disabled={review}><legend className="sr-only">{ar?'تفاصيل طلب عرض السعر':'RFQ details'}</legend><div className="enquiry-fields">
 <div className="field"><label htmlFor="rfq-model">{ar?'الطراز':'Model'} *</label><input id="rfq-model" required pattern=".*\S.*" maxLength={120} value={manual.model} onChange={e=>setManual({...manual,model:e.target.value})}/></div>
 <div className="field"><label htmlFor="rfq-quantity">{ar?'الكمية':'Quantity'} *</label><input id="rfq-quantity" type="number" required min={1} max={9999} step={1} value={Number.isNaN(manual.quantity)?'':manual.quantity} onChange={e=>setManual({...manual,quantity:e.target.valueAsNumber})}/></div>
 <div className="field"><label htmlFor="rfq-range">{ar?'نطاق القياس والوحدة':'Measurement range & unit'} *</label><input id="rfq-range" required pattern=".*\S.*" maxLength={160} placeholder={ar?'مثال: ٠–١٠ بار':'e.g. 0–10 bar'} value={manual.range} onChange={e=>setManual({...manual,range:e.target.value})}/></div>
 {(['name','email','company'] as const).map(key=><div className="field" key={key}><label htmlFor={`rfq-${key}`}>{({name:ar?'الاسم':'Name',email:ar?'البريد الإلكتروني':'Email',company:ar?'الشركة':'Company'})[key]} *</label><input id={`rfq-${key}`} required pattern={key==='email'?undefined:'.*\\S.*'} type={key==='email'?'email':'text'} autoComplete={key==='company'?'organization':key} maxLength={key==='email'?254:key==='company'?160:120} value={details[key]} onChange={e=>setDetails({...details,[key]:e.target.value})}/></div>)}
 <div className="field field-notes"><label htmlFor="rfq-notes">{ar?'تفاصيل التطبيق (اختياري)':'Application details (optional)'}</label><textarea id="rfq-notes" maxLength={2000} rows={3} value={details.notes} onChange={e=>setDetails({...details,notes:e.target.value})}/></div>
 </div></fieldset>
 {!review&&<button className="button button-dark">{ar?'مراجعة طلب عرض السعر':'Review RFQ'}</button>}
 </form>
 {review&&<div className="review-notice" role="status"><strong>{ar?'راجع التفاصيل أعلاه — لم يُرسل الطلب بعد.':'Review the details above — your request has not been sent.'}</strong><p>{ar?'المواصفات والتوفر يحتاجان إلى تأكيد فني.':'Specifications and availability require technical confirmation.'}</p>{whatsapp?<a className="button button-dark" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer">{ar?'فتح الطلب في واتساب':'Open request in WhatsApp'}</a>:<p>{ar?'الإرسال للزوار غير مفعّل بعد. يمكن للموظفين المسجلين حفظ طلب تجريبي أدناه.':'Visitor submission is not enabled yet. Signed-in staff can save a test request below.'}</p>}<button type="button" className="text-link" onClick={()=>setReview(false)}>{ar?'تعديل التفاصيل':'Edit details'}</button></div>}
 <TestEnquirySubmit locale={locale} details={details} manual={manual} active={review}/>
 </section>;
}
