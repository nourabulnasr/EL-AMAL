'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {Locale} from '@/lib/catalogue';
import {quotationChunkSize,quotationFileLimit} from '@/lib/quotation-upload-limits';
import './quotation.css';
const types:Record<string,string>={pdf:'application/pdf',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg'};
type SavedFile={id:string;filename:string;contentType:string;bytes:number};
export function QuotationFileUpload({grant,locale}:{grant:string;locale:Locale}){
 const ar=locale==='ar',lock=useRef(false),upload=useRef<{file:File;id:string}|null>(null),input=useRef<HTMLInputElement>(null);
 const [file,setFile]=useState<File|null>(null),[files,setFiles]=useState<SavedFile[]>([]),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[submitted,setSubmitted]=useState(false),[notice,setNotice]=useState('');
 const [progress,setProgress]=useState(0);
 const chunkAction=async(action:string,extra:Record<string,unknown>={})=>{
  const response=await fetch('/api/customer-quotation-files/chunks',{method:'POST',headers:{Authorization:`Bearer ${grant}`,'Content-Type':'application/json'},body:JSON.stringify({action,...extra}),signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Unavailable');return response.json();
 };
 const control=useCallback(async(action:'status'|'finalize')=>{
  const response=await fetch('/api/customer-quotation-files/control',{method:'POST',headers:{Authorization:`Bearer ${grant}`,'Content-Type':'application/json'},body:JSON.stringify({action}),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('Unavailable');return response.json();
 },[grant]);
 const refresh=useCallback(async()=>{const result=await control('status');if(!Array.isArray(result.files)||typeof result.submitted!=='boolean')throw new Error('Unavailable');setFiles(result.files);setSubmitted(result.submitted);setReady(true);},[control]);
 useEffect(()=>{void refresh().catch(()=>setNotice(ar?'تعذر تحميل الملفات. أعد المحاولة قبل الرفع.':'Could not load saved files. Retry before uploading.'));},[refresh,ar]);
 const act=async(run:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);setNotice('');try{await run();}catch{setNotice(ar?'تعذر تأكيد العملية. أبقِ الصفحة مفتوحة وأعد المحاولة بنفس الملف. يُرفض الملف غير المدعوم أو إذا امتلأت السعة.':'Could not confirm this action. Keep this page open and retry the same file. Unsupported files or full storage may be rejected.');}finally{lock.current=false;setBusy(false);}};
 if(submitted)return <section className="review-notice" role="status"><h2>{ar?'تم إرسال ملفات عرض السعر للمراجعة.':'Your quotation files are submitted for review.'}</h2><p>{ar?'تم حفظ الملفات بصورة خاصة وإضافة إشعار للفريق إلى قائمة الإرسال. سيُراجع الفريق المواصفات والتوفر. لم يتم حجز مخزون.':'Your files are stored privately and a team notification is queued. The team will review specifications and availability. No stock is reserved.'}</p></section>;
 return <section className="review-notice quotation-upload" aria-busy={busy}><h2>{ar?'أرفق عرض السعر الموجود لديك':'Attach your existing quotation'}</h2><p>{ar?'PDF أو Excel (.xlsx) أو JPEG/PNG. حتى ٣ ملفات، ١٠ ميبيبايت للملف (١٠٬٤٨٥٬٧٦٠ بايت). بعد الرفع اضغط إرسال الملفات للمراجعة.':'PDF, Excel (.xlsx), or JPEG/PNG. Up to 3 files, 10 MiB each (10,485,760 bytes). After uploading, select Send files for review.'}</p><p className="field-hint">{ar?'الملفات خاصة ومتاحة لفريق المبيعات لمدة ٣٠ يوماً. تُعاد معالجة الصور؛ المستندات لا يتم فحصها بمضاد فيروسات تلقائياً. لا تُرفع ملفات محمية أو ماكرو أو روابط خارجية.':'Files are private and available to sales for 30 days. Photos are reconstructed; documents are not automatically virus scanned. Use files without password protection, macros or external links.'}</p>
 {files.length>0&&<ul>{files.map(saved=><li key={saved.id}><bdi>{saved.filename}</bdi> — {ar?'تم الحفظ':'Saved'}</li>)}</ul>}
 {!ready&&<button type="button" className="button button-dark" disabled={busy} onClick={()=>act(refresh)}>{ar?'إعادة تحميل الملفات':'Retry loading files'}</button>}
 {ready&&files.length<3&&<><label htmlFor="quotation-file">{ar?'اختر ملفاً':'Choose a file'}</label><input ref={input} id="quotation-file" type="file" accept=".pdf,.xlsx,.jpg,.jpeg,.png" disabled={busy||!!upload.current} onChange={event=>{setFile(event.target.files?.[0]??null);upload.current=null;setProgress(0);setNotice('');}}/>
 <button type="button" className="button button-dark" disabled={busy||!file} onClick={()=>act(async()=>{
   if(!file)return;const type=types[file.name.toLowerCase().split('.').pop()??''];
   if(!type||file.size<1||file.size>quotationFileLimit){setNotice(ar?'اختر PDF أو XLSX أو JPEG/PNG بحد أقصى ١٠ ميبيبايت.':'Choose PDF, XLSX or JPEG/PNG up to 10 MiB.');return;}
   if(upload.current?.file!==file)upload.current={file,id:crypto.randomUUID()};
   const uploadId=upload.current.id;
   const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
   const sha256=Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
   const started=await chunkAction('begin',{uploadId,filename:file.name,contentType:type,size:file.size,sha256});
   if(!started.completed){
    if(!Array.isArray(started.received))throw new Error('Unavailable');
    const received=new Set<number>(started.received);
    let done=Array.from(received).reduce((sum,index)=>sum+Math.min(quotationChunkSize,file.size-index*quotationChunkSize),0);setProgress(done);
    for(let index=0;index<Math.ceil(file.size/quotationChunkSize);index++){
     if(received.has(index))continue;
     const body=file.slice(index*quotationChunkSize,Math.min(file.size,(index+1)*quotationChunkSize));
     const response=await fetch('/api/customer-quotation-files/chunks',{method:'PUT',headers:{Authorization:`Bearer ${grant}`,'Content-Type':'application/octet-stream','X-Upload-Id':uploadId,'X-Chunk-Index':String(index)},body,signal:AbortSignal.timeout(30000)});
     if(!response.ok)throw new Error('Unavailable');done+=body.size;setProgress(done);
    }
    await chunkAction('complete',{uploadId});
   }
   await refresh();setFile(null);upload.current=null;setProgress(0);if(input.current)input.current.value='';
 })}>{busy?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'إرفاق الملف':'Attach file')}</button></>}
 {file&&<><progress value={progress} max={file.size||1} aria-label={ar?'تقدم رفع الملف':'File upload progress'}/><p role="status">{progress>=file.size&&busy?(ar?'جارٍ فحص الملف وحفظه…':'Checking and saving the complete file…'):`${Math.round(progress/(file.size||1)*100)}%`}</p><button type="button" className="text-link" disabled={busy} onClick={()=>act(async()=>{const result=upload.current?await chunkAction('cancel',{uploadId:upload.current.id}):null;await refresh();upload.current=null;setFile(null);setProgress(0);if(input.current)input.current.value='';if(result?.completed)setNotice(ar?'كان الملف قد حُفظ بالفعل، ويظهر الآن في قائمة الملفات. لم يتم حذفه.':'The file had already been saved and is now shown in the file list. It has not been deleted.');})}>{ar?'إلغاء اختيار الملف':'Discard selected file'}</button><p className="field-hint">{ar?'عند انقطاع الاتصال، أعد إرفاق نفس الملف هنا خلال ساعة لاستكمال الأجزاء المحفوظة.':'If the connection drops, retry Attach file here within one hour to resume saved parts.'}</p></>}
 {ready&&files.length>0&&<button type="button" className="button button-dark" disabled={busy||!!file} onClick={()=>act(async()=>{const result=await control('finalize');if(result.submitted!==true)throw new Error('Unavailable');setSubmitted(true);})}>{ar?'إرسال الملفات للمراجعة':'Send files for review'}</button>}
 {file&&files.length>0&&<p className="field-hint">{ar?'أرفق الملف المحدد قبل الإرسال، أو ألغِ اختياره.':'Attach the selected file before submitting, or clear your selection.'}</p>}
 {notice&&<p role="alert">{notice}</p>}
 </section>;
}
