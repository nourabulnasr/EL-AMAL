import {hasRole} from './access.ts';
import {readInput} from './enquiry-http.ts';
import {EnquiryInputError} from './enquiries.ts';
import {tokenDigest} from './enquiry-verification.ts';
type Result={reference:string;mode:'test'|'customer'};
type Deps={enabled:()=>boolean;authenticate:(headers:Headers)=>Promise<unknown>;allow:(headers:Headers,scope:string)=>Promise<boolean>;issue:(reference:string)=>Promise<string|null>;confirm:(token:string)=>Promise<Result|null>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer',...(status===429?{'Retry-After':'60'}:{})}});
export function verificationHandlers(deps:Deps){
 const base=(r:Request)=>!deps.enabled()?json({error:'Unavailable'},503):r.headers.get('origin')!==new URL(r.url).origin?json({error:'Invalid origin'},403):r.headers.get('content-type')?.split(';')[0].trim()!=='application/json'?json({error:'JSON required'},415):null;
 return {
 issue:async(r:Request)=>{
  const denied=base(r);if(denied)return denied;
  try{
   const user=await deps.authenticate(r.headers);
   if(!user||typeof user!=='object'||!('collection' in user)||user.collection!=='staff'||!hasRole(user,['owner','sales']))return json({error:'Staff sign-in required'},403);
   if(!await deps.allow(r.headers,'verification-issue'))return json({error:'Try again later'},429);
   const body=await readInput(r,4096);
   if(typeof body?.reference!=='string'||!/^EA-[a-f0-9-]{36}$/.test(body.reference))return json({error:'Invalid reference'},400);
   const token=await deps.issue(body.reference);
   return token?json({token,mode:'test',emailSent:false}):json({error:'No unverified test enquiry found'},409);
  }catch(e){return json({error:'Unable to create test link'},e instanceof EnquiryInputError?400:503);}
 },
 confirm:async(r:Request)=>{
  const denied=base(r);if(denied)return denied;
  try{
   if(!await deps.allow(r.headers,'verification-confirm'))return json({error:'Try again later'},429);
   const body=await readInput(r,4096);if(!tokenDigest(body?.token))return json({error:'Link unavailable'},400);
   const result=await deps.confirm(body.token);
   return result?json({...result,stockReserved:false}):json({error:'Link unavailable'},400);
  }catch(e){return json({error:'Unable to confirm'},e instanceof EnquiryInputError?400:503);}
 }
 };
}
