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
 for(const [path,status] of [['/staff/products',200],['/api/staff/product-interest',403]]){
  assert.equal((await fetch(origin+path,{signal:AbortSignal.timeout(20000)})).status,status,'Private product-interest route');
 }
 assert.equal((await fetch(origin+'/api/product-interest',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({action:'start',device:'desktop',consent:true})})).status,503,'Unconfigured analytics stays inactive');
 for(const locale of ['en','ar']){
  const response=await fetch(`${origin}/${locale}`,{signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,200,'Bilingual home runtime');
  const html=await response.text();
  assert.ok(html.includes('id="precision-title"'),'Approved hero heading is server rendered');
  assert.ok(html.includes('precision-revealed.webp'),'Approved sculpture is rendered without client initialization');
  assert.ok(html.includes(`href="/${locale}/products"`),'Hero leads to the real catalogue');
  assert.ok(!html.includes('id="hero-query"'),'Old hero search was replaced');
 }
 console.log('Approved bilingual hero, optimized image and catalogue destination rendered.');
 for(const locale of ['en','ar']){
  const response=await fetch(`${origin}/${locale}/rfq`,{signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,200,'Bilingual RFQ runtime');
  assert.ok((await response.text()).includes('id="existing-quotation"'),'Existing quotation section is server rendered');
 }
 for(const path of ['/api/customer-quotation-files','/api/customer-quotation-files/control']){
  const response=await fetch(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,503,'Unconfigured quotation intake stays unavailable');
 }
 console.log('Bilingual quotation entry and inactive upload/control runtime guards succeeded.');
}catch(error){console.error(log);throw error;}
finally{server.kill('SIGTERM');}
