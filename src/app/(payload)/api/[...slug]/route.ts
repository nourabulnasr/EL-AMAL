import {cmsEnabled} from '@/lib/cms-runtime';
import {staffRecoveryHandler} from '@/lib/staff-recovery';
import {allowRequest,requestLimitKey} from '@/lib/request-limits';
type Context = {params:Promise<{slug:string[]}>};
export const dynamic = 'force-dynamic';
async function dispatch(request:Request,context:Context) {
  if (!cmsEnabled()) return Response.json({error:'Administration unavailable'},{status:503});
  const {slug} = await context.params;
  if (slug[0]==='staff' && slug[1]==='first-register') {
    return Response.json({error:'This operation requires administrator setup.'},{status:403});
  }
  const [routes,{default:config}] = await Promise.all([import('@payloadcms/next/routes'),import('@/payload.config')]);
  if(slug[0]==='staff'&&['forgot-password','reset-password'].includes(slug[1])){
    const {getPayload}=await import('payload');
    const cms=await getPayload({config});
    return staffRecoveryHandler({
      env:()=>process.env,
      allow:(headers,scope,limit)=>allowRequest(cms,requestLimitKey(headers,scope),limit),
      forgot:email=>cms.forgotPassword({collection:'staff',overrideAccess:true,data:{email}}),
      reset:sanitized=>routes.REST_POST(config)(sanitized,context),
    })(request,slug[1] as 'forgot-password'|'reset-password');
  }
  const handlers={GET:routes.REST_GET,POST:routes.REST_POST,PATCH:routes.REST_PATCH,PUT:routes.REST_PUT,DELETE:routes.REST_DELETE,OPTIONS:routes.REST_OPTIONS};
  const handler=handlers[request.method as keyof typeof handlers];
  return handler?handler(config)(request,context):new Response(null,{status:405});
}
export {dispatch as GET,dispatch as POST,dispatch as PATCH,dispatch as PUT,dispatch as DELETE,dispatch as OPTIONS};
