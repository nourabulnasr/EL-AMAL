import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {REST_POST} from '@payloadcms/next/routes';
import {isolatedPayload} from './lib/isolated-payload.ts';
import {staffRecoveryHandler} from '../src/lib/staff-recovery.ts';
import {staffEmailAdapter} from '../src/lib/staff-email.ts';
import {allowRequest,requestLimitKey} from '../src/lib/request-limits.ts';

// All fixtures live in an empty schema on the development DB. The fake transport
// below is installed before creating any account or calling a recovery operation.
if(process.env.CMS_DATABASE_CHECK!=='development'||process.env.VERCEL_ENV==='production')throw new Error('Development database only');
if(process.env.CI==='true'){
  for(const key of ['DATABASE_URL','DATABASE_URL_UNPOOLED']){
    const value=process.env[key];if(!value)continue;
    const url=new URL(value);
    if(!['127.0.0.1','localhost','::1','[::1]'].includes(url.hostname)||url.pathname!=='/elamal_ci')throw new Error('Disposable local CI database required');
  }
}else{
  const development=parseEnv(await readFile(new URL('../.env.local',import.meta.url),'utf8'));
  const hosted=parseEnv(await readFile(new URL('../.env.hosted.local',import.meta.url),'utf8'));
  const host=(url:string)=>new URL(url).hostname.replace('-pooler.','.');
  if(!development.DATABASE_URL||!development.DATABASE_URL_UNPOOLED||!hosted.DATABASE_URL||
    process.env.DATABASE_URL!==development.DATABASE_URL||process.env.DATABASE_URL_UNPOOLED!==development.DATABASE_URL_UNPOOLED||
    host(development.DATABASE_URL)===host(hosted.DATABASE_URL)||host(development.DATABASE_URL)!==host(development.DATABASE_URL_UNPOOLED))throw new Error('Dedicated development connections required');
}

