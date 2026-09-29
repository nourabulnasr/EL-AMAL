import {recoveryReady,recoveryRequest} from './staff-security.ts';
type Deps={env:()=>Record<string,string|undefined>;allow:(headers:Headers,scope:string,limit:number)=>Promise<boolean>;forgot:(email:string)=>Promise<unknown>;reset:(request:Request)=>Promise<Response>};
const neutral={message:'If the account is eligible, a password reset email will be sent.'};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer',...(status===429?{'Retry-After':'60'}:{})}});
export function staffRecoveryHandler(deps:Deps){
  return async(request:Request,operation:'forgot-password'|'reset-password')=>{
    const env=deps.env();
    if(!recoveryReady(env))return json({error:'Staff recovery unavailable'},503);
    if(request.method!=='POST')return json({error:'POST required'},405);
    if(request.headers.get('origin')!==env.SITE_URL||new URL(request.url).origin!==env.SITE_URL)return json({error:'Invalid origin'},403);
    try{
      if(!await deps.allow(request.headers,`staff-${operation}`,4))return json({error:'Try again later'},429);
      const input=await recoveryRequest(request,operation,env);
      if('email' in input&&typeof input.email==='string'){
        // A second HMAC bucket ignores IP, bounding attacks on one staff address.
        if(await deps.allow(new Headers(),`staff-recovery-email:${input.email}`,1)){
          try{await deps.forgot(input.email);}catch{/* Never reveal account existence or provider response content. */}
        }
        return json(neutral);
      }
      const headers=new Headers(request.headers);headers.delete('content-length');
      const response=await deps.reset(new Request(request.url,{method:'POST',headers,body:JSON.stringify(input)}));
      const responseHeaders=new Headers(response.headers);
      responseHeaders.set('Cache-Control','no-store');responseHeaders.set('Referrer-Policy','no-referrer');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers:responseHeaders});
    }catch{return json({error:'Check your details or try again later'},400);}
  };
}
