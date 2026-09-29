import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';

// Run only against the disposable CI database, never the hosted application.
if(process.env.CI!=='true'||!process.env.DATABASE_URL?.startsWith('postgresql://ci:ci@127.0.0.1:5432/elamal_ci'))throw new Error('Disposable CI database required');
const origin='http://127.0.0.1:3107';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3107'],{stdio:['ignore','pipe','pipe'],windowsHide:true});
let log='';
server.stdout.on('data',chunk=>{log=(log+chunk).slice(-10000);});
server.stderr.on('data',chunk=>{log=(log+chunk).slice(-10000);});
try{
 let ready=false;
 for(let attempt=0;attempt<45;attempt++){
  if(server.exitCode!==null)break;
  try{await fetch(`${origin}/robots.txt`,{signal:AbortSignal.timeout(1000)});ready=true;break;}catch{await delay(1000);}
 }
 assert.ok(ready,'Built server started');
 for(const [path,status] of [['/en/products',200],['/ar/products',200],['/staff/inventory',200],['/staff/reports',200],['/admin/login',200],['/api/skus',403],['/api/enquiry-attachments',403],['/api/staff/inventory',403],['/api/staff/demand-report',403]]){
  const response=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,status,`Built CMS runtime: ${path}`);
 }
 console.log('Built CMS-enabled routes and private collection guards succeeded against disposable PostgreSQL.');
}catch(error){console.error(log);throw error;}
finally{server.kill('SIGTERM');}
