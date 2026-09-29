import {createHmac,createCipheriv,createDecipheriv,randomBytes,timingSafeEqual} from 'node:crypto';
import sharp from 'sharp';
const referencePattern=/^EA-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
export const attachmentLimit=2*1024*1024;
const lifetime=86400000;
function key(secret:string,purpose:string){if(secret.length<32)throw new Error('Attachments unavailable');return createHmac('sha256',secret).update(purpose).digest();}
export function createAttachmentGrant(reference:string,secret:string,now=Date.now()){
  if(!referencePattern.test(reference))throw new Error('Invalid reference');
  const data=`${reference}.${now+lifetime}`;
  return `${data}.${createHmac('sha256',key(secret,'attachment-upload-v1')).update(data).digest('hex')}`;
}
export function readAttachmentGrant(value:unknown,secret:string,now=Date.now()){
  if(typeof value!=='string'||value.length>180||secret.length<32)return null;
  const [reference,expiry,signature,...extra]=value.split('.');
  if(extra.length||!referencePattern.test(reference)||!/^\d{13}$/.test(expiry??'')||!/^[a-f0-9]{64}$/.test(signature??''))return null;
  const end=Number(expiry);if(end<=now||end>now+lifetime)return null;
  const expected=createHmac('sha256',key(secret,'attachment-upload-v1')).update(`${reference}.${expiry}`).digest();
  return timingSafeEqual(Buffer.from(signature,'hex'),expected)?reference:null;
}
export function sealAttachment(bytes:Buffer,secret:string,aad:string){
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(secret,'attachment-storage-v1'),iv);
  cipher.setAAD(Buffer.from(aad));
  const ciphertext=Buffer.concat([cipher.update(bytes),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString('base64');
}
export function openAttachment(sealed:string,secret:string,aad:string){
  const data=Buffer.from(sealed,'base64');if(data.length<29||data.length>attachmentLimit+64)throw new Error('Invalid attachment');
  const decipher=createDecipheriv('aes-256-gcm',key(secret,'attachment-storage-v1'),data.subarray(0,12));
  decipher.setAuthTag(data.subarray(12,28));decipher.setAAD(Buffer.from(aad));
  return Buffer.concat([decipher.update(data.subarray(28)),decipher.final()]);
}
export async function sanitizePhoto(bytes:Buffer,contentType:string){
  if(!bytes.length||bytes.length>attachmentLimit||!['image/jpeg','image/png'].includes(contentType))throw new Error('Use a JPEG or PNG photo up to 2 MB');
  const isPng=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),isJpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if((contentType==='image/png'&&!isPng)||(contentType==='image/jpeg'&&!isJpeg))throw new Error('Invalid photo');
  const pipeline=sharp(bytes,{limitInputPixels:8000000,failOn:'warning',animated:false});
  const metadata=await pipeline.metadata();
  if(!metadata.width||!metadata.height||(metadata.pages??1)>1||!['jpeg','png'].includes(metadata.format??''))throw new Error('Use a single still photo');
  // Full decode + a new raster removes metadata, active payloads and appended data.
  // This is image reconstruction, not a claim of antivirus scanning for documents.
  const result=await pipeline.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).toFormat(contentType==='image/png'?'png':'jpeg',contentType==='image/png'?{compressionLevel:9}:{quality:95}).toBuffer();
  if(result.length>attachmentLimit)throw new Error('Photo is too large after processing');
  return {bytes:result,contentType};
}
