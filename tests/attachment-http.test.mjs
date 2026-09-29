import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {attachmentHandler} from '../src/lib/attachment-http.ts';
import {attachmentLimit,createAttachmentGrant} from '../src/lib/enquiry-attachments.ts';

const origin='https://example.invalid',secret='synthetic-attachment-secret-'.repeat(3);
const reference=`EA-${randomUUID()}`;
const request=(extra={},body=Buffer.from('photo fixture'))=>new Request(`${origin}/api/customer-photos`,{
  method:'POST',headers:{origin,authorization:`Bearer ${createAttachmentGrant(reference,secret)}`,'content-type':'image/png','x-upload-id':randomUUID(),'x-photo-name':encodeURIComponent('قياس — label.png'),...extra},body,
});
const dependencies=()=>({settings:()=>({origin,secret}),allow:async()=>true,save:async()=>({saved:true,repeated:false})});

test('photo upload checks capability, both origins, grant and MIME before consuming a body or quota',async()=>{
  let quotaCalls=0,saveCalls=0;
  const deps={...dependencies(),allow:async()=>{quotaCalls++;return true;},save:async()=>{saveCalls++;}};
  const disabled=await attachmentHandler({...deps,settings:()=>undefined})(request());
  assert.equal(disabled.status,503);
  for(const headers of [{origin:'https://attacker.invalid'},{origin:''},{authorization:''},{authorization:'Bearer forged'}]){
    const input=request(headers),response=await attachmentHandler(deps)(input);
    assert.equal(response.status,403);assert.equal(input.bodyUsed,false);
  }
  const wrongHost=new Request('https://attacker.invalid/api/customer-photos',request());
  assert.equal((await attachmentHandler(deps)(wrongHost)).status,403);
  for(const contentType of ['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/svg+xml','image/png; charset=utf-8']){
    assert.equal((await attachmentHandler(deps)(request({'content-type':contentType}))).status,415);
  }
  assert.equal(quotaCalls,0);assert.equal(saveCalls,0);
});

test('photo upload rate denial never reads the body and never stores content',async()=>{
  const input=request();let calls=0;
  const response=await attachmentHandler({...dependencies(),allow:async()=>false,save:async()=>{calls++;}})(input);
  assert.equal(response.status,429);assert.equal(input.bodyUsed,false);assert.equal(calls,0);
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(response.headers.get('referrer-policy'),'no-referrer');
});

test('photo upload binds the reference to the signed grant and preserves the exact upload retry identity',async()=>{
  const calls=[],id=randomUUID(),bytes=Buffer.from('binary fixture');
  const handler=attachmentHandler({...dependencies(),save:async value=>{calls.push(value);return {saved:true,repeated:calls.length>1};}});
  for(let i=0;i<2;i++){
    const response=await handler(request({'x-upload-id':id,'x-enquiry-reference':'EA-attacker-controlled'},bytes));
    assert.equal(response.status,200);assert.deepEqual(await response.json(),{saved:true,repeated:i>0});
  }
  assert.equal(calls.length,2);
  for(const saved of calls){
    assert.equal(saved.reference,reference);assert.equal(saved.uploadId,id);
    assert.equal(saved.filename,'قياس — label.png');assert.equal(saved.contentType,'image/png');assert.deepEqual(saved.bytes,bytes);
  }
});

test('photo upload counts streamed bytes independently of a forged content length and cancels overflow',async()=>{
  let cancelled=false,stored=false,index=0;
  const body=new ReadableStream({pull(controller){controller.enqueue(Buffer.alloc(index++===0?attachmentLimit:1));},cancel(){cancelled=true;}});
  const input=new Request(`${origin}/api/customer-photos`,{method:'POST',headers:{origin,authorization:`Bearer ${createAttachmentGrant(reference,secret)}`,'content-type':'image/png','content-length':'1'},body,duplex:'half'});
  const response=await attachmentHandler({...dependencies(),save:async()=>{stored=true;}})(input);
  assert.equal(response.status,413);assert.equal(cancelled,true);assert.equal(stored,false);
});

test('photo upload accepts the exact byte ceiling and rejects missing bodies and invalid filename encoding',async()=>{
  let stored=0;
  const handler=attachmentHandler({...dependencies(),save:async input=>{stored++;assert.equal(input.bytes.length,attachmentLimit);return {saved:true};}});
  assert.equal((await handler(request({},Buffer.alloc(attachmentLimit)))).status,200);
  assert.equal((await handler(request({},null))).status,400);
  assert.equal((await handler(request({'x-photo-name':'%E0%A4%A'}))).status,400);
  assert.equal((await handler(request({'x-photo-name':'x'.repeat(201)}))).status,400);
  assert.equal(stored,1);
});

test('photo upload hides decoder, storage and rate-limit exception details',async()=>{
  for(const override of [{save:async()=>{throw new Error('private storage credential');}},{allow:async()=>{throw new Error('private database connection');}}]){
    const response=await attachmentHandler({...dependencies(),...override})(request());
    assert.equal(response.status,400);assert.ok(!(await response.text()).includes('private'));
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
});
