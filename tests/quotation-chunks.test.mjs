import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {createAttachmentGrant} from '../src/lib/enquiry-attachments.ts';
import {quotationChunkHandler} from '../src/lib/quotation-chunk-http.ts';
import {validateUploadMetadata} from '../src/lib/quotation-upload-service.ts';

const origin='https://example.invalid',secret='synthetic-chunk-secret-'.repeat(3),reference=`EA-${randomUUID()}`;
const grant=createAttachmentGrant(reference,secret),headers={origin,authorization:`Bearer ${grant}`,'content-type':'application/json'};
const metadata=()=>({uploadId:randomUUID(),filename:'Quotation.pdf',contentType:'application/pdf',size:10485760,sha256:'a'.repeat(64)});
test('upload metadata bounds file size, identity, filenames, extension and digest before storage',()=>{
 assert.deepEqual(validateUploadMetadata(metadata()).size,10485760);
 for(const changes of [{size:0},{size:10485761},{size:1.5},{sha256:'forged'},{uploadId:'../other'},{filename:'../quote.pdf'},{filename:'quote.exe'},{contentType:'image/svg+xml'},{filename:'a'.repeat(201)+'.pdf'}])assert.throws(()=>validateUploadMetadata({...metadata(),...changes}));
});
test('chunk route binds both reference and grant fingerprint, handles begin and completes only explicit requests',async()=>{
 const calls=[];const deps={settings:()=>({origin,secret}),allow:async()=>true,begin:async input=>{calls.push(input);return {received:[]};},chunk:async()=>{},complete:async input=>{calls.push(input);return {saved:true};},cancel:async()=>({cancelled:true})};
 const handler=quotationChunkHandler(deps),request=body=>new Request(`${origin}/api/customer-quotation-files/chunks`,{method:'POST',headers,body:JSON.stringify(body)});
 assert.equal((await handler(request({action:'begin',...metadata(),reference:'forged'}))).status,200);
 assert.equal(calls[0].reference,reference);assert.equal(calls[0].grantHash,createHash('sha256').update(grant).digest('hex'));
 assert.equal((await handler(request({action:'complete',uploadId:randomUUID()}))).status,200);
 assert.equal((await handler(request({action:'unknown'}))).status,400);
});
test('chunk endpoint checks capability, origin and rate before consuming a body',async()=>{
 let writes=0;const deps={settings:()=>({origin,secret}),allow:async()=>true,begin:async()=>writes++,chunk:async()=>writes++,complete:async()=>writes++,cancel:async()=>writes++};
 for(const change of [{origin:'https://attacker.invalid'},{authorization:''}]){
  const input=new Request(origin,{method:'POST',headers:{...headers,...change},body:'{}'});
  assert.equal((await quotationChunkHandler(deps)(input)).status,403);assert.equal(input.bodyUsed,false);
 }
 const input=new Request(origin,{method:'POST',headers,body:'{}'});
 assert.equal((await quotationChunkHandler({...deps,allow:async()=>false})(input)).status,429);assert.equal(input.bodyUsed,false);assert.equal(writes,0);
});
test('chunk transport enforces 1 MiB by actual streamed size even with forged length',async()=>{
 let cancelled=false,calls=0;
 const deps={settings:()=>({origin,secret}),allow:async()=>true,begin:async()=>{},chunk:async input=>{calls++;assert.equal(input.bytes.length,1048576);return {saved:true};},complete:async()=>{},cancel:async()=>{}};
 const chunkHeaders={...headers,'content-type':'application/octet-stream','x-upload-id':randomUUID(),'x-chunk-index':'0'};
 const handler=quotationChunkHandler(deps);
 assert.equal((await handler(new Request(origin,{method:'PUT',headers:chunkHeaders,body:Buffer.alloc(1048576)}))).status,200);
 const body=new ReadableStream({start(c){c.enqueue(Buffer.alloc(1048577));},cancel(){cancelled=true;}});
 assert.equal((await handler(new Request(origin,{method:'PUT',headers:{...chunkHeaders,'content-length':'1'},body,duplex:'half'}))).status,413);
 assert.equal(cancelled,true);assert.equal(calls,1);
 for(const index of ['-1','10','1.5','01',''])assert.equal((await handler(new Request(origin,{method:'PUT',headers:{...chunkHeaders,'x-chunk-index':index},body:'x'}))).status,400);
});
