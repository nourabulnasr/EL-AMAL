import {readInput} from './enquiry-http.ts';
type Environment=Record<string,string|undefined>;
const commonPasswords=new Set(['passwordpassword','123456789012345','1234567890123456','qwertyuiopasdfgh','letmeinletmeinletmein']);
export function staffPasswordError(value:unknown):string|null {
  if(typeof value!=='string'||[...value].length<15||[...value].length>128||!value.trim()) return 'Use a unique password or passphrase of 15–128 characters.';
  if(commonPasswords.has(value.toLowerCase())||/^(.)\1+$/u.test(value)) return 'Use a unique password or passphrase of 15–128 characters.';
  return null;
}
export function validateStaffOperation(operation:string,args:unknown){
  if(!['create','update','resetPassword'].includes(operation)||!args||typeof args!=='object'||!('data' in args))return;
  const data=args.data;
  if(!data||typeof data!=='object'||!('password' in data))return;
  const error=staffPasswordError(data.password);
  if(error)throw new Error(error);
}
export function recoveryReady(env:Environment=process.env){
  if(env.STAFF_RECOVERY_ENABLED!=='true'||env.MAIL_PROVIDER!=='resend'||!env.RESEND_API_KEY?.trim()||!env.MAIL_FROM||!/^\S+@[^\s@]+\.[^\s@]+$/.test(env.MAIL_FROM))return false;
  try{const url=new URL(env.SITE_URL??'');return url.protocol==='https:'&&url.origin===env.SITE_URL&&!url.username&&!url.password;}catch{return false;}
}
export async function recoveryRequest(request:Request,operation:'forgot-password'|'reset-password',env:Environment=process.env){
  if(!recoveryReady(env))throw new Error('Staff recovery unavailable');
  if(request.method!=='POST'||new URL(request.url).origin!==env.SITE_URL||request.headers.get('origin')!==env.SITE_URL)throw new Error('Invalid origin or method');
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new Error('JSON required');
  const data=await readInput(request,8192);
  if(operation==='forgot-password'){
    if(typeof data?.email!=='string'||data.email.length>254||!/^\s*[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+\s*$/.test(data.email))throw new Error('Invalid email');
    return {email:data.email.trim().toLowerCase()};
  }
  if(typeof data?.token!=='string'||!(/^[a-f0-9]{40}$/.test(data.token)))throw new Error('Invalid token');
  const error=staffPasswordError(data.password);if(error)throw new Error(error);
  return {token:data.token,password:data.password as string};
}
