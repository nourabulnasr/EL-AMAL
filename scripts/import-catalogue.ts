import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {parseEnv} from 'node:util';
import {createHash} from 'node:crypto';
import {validatePublication,publicationUnchanged,type Publication,type SourceCard} from './catalogue-publication.ts';
import {toPublicCatalogue} from '../src/lib/public-catalogue.ts';
import type {Product} from '../src/payload-types.ts';

// Trusted local CLI, never an HTTP endpoint. Dry-run is the default.
const folder=resolve('catalogue/2026-09-27');
const data=JSON.parse(readFileSync(resolve(folder,'publication.json'),'utf8')) as Publication;
const source=JSON.parse(readFileSync(resolve(folder,'content-source.json'),'utf8')) as SourceCard[];
validatePublication(data,source);
for(const p of data.products){
 const asset=readFileSync(resolve('public'+p.catalogueDetails.image.src));
 assert.equal(asset.subarray(1,4).toString(),'PNG',`Missing PNG: ${p.model}`);
 assert.equal(asset.readUInt32BE(16),p.catalogueDetails.image.width);
 assert.equal(asset.readUInt32BE(20),p.catalogueDetails.image.height);
}
const digest=createHash('sha256').update(JSON.stringify(data)).digest('hex');
console.log(`Validated ${data.products.length} complete bilingual products and genuine image assets. Dataset ${digest.slice(0,16)}.`);
if(!process.argv.includes('--apply')){console.log('Dry run only; no database connection or changes.');process.exit(0);}
const target=process.argv[process.argv.indexOf('--target')+1];
assert.ok(target==='development'||target==='hosted','Explicit --target development|hosted required');
const expected=parseEnv(readFileSync(target==='hosted'?'.env.hosted.local':'.env.local','utf8'));
assert.ok(expected.DATABASE_URL&&expected.DATABASE_URL===process.env.DATABASE_URL,'Database URL does not match selected environment file');
assert.ok(process.env.OWNER_EMAIL&&process.env.OWNER_PASSWORD,'Owner credentials required from ignored owner file');
const {getPayload}=await import('payload');
const {default:config}=await import('../src/payload.config.ts');
const payload=await getPayload({config});
const run=new Date().toISOString().replace(/[:.]/g,'-');
const evidence=resolve(`artifacts/2026-09-27/catalogue-build/import-${target}-${run}`);
mkdirSync(evidence,{recursive:true});
let failed=false;
try{
 const login=await payload.login({collection:'staff',data:{email:process.env.OWNER_EMAIL!,password:process.env.OWNER_PASSWORD!}});
 assert.ok(login.user,'Owner authentication failed');
 assert.equal(login.user.role,'owner','Only the authenticated owner can publish this import');
 const user={...login.user,collection:'staff' as const};
 const existing=await payload.find({collection:'products',overrideAccess:false,user,depth:0,limit:500,
  where:{externalId:{in:data.products.map(p=>p.externalId)}}});
 const oldCategories=await payload.find({collection:'categories',overrideAccess:false,user,depth:0,limit:100});
 writeFileSync(resolve(evidence,'before.json'),JSON.stringify({products:existing.docs,categories:oldCategories.docs},null,2));
 const categoryIds=new Map<string,number>();
 for(const category of data.categories){
  const current=oldCategories.docs.find(c=>c.key===category.key);
  if(current){categoryIds.set(category.key,current.id);continue;}
  const created=await payload.create({collection:'categories',overrideAccess:false,user,data:category});
  categoryIds.set(category.key,created.id);
 }
 let created=0,updated=0,unchanged=0;
 const results=[];
 for(const p of data.products){
  const desired={...p,category:categoryIds.get(p.category)!,instrumentType:p.instrumentType as Product['instrumentType'],applications:p.applications as Product['applications']};
  const current=existing.docs.find(d=>d.externalId===p.externalId);
  let document=current;
  if(current&&publicationUnchanged(current as unknown as Record<string,unknown>,desired)){unchanged++;}
  else{
   const publish={...desired,_status:'published' as const,reviewedBy:login.user.id,reviewedAt:new Date().toISOString(),rightsConfirmed:true};
   // The supplied catalogue publication instruction is recorded in sourceRef;
   // stock is a model-level dated report, never an inventory balance.
   document=current?await payload.update({collection:'products',id:current.id,overrideAccess:false,user,data:publish}):await payload.create({collection:'products',overrideAccess:false,user,data:publish});
   if(current)updated++;else created++;
  }
  assert.ok(document);results.push({externalId:p.externalId,id:document.id,model:document.model});
  if(results.length%25===0)console.log(`Published/verified ${results.length}/${data.products.length}`);
 }
 const fresh=await payload.find({collection:'products',overrideAccess:false,user,draft:false,depth:0,limit:500,where:{externalId:{in:data.products.map(p=>p.externalId)}}});
 const categories=await payload.find({collection:'categories',overrideAccess:false,user,depth:0,limit:100});
 const publicData=toPublicCatalogue(fresh.docs,categories.docs);
 assert.equal(publicData.products.length,data.products.length,'All imported products must project publicly');
 assert.equal(publicData.products.filter(p=>p.details?.availability==='in-stock').length,90);
 assert.equal(publicData.products.filter(p=>p.details?.availability==='out-of-stock').length,61);
 assert.ok(publicData.products.every(p=>p.details?.specifications.length&&p.details?.image));
 assert.ok(!JSON.stringify(publicData).includes('sourceRef'));
 const report={target,digest,created,updated,unchanged,total:results.length,results};
 writeFileSync(resolve(evidence,'result.json'),JSON.stringify(report,null,2));
 writeFileSync(resolve(`artifacts/2026-09-27/catalogue-build/import-${target}-latest.json`),JSON.stringify(report,null,2));
 console.log(JSON.stringify({target,created,updated,unchanged,total:results.length,publicProjection:'verified'}));
}catch(error){failed=true;console.error(error instanceof Error?error.message:'Catalogue import failed');}
finally{await payload.destroy();}
// Payload retains its initial pool client; all writes and checks above are awaited.
process.exit(failed?1:0);