const {payload,close}=await isolatedPayload('staff_recovery_test');
const env={STAFF_RECOVERY_ENABLED:'true',MAIL_PROVIDER:'resend',MAIL_FROM:'staff@example.invalid',RESEND_API_KEY:'synthetic-not-a-provider-key',SITE_URL:'https://example.invalid',PAYLOAD_SECRET:randomBytes(48).toString('hex'),VERCEL:'1'};
const messages:{to:string[];html:string}[]=[];
let providerFails=false,requestNumber=0,stage='setup';
payload.config.serverURL=env.SITE_URL;
payload.config.csrf=[env.SITE_URL];
payload.logger.level='silent';
payload.email=await staffEmailAdapter(env,async(_url,options)=>{
  if(providerFails)return new Response('Synthetic provider failure',{status:503});
  messages.push(JSON.parse(String(options?.body)));
  return Response.json({id:`synthetic-${messages.length}`});
})({payload});
const rest=REST_POST(Promise.resolve(payload.config));
const handler=staffRecoveryHandler({
  env:()=>env,
  allow:(headers,scope,limit)=>allowRequest(payload,requestLimitKey(headers,scope,env),limit),
  forgot:email=>payload.forgotPassword({collection:'staff',overrideAccess:true,data:{email}}),
  reset:request=>rest(request,{params:Promise.resolve({slug:['staff','reset-password']})}),
});
function request(operation:'forgot-password'|'reset-password',data:unknown,origin=env.SITE_URL){
  const form=new FormData();form.append('_payload',JSON.stringify(data));
  return new Request(`${env.SITE_URL}/api/staff/${operation}`,{method:'POST',headers:{origin,'x-forwarded-for':`192.0.2.${++requestNumber}`},body:form});
}
const send=(operation:'forgot-password'|'reset-password',data:unknown)=>handler(request(operation,data),operation);
const neutral={message:'If the account is eligible, a password reset email will be sent.'};
const tokenFromLatest=()=>{
  const token=messages.at(-1)?.html.match(/\/admin\/reset\/([a-f0-9]{40})/)?.[1];assert.ok(token);return token;
};
const auth=(token:string)=>payload.auth({headers:new Headers({authorization:`JWT ${token}`})});
async function expireBuckets(){await payload.db.pool.query("UPDATE request_limits SET window_ends_at=now()-interval '1 second'");}
try{
  const currentSchema=(await payload.db.pool.query('SELECT current_schema() AS name')).rows[0].name;
  assert.match(currentSchema,/^staff_recovery_test_[a-f0-9]{32}$/);
  const password=randomBytes(24).toString('hex'),email=`recovery-${randomUUID()}@example.invalid`;
  const user=await payload.create({collection:'staff',overrideAccess:true,data:{email,password,role:'owner'}});
  const login=await payload.login({collection:'staff',data:{email,password}});assert.ok(login.token);
  stage='multipart recovery request, neutral response and email cooldown';
  const unknown=await send('forgot-password',{email:'unknown@example.invalid'});
  assert.equal(unknown.status,200);assert.deepEqual(await unknown.json(),neutral);assert.equal(messages.length,0);
  const known=await send('forgot-password',{email});
  assert.equal(known.status,200);assert.deepEqual(await known.json(),neutral);assert.equal(messages.length,1);
  assert.deepEqual(messages[0].to,[email]);assert.ok(messages[0].html.includes(`${env.SITE_URL}/admin/reset/`));
  const token=tokenFromLatest();
  const expiry=(await payload.db.pool.query('SELECT reset_password_expiration FROM staff WHERE id=$1',[user.id])).rows[0].reset_password_expiration;
  assert.ok(new Date(expiry).getTime()>Date.now()+29*60000&&new Date(expiry).getTime()<=Date.now()+30*60000);
  const repeated=await send('forgot-password',{email});assert.deepEqual(await repeated.json(),neutral);assert.equal(messages.length,1);
  await expireBuckets();
  await send('forgot-password',{email});assert.equal(messages.length,1,'Payload ten-minute cooldown also prevents another email');
  stage='real REST reset response, old-session revocation and one-time token';
  const weak=await send('reset-password',{token,password:'short'});assert.equal(weak.status,400);assert.match((await weak.json()).message,/15–128/);
  const newPassword=randomBytes(24).toString('hex');
  stage='successful REST reset status';
  const reset=await send('reset-password',{token,password:newPassword,'confirm-password':newPassword,role:'sales'});
  assert.equal(reset.status,200);stage='successful REST reset cookie';assert.ok(reset.headers.get('set-cookie')?.toLowerCase().includes('httponly'));
  stage='successful REST reset headers and role';
  assert.equal(reset.headers.get('cache-control'),'no-store');assert.equal(reset.headers.get('referrer-policy'),'no-referrer');
  const resetBody=await reset.json();assert.ok(resetBody.token);assert.equal(resetBody.user.role,'owner');
  stage='old-session revocation';
  assert.equal((await auth(login.token)).user,null);assert.equal((await auth(resetBody.token)).user?.id,user.id);
  stage='one-time token replay';
  const replay=await send('reset-password',{token,password:randomBytes(24).toString('hex')});assert.ok(replay.status>=400&&replay.status<500);
  await assert.rejects(payload.login({collection:'staff',data:{email,password}}));
  assert.ok((await payload.login({collection:'staff',data:{email,password:newPassword}})).token);
  stage='expired token and concurrent single-use reset';
  await payload.db.pool.query("UPDATE staff SET reset_password_requested_at=NULL WHERE id=$1",[user.id]);await expireBuckets();
  await send('forgot-password',{email});const expiredToken=tokenFromLatest();
  await payload.db.pool.query("UPDATE staff SET reset_password_expiration=now()-interval '1 second' WHERE id=$1",[user.id]);
  const expired=await send('reset-password',{token:expiredToken,password:randomBytes(24).toString('hex')});assert.ok(expired.status>=400&&expired.status<500);
  await payload.db.pool.query("UPDATE staff SET reset_password_requested_at=NULL WHERE id=$1",[user.id]);await expireBuckets();
  await send('forgot-password',{email});const raceToken=tokenFromLatest();
  const race=await Promise.all([0,1].map(()=>send('reset-password',{token:raceToken,password:randomBytes(24).toString('hex')})));
  assert.equal(race.filter(response=>response.status===200).length,1);
  stage='provider failure and safe retry';
  await payload.db.pool.query("UPDATE staff SET reset_password_requested_at=NULL WHERE id=$1",[user.id]);await expireBuckets();
  providerFails=true;const count=messages.length;
  assert.deepEqual(await (await send('forgot-password',{email})).json(),neutral);assert.equal(messages.length,count);
  providerFails=false;await expireBuckets();
  assert.equal((await send('forgot-password',{email})).status,200);assert.equal(messages.length,count+1);
  stage='origin and database rate-limit enforcement';
  assert.equal((await handler(request('forgot-password',{email},'https://untrusted.invalid'),'forgot-password')).status,403);
  const limited=()=>{const value=request('forgot-password',{email:'nobody@example.invalid'});value.headers.set('x-forwarded-for','198.51.100.1');return handler(value,'forgot-password');};
  for(let i=0;i<4;i++)assert.equal((await limited()).status,200);
  const blocked=await limited();assert.equal(blocked.status,429);assert.equal(blocked.headers.get('retry-after'),'60');
  assert.equal(Object.keys(payload.db.sessions??{}).length,0);
  console.log('Staff recovery regression succeeded: real multipart admin request, fake Resend delivery, real REST reset/session cookie, cooldown, expiry, replay/concurrency rejection, old-session revocation, password policy, origin and database rate limits.');
}catch{
  console.error(`Staff recovery regression failed during ${stage}; sensitive diagnostic values withheld.`);process.exitCode=1;
}finally{
  try{await close();console.log('Owned isolated staff recovery schema removed. No external email sent.');}
  catch{console.error('Staff recovery fixture cleanup failed; inspect isolated schema before retrying.');process.exitCode=1;}
}
process.exit(process.exitCode?1:0);
