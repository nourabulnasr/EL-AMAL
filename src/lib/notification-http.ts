import {timingSafeEqual} from 'node:crypto';

type Dependencies={secret:()=>string|undefined;enabled:()=>boolean;run:()=>Promise<{outcome:string}>};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export function notificationHandler(deps:Dependencies){
  return async(request:Request)=>{
    const secret=deps.secret();
    const supplied=request.headers.get('authorization')??'';
    const expected=Buffer.from(`Bearer ${secret??''}`);
    const presented=Buffer.from(supplied);
    if(!secret||secret.length<32||presented.length!==expected.length||!timingSafeEqual(presented,expected))return json({error:'Unauthorized'},401);
    if(!deps.enabled())return json({outcome:'disabled'},503);
    try{return json(await deps.run());}
    catch{return json({error:'Delivery worker unavailable'},503);}
  };
}
