'use client';
import {useEffect,useRef,useState} from 'react';
type Manifest={filename:string;bytes:number;contentType:string;sha256:string;parts:number;chunkSize:number;unscanned:boolean};
export function PrivateFileDownload({id}:{id:number}){
 const [file,setFile]=useState<Manifest|null>(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[notice,setNotice]=useState(''),[acknowledged,setAcknowledged]=useState(false);
 const lock=useRef(false);
 const request=async(body:unknown)=>{
  const response=await fetch(`/api/staff/enquiry-attachments/${id}/chunks`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('File unavailable');return response;
 };
 useEffect(()=>{let active=true;void fetch(`/api/staff/enquiry-attachments/${id}/chunks`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'manifest'}),signal:AbortSignal.timeout(20000)}).then(async response=>{if(!response.ok)throw new Error();return response.json();}).then(result=>{if(active)setFile(result);}).catch(()=>{if(active)setNotice('File unavailable. Sign in with an owner or sales account, or check whether its 30-day access has expired.');});return()=>{active=false;};},[id]);
 if(!file)return <p role="status">{notice||'Loading private file details…'}</p>;
 return <section><h1>Private enquiry file</h1><p><bdi>{file.filename}</bdi> — {(file.bytes/1048576).toFixed(2)} MiB</p>
 {file.unscanned?<><h2>This document has not been virus scanned</h2><p>A customer supplied this PDF or Excel file. File-type validation does not establish that it is safe. Download it for scanning with your organisation’s security software before opening it. Keep macros, external content and links disabled.</p><label><input type="checkbox" checked={acknowledged} disabled={busy} onChange={event=>setAcknowledged(event.target.checked)}/> I understand and will scan the document before opening it.</label></>:<p>This photograph was reconstructed to remove metadata and appended content.</p>}
 <p>The file is transferred privately in small parts and verified before the browser saves it. No file is sent to an external scanning service.</p>
 <button className="button" type="button" disabled={busy||file.unscanned&&!acknowledged} onClick={async()=>{
  if(lock.current)return;lock.current=true;setBusy(true);setNotice('');setProgress(0);
  try{
   if(!Number.isInteger(file.parts)||file.parts<1||file.parts>10||file.bytes>10485760)throw new Error();
   const chunks:ArrayBuffer[]=[];
   for(let index=0;index<file.parts;index++){
    const chunk=await (await request({action:'part',index,acknowledge:acknowledged})).arrayBuffer();
    if(chunk.byteLength!==Math.min(file.chunkSize,file.bytes-index*file.chunkSize))throw new Error();chunks.push(chunk);setProgress(index+1);
   }
   const blob=new Blob(chunks,{type:file.unscanned?'application/octet-stream':file.contentType});
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),byte=>byte.toString(16).padStart(2,'0')).join('');
   if(digest!==file.sha256||blob.size!==file.bytes)throw new Error();
   const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=file.filename;document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30000);setNotice('Download prepared. Follow your browser’s save prompt.');
  }catch{setNotice('Download could not be verified. No file was saved. Retry, or sign in again if your session expired.');}finally{lock.current=false;setBusy(false);}
 }}>{busy?'Downloading…':'Download file'}</button>
 {busy&&<progress value={progress} max={file.parts} aria-label="Private file download progress"/>}<p role="status">{notice}</p><a href="/admin/collections/enquiry-attachments">Back to enquiry attachments</a></section>;
}
