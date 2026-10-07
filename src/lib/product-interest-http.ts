import {readInput} from './enquiry-http.ts';
import {EnquiryInputError} from './enquiries.ts';
import {DemandError} from './demand-report.ts';
import {parseInterestEvents,type InterestEvent} from './product-interest.ts';
import {INTEREST_COOKIE,createInterestSession,readInterestSession,type InterestSession} from './product-interest-session.ts';
type Dependencies={settings:()=>{origin:string;secret:string}|undefined;allow:(headers:Headers)=>Promise<boolean>;isStaff:(headers:Headers)=>Promise<boolean>;save:(session:InterestSession,events:InterestEvent[])=>Promise<unknown>;now?:()=>number};
const json=(body:unknown,status=200,cookie?:string)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer',...(cookie?{'Set-Cookie':cookie}:{})}});
export function interestHandler(deps:Dependencies){return async(request:Request)=>{
  const settings=deps.settings();if(!settings)return json({error:'Product analytics is not active.'},503);
  const cookie=(value:string,age:number)=>`${INTEREST_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${settings.origin.startsWith('https:')?'; Secure':''}`;
  if(new URL(request.url).origin!==settings.origin||request.headers.get('origin')!==settings.origin)return json({error:'Invalid origin.'},403);
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return json({error:'JSON required.'},415);
  try{
    const input=await readInput(request,8192);
    if(input?.action==='stop'&&Object.keys(input).length===1)return json({active:false},200,cookie('',0));
    if(request.headers.get('sec-gpc')==='1'||request.headers.get('dnt')==='1'||/bot|crawl|spider|headless|lighthouse|pagespeed/i.test(request.headers.get('user-agent')||''))return json({error:'Measurement excluded.'},403,cookie('',0));
    if(!await deps.allow(request.headers))return json({error:'Try later.'},429);
    if(await deps.isStaff(request.headers))return json({error:'Staff visits are excluded.'},403,cookie('',0));
    const now=deps.now?.()??Date.now();
    const raw=request.headers.get('cookie')?.split(';').map(part=>part.trim()).find(part=>part.startsWith(`${INTEREST_COOKIE}=`))?.slice(INTEREST_COOKIE.length+1);
    const existing=readInterestSession(raw,settings.secret,now);
    if(input?.action==='start'){
      if(Object.keys(input).sort().join()!=='action,consent,device'||input.consent!==true||!['mobile','desktop'].includes(input.device))throw new DemandError('Consent is required.');
      const token=existing?raw!:createInterestSession(settings.secret,input.device,now);
      const session=existing??readInterestSession(token,settings.secret,now)!;
      return json({active:true,expiresAt:session.issued+1800000},200,cookie(token,Math.ceil((session.issued+1800000-now)/1000)));
    }
    if(!existing)return json({error:'Start a consenting measurement session.'},401);
    const events=parseInterestEvents(input);await deps.save(existing,events);
    return json({accepted:true},202);
  }catch(error){
    if(error instanceof DemandError)return json({error:error.message},error.status);
    if(error instanceof EnquiryInputError)return json({error:'Invalid measurements.'},400);
    return json({error:'Product analytics is temporarily unavailable.'},503);
  }
};}
