import {createCipheriv,createDecipheriv,hkdfSync,randomBytes} from 'node:crypto';
export type VerificationSettings={secret:string;origin:string;from:string};
export type VerificationMessage={from:string;to:string;subject:string;text:string};
const email=(value:string)=>value.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value);
export function validateVerificationSettings(settings:VerificationSettings){
 const url=new URL(settings.origin);
 if(settings.secret.length<32||!email(settings.from)||url.protocol!=='https:'||url.username||url.password||url.origin!==settings.origin)throw new Error('Invalid verification configuration');
}
function key(secret:string){
 if(secret.length<32)throw new Error('Invalid verification configuration');
 return Buffer.from(hkdfSync('sha256',secret,'el-amal','verification-email-v1',32));
}
export function verificationMessage(settings:VerificationSettings,to:string,locale:'en'|'ar',token:string):VerificationMessage{
 validateVerificationSettings(settings);
 if(!email(to)||!/^[a-f0-9]{64}$/.test(token))throw new Error('Invalid verification message');
 const link=`${settings.origin}/${locale}/verify#token=${token}`;
 return {from:settings.from,to,subject:locale==='ar'?'تأكيد طلبك لدى الأمل':'Confirm your EL AMAL enquiry',text:locale==='ar'
 ?`لتأكيد بريدك الإلكتروني وطلبك، افتح الرابط واضغط زر التأكيد. ينتهي الرابط خلال ساعة. لا يمثل هذا حجزاً للمخزون أو عرض سعر. إذا لم تقدم الطلب، تجاهل هذه الرسالة.\n\n${link}`
 :`To confirm your email address and enquiry, open this link and press Confirm. The link expires in one hour. This does not reserve stock or constitute a quotation. If you did not make this request, ignore this email.\n\n${link}`};
}
// Authenticated encryption protects the replayable token and recipient in the outbox.
// AAD prevents a ciphertext being moved to another delivery generation.
export function sealMessage(message:VerificationMessage,secret:string,deliveryKey:string){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(secret),iv);
 cipher.setAAD(Buffer.from(deliveryKey));
 const encrypted=Buffer.concat([cipher.update(JSON.stringify(message),'utf8'),cipher.final()]);
 return ['v1',iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),encrypted.toString('base64url')].join('.');
}
export function openMessage(sealed:string,secret:string,deliveryKey:string):VerificationMessage{
 if(sealed.length>16000)throw new Error('Invalid verification envelope');
 const parts=sealed.split('.');
 if(parts.length!==4||parts[0]!=='v1'||parts.slice(1).some(x=>!x||!/^[A-Za-z0-9_-]+$/.test(x)))throw new Error('Invalid verification envelope');
 const iv=Buffer.from(parts[1],'base64url'),tag=Buffer.from(parts[2],'base64url');
 if(iv.length!==12||tag.length!==16)throw new Error('Invalid verification envelope');
 const decipher=createDecipheriv('aes-256-gcm',key(secret),iv);
 decipher.setAAD(Buffer.from(deliveryKey));decipher.setAuthTag(tag);
 const message=JSON.parse(Buffer.concat([decipher.update(Buffer.from(parts[3],'base64url')),decipher.final()]).toString('utf8'));
 if(!message||typeof message.from!=='string'||!email(message.from)||typeof message.to!=='string'||!email(message.to)||typeof message.subject!=='string'||typeof message.text!=='string')throw new Error('Invalid verification envelope');
 return message;
}
