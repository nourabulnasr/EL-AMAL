import {test} from 'node:test';
import assert from 'node:assert/strict';
import {attachmentHandler,quotationControlHandler} from '../src/lib/attachment-http.ts';
import {attachmentDownloadHandler} from '../src/lib/attachment-download-http.ts';
import {createAttachmentGrant} from '../src/lib/enquiry-attachments.ts';
const origin='https://example.invalid',secret='synthetic-only-secret-'.repeat(3),reference='EA-12345678-1234-4234-9234-123456789abc';
const grant=createAttachmentGrant(reference,secret);
const headers={origin,authorization:`Bearer ${grant}`,'content-type':'application/json'};
test('quotation control derives reference from grant and never finalizes without a valid capability',async()=>{
 let saved='';const deps={settings:()=>({origin,secret}),allow:async()=>true,status:async()=>({files:[]}),finalize:async value=>{saved=value;return {submitted:true};}};
 const handler=quotationControlHandler(deps);
 const request=(changes={},action='finalize')=>new Request(`${origin}/api/customer-quotation-files/control`,{method:'POST',headers:{...headers,...changes},body:JSON.stringify({action,reference:'attacker-reference'})});
 for(const change of [{authorization:''},{origin:'https://attacker.invalid'}])assert.equal((await handler(request(change))).status,403);
 assert.equal(saved,'');assert.equal((await handler(request())).status,200);assert.equal(saved,reference);
 assert.equal((await handler(request({},'unknown'))).status,400);
 assert.equal((await quotationControlHandler({...deps,settings:()=>undefined})(request())).status,503);
});
test('quotation upload accepts documents only on its separate guarded endpoint',async()=>{
 let saved;const deps={settings:()=>({origin,secret}),allow:async()=>true,save:async input=>{saved=input;return {saved:true};}};
 const request=()=>new Request(`${origin}/api/customer-quotation-files`,{method:'POST',headers:{...headers,'content-type':'application/pdf','x-file-name':'quote.pdf','x-upload-id':'12345678-1234-4234-9234-123456789abc'},body:Buffer.from('%PDF-1.7\n%%EOF')});
 assert.equal((await attachmentHandler(deps)(request())).status,415);
 assert.equal((await attachmentHandler(deps,true)(request())).status,200);
 assert.equal(saved.reference,reference);assert.equal(saved.filename,'quote.pdf');
});
test('document download requires a same-origin explicit acknowledgment and never exposes bytes in GET',async()=>{
 const reads=[];const handler=attachmentDownloadHandler({enabled:()=>true,read:async(_id,_headers,ack)=>{reads.push(ack);return {bytes:ack?Buffer.from('confidential file'):null,contentType:'application/pdf',unscanned:true};}});
 const get=await handler(new Request(`${origin}/api/staff/enquiry-attachments/1`),'1');
 assert.equal(get.status,200);assert.match(await get.text(),/not been virus scanned/);assert.deepEqual(reads,[false]);
 const post=(extra={},body='acknowledge=unscanned')=>new Request(`${origin}/api/staff/enquiry-attachments/1`,{method:'POST',headers:{origin,'content-type':'application/x-www-form-urlencoded',...extra},body});
 assert.equal((await handler(post({origin:'https://attacker.invalid'}),'1')).status,404);
 assert.equal((await handler(post({},'acknowledge=anything'),'1')).status,404);
 const download=await handler(post(),'1');assert.equal(await download.text(),'confidential file');assert.equal(download.headers.get('content-type'),'application/octet-stream');assert.match(download.headers.get('content-disposition'),/^attachment;/);assert.equal(download.headers.get('cache-control'),'private, no-store');
 assert.equal((await attachmentDownloadHandler({enabled:()=>true,read:async()=>null})(new Request(origin),'1')).status,404);
});
