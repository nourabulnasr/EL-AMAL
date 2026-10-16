import {readInput} from './enquiry-http.ts';
type Environment=Record<string,string|undefined>;
const commonPasswords=new Set(['passwordpassword','123456789012345','1234567890123456','qwertyuiopasdfgh','letmeinletmeinletmein']);
export class StaffPasswordInputError extends Error {}
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
async function recoveryInput(request:Request){
  const contentType=request.headers.get('content-type')??'';
  const type=contentType.split(';')[0].trim().toLowerCase();
  if(type==='application/json')return readInput(request,8192);
  if(type!=='multipart/form-data')throw new Error('Unsupported recovery request');
  // Payload's own admin forms send one _payload JSON field. Bound the entire
  // stream before parsing multipart, even when Content-Length is absent or false.
  const reader=request.body?.getReader();if(!reader)throw new Error('Missing request');
  const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const part=await reader.read();if(part.done)break;
    size+=part.value.byteLength;if(size>8192){await reader.cancel();throw new Error('Request too large');}
    chunks.push(part.value);
  }}finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  const form=await new Response(bytes,{headers:{'content-type':contentType}}).formData();
  const fields=[...form.entries()];
  if(fields.length!==1||fields[0][0]!=='_payload'||typeof fields[0][1]!=='string')throw new Error('Invalid recovery form');
  return JSON.parse(fields[0][1]);
}
export async function recoveryRequest(request:Request,operation:'forgot-password'|'reset-password',env:Environment=process.env){
  if(!recoveryReady(env))throw new Error('Staff recovery unavailable');
  if(request.method!=='POST'||new URL(request.url).origin!==env.SITE_URL||request.headers.get('origin')!==env.SITE_URL)throw new Error('Invalid origin or method');
  const data=await recoveryInput(request);
  if(operation==='forgot-password'){
    if(typeof data?.email!=='string'||data.email.length>254||!/^\s*[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+\s*$/.test(data.email))throw new Error('Invalid email');
    return {email:data.email.trim().toLowerCase()};
  }
  if(typeof data?.token!=='string'||!(/^[a-f0-9]{40}$/.test(data.token)))throw new Error('Invalid token');
  const error=staffPasswordError(data.password);if(error)throw new StaffPasswordInputError(error);
  return {token:data.token,password:data.password as string};
}
