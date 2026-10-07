import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import type {InterestDevice} from './product-interest.ts';
export type InterestSession={id:string;issued:number;device:InterestDevice};
export const INTEREST_COOKIE='elamal-interest';
export const INTEREST_SESSION_MS=30*60*1000;
const sign=(value:string,secret:string)=>createHmac('sha256',secret).update(`product-interest-v1:${value}`).digest('base64url');
export function createInterestSession(secret:string,device:InterestDevice,now=Date.now()){
  const body=Buffer.from(JSON.stringify({id:randomUUID(),issued:now,device})).toString('base64url');
  return `${body}.${sign(body,secret)}`;
}
export function readInterestSession(token:unknown,secret:string,now=Date.now()):InterestSession|undefined{
  if(typeof token!=='string'||token.length>300||secret.length<32)return;
  const [body,mac,extra]=token.split('.');if(!body||!mac||extra||!/^[A-Za-z0-9_-]+$/.test(body)||!/^[A-Za-z0-9_-]{43}$/.test(mac))return;
  const expected=sign(body,secret);if(mac.length!==expected.length||!timingSafeEqual(Buffer.from(mac),Buffer.from(expected)))return;
  try{const value=JSON.parse(Buffer.from(body,'base64url').toString());
    if(typeof value.id!=='string'||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(value.id)||!Number.isSafeInteger(value.issued)||value.issued>now||now-value.issued>=INTEREST_SESSION_MS||!['mobile','desktop'].includes(value.device))return;
    return {id:value.id,issued:value.issued,device:value.device};
  }catch{return;}
}
export function interestSessionHash(session:InterestSession,secret:string){return createHmac('sha256',secret).update(`product-interest-identity:${session.id}`).digest('hex');}
