import {test} from 'node:test';
import assert from 'node:assert/strict';
import {attachmentChunkDownloadHandler} from '../src/lib/attachment-chunk-download-http.ts';
import {attachmentDownloadHandler} from '../src/lib/attachment-download-http.ts';
const origin='https://example.invalid',bytes=Buffer.alloc(1048576+7,42);
const request=(body,extra={})=>new Request(`${origin}/api/staff/enquiry-attachments/1/chunks`,{method:'POST',headers:{origin,'content-type':'application/json',...extra},body:JSON.stringify(body)});
const record={bytes,contentType:'application/pdf',unscanned:true,byteCount:bytes.length,sha256:'a'.repeat(64),filename:'quote.pdf'};
test('private download manifest contains metadata only; document parts require acknowledgment on every request',async()=>{
 const reads=[];const handler=attachmentChunkDownloadHandler({enabled:()=>true,read:async(...args)=>{reads.push(args);return {...record,bytes:args[3]?null:bytes.subarray(args[4]*1048576,(args[4]+1)*1048576)};}});
 const manifest=await handler(request({action:'manifest'}),'1');assert.equal(manifest.status,200);const data=await manifest.json();assert.equal(data.parts,2);assert.equal(data.bytes,bytes.length);assert.equal(reads[0][3],true);assert.ok(!JSON.stringify(data).includes('sealed'));
 assert.equal((await handler(request({action:'part',index:0}),'1')).status,404);
 const first=await handler(request({action:'part',index:0,acknowledge:true}),'1');assert.equal((await first.arrayBuffer()).byteLength,1048576);assert.equal(first.headers.get('cache-control'),'private, no-store');
 const last=await handler(request({action:'part',index:1,acknowledge:true}),'1');assert.equal((await last.arrayBuffer()).byteLength,7);
 assert.equal((await handler(request({action:'part',index:2,acknowledge:true}),'1')).status,404);
});
test('private chunk requests reject other origins, malformed indexes and revoked staff access',async()=>{
 let calls=0;const handler=attachmentChunkDownloadHandler({enabled:()=>true,read:async()=>{calls++;return null;}});
 assert.equal((await handler(request({action:'manifest'},{origin:'https://attacker.invalid'}),'1')).status,404);assert.equal(calls,0);
 for(const index of [-1,10,0.1,'1'])assert.equal((await handler(request({action:'part',index,acknowledge:true}),'1')).status,404);
 assert.equal(calls,0);assert.equal((await handler(request({action:'manifest'}),'1')).status,404);assert.equal(calls,1);
});
test('legacy download links redirect large files to the private segmented downloader',async()=>{
 const handler=attachmentDownloadHandler({enabled:()=>true,read:async()=>({...record,bytes:null,byteCount:10485760})});
 const response=await handler(new Request(`${origin}/api/staff/enquiry-attachments/1`),'1');
 assert.equal(response.status,303);assert.equal(response.headers.get('location'),'/staff/files/1');assert.equal(await response.text(),'');
});
