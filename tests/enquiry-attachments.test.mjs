import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createAttachmentGrant,readAttachmentGrant,sealAttachment,openAttachment,sanitizePhoto} from '../src/lib/enquiry-attachments.ts';
const secret='testing-only-'.repeat(4),reference='EA-12345678-1234-4234-9234-123456789abc',now=1800000000000;
test('attachment grant expires and rejects forgery, other purposes and future lifetime',()=>{
  const grant=createAttachmentGrant(reference,secret,now);
  assert.equal(readAttachmentGrant(grant,secret,now+1000),reference);
  for(const invalid of [grant+'x',grant.replace('EA-','EB-'),null,'',grant.split('.').slice(0,2).join('.')]) assert.equal(readAttachmentGrant(invalid,secret,now),null);
  assert.equal(readAttachmentGrant(grant,secret,now+86400001),null);
  assert.equal(readAttachmentGrant(grant,secret,now-100000),null);
  assert.equal(readAttachmentGrant(grant,'other-secret-'.repeat(4),now),null);
});
test('encrypted photo is bound to its enquiry/upload id and detects tampering',()=>{
  const bytes=Buffer.from('private photo bytes'),aad=reference+':upload';
  const sealed=sealAttachment(bytes,secret,aad);
  assert.ok(!sealed.includes('private'));
  assert.deepEqual(openAttachment(sealed,secret,aad),bytes);
  assert.throws(()=>openAttachment(sealed,secret,reference+':other'));
  assert.throws(()=>openAttachment(sealed.slice(0,-3)+'AAA',secret,aad));
});
test('photo validation decodes actual pixels, rewrites content and removes trailing payloads',async()=>{
  const png=await sharp({create:{width:4,height:4,channels:3,background:'#092340'}}).png().toBuffer();
  const rewritten=await sanitizePhoto(Buffer.concat([png,Buffer.from('<script>private payload</script>')]),'image/png');
  assert.equal(rewritten.contentType,'image/png');
  assert.ok(!rewritten.bytes.includes(Buffer.from('<script>')));
  assert.equal((await sharp(rewritten.bytes).metadata()).width,4);
});
test('photo validation rejects spoofed type, active content, malformed and oversize input',async()=>{
  const png=await sharp({create:{width:2,height:2,channels:3,background:'white'}}).png().toBuffer();
  for(const [bytes,type] of [[png,'image/jpeg'],[Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),'image/png'],[png.subarray(0,30),'image/png'],[Buffer.alloc(2*1024*1024+1),'image/png'],[png,'application/pdf']]) await assert.rejects(sanitizePhoto(bytes,type));
  const huge=await sharp({create:{width:3000,height:3000,channels:3,background:'white'}}).png().toBuffer();
  await assert.rejects(sanitizePhoto(huge,'image/png'));
});
