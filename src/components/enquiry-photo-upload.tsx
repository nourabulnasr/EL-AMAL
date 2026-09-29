'use client';
import {useRef,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
export function EnquiryPhotoUpload({grant,locale}:{grant:string;locale:Locale}){
  const ar=locale==='ar',lock=useRef(false),upload=useRef<{file:File;id:string}|null>(null);
  const [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[count,setCount]=useState(0),[notice,setNotice]=useState('');
  return <section className="review-notice" aria-busy={busy}>
    <h2>{ar?'أضف صوراً فنية':'Add technical photos'}</h2>
    <p>{ar?'اختياري: حتى ٣ صور JPEG أو PNG، بحد أقصى ٢ ميجابايت للصورة. يمكن لفريق المبيعات فقط تنزيلها، وتتاح لمدة ٣٠ يوماً. تُزال بيانات الصورة الإضافية أثناء المعالجة.':'Optional: up to 3 JPEG or PNG photos, 2 MB each. Only the sales team can download them, and they are available for 30 days. Image metadata is removed during processing.'}</p>
    {count<3&&<><label htmlFor="enquiry-photo">{ar?'صورة الطراز أو الرسم الفني':'Model label or technical drawing photo'}</label>
    <input id="enquiry-photo" type="file" accept="image/jpeg,image/png" disabled={busy} onChange={event=>{setFile(event.target.files?.[0]??null);upload.current=null;setNotice('');}}/>
    <button type="button" className="button button-dark" disabled={busy||!file} onClick={async()=>{
      if(lock.current||!file)return;
      if(file.size>2097152||!['image/png','image/jpeg'].includes(file.type)){setNotice(ar?'اختر صورة JPEG أو PNG لا تتجاوز ٢ ميجابايت.':'Choose a JPEG or PNG no larger than 2 MB.');return;}
      lock.current=true;setBusy(true);setNotice('');
      if(upload.current?.file!==file)upload.current={file,id:crypto.randomUUID()};
      try{
        const response=await fetch('/api/enquiry-attachments',{method:'POST',headers:{Authorization:`Bearer ${grant}`,'Content-Type':file.type,'X-Upload-Id':upload.current.id,'X-Photo-Name':encodeURIComponent(file.name)},body:file,signal:AbortSignal.timeout(30000)});
        if(!response.ok)throw new Error('Unavailable');
        setCount(n=>n+1);setFile(null);upload.current=null;
        setNotice(ar?'تم حفظ الصورة بصورة خاصة مع طلبك.':'Photo saved privately with your enquiry.');
      }catch{setNotice(ar?'تعذر حفظ الصورة. أعد المحاولة بنفس الملف؛ لا تُنشئ المحاولة نسخة مكررة.':'We could not save this photo. Retry the same file; retries do not create duplicates.');}
      finally{lock.current=false;setBusy(false);}
    }}>{busy?(ar?'جارٍ الرفع…':'Uploading…'):(ar?'إرفاق الصورة':'Attach photo')}</button></>}
    {notice&&<p role="status">{notice}</p>}
  </section>;
}
