import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseEnv} from 'node:util';
import {validatePublication,publicationUnchanged,type Publication,type PublicationProduct,type SourceCard} from './catalogue-publication.ts';
import {parseCatalogueDetails} from '../src/lib/catalogue-details.ts';
import {canPublish} from '../src/lib/access.ts';
import type {Product} from '../src/payload-types.ts';

type StockUpdate={id:number;externalId:string;model:string;availability:'in-stock';availabilityReportedAt:string};
export type ImportantPublication=Publication&{reviewDate:string;stockUpdates:StockUpdate[]};
type LiveProduct=Record<string,unknown>&{id:number;externalId:string;model:string;name?:{en?:string;ar?:string};description?:{en?:string;ar?:string};sourceRef?:string;reviewedBy?:unknown;reviewedAt?:string;rightsConfirmed?:boolean};
type CategorizedAddition=Omit<PublicationProduct,'category'>&{category:number};
type Intake={photos:{groups:{models:string[];action:string;currentStock:string;currentStockReportedAt:string}[]}[]};
const reportDate='2026-10-13';
const valves=[{id:135,externalId:'wika-iv1',model:'IV1'},{id:138,externalId:'wika-iv2',model:'IV2'},{id:139,externalId:'wika-iv3-iv5',model:'IV3, IV5'}];
const bottom={id:'bottom-connection',name:{en:'Bottom connection',ar:'توصيل سفلي'}};
const back={id:'back-connection',name:{en:'Back connection',ar:'توصيل خلفي'}};

export function validateImportantPublication(data:ImportantPublication,source:SourceCard[],intake:Intake):true {
  assert.equal(data.reviewDate,reportDate,'Review date mismatch');
  assert.equal(data.products.length,14,'Exactly 14 additions required');
  assert.equal(data.stockUpdates.length,3,'Exactly three existing valve updates required');
  validatePublication(data,source);
  const selected=intake.photos.flatMap(p=>p.groups);
  assert.equal(selected.length,17,'Exactly 17 highlighted groups required');
  const additions=selected.filter(g=>g.action==='new-group');
  assert.equal(additions.length,14);
  assert.equal(new Set(source.map(s=>s.model)).size,14,'Duplicate source model group');
  assert.equal(data.products.filter(p=>p.category==='pressure').length,12);
  assert.equal(data.products.filter(p=>p.category==='temperature').length,2);
  for(const p of data.products){
    const group=additions.find(g=>g.models.join(', ')===p.model);
    assert.ok(group,`Unselected model group: ${p.model}`);
    assert.equal(group.currentStock,'in-stock');
    assert.equal(group.currentStockReportedAt,reportDate);
    assert.equal(p.catalogueDetails.availability,'in-stock');
    assert.equal(p.catalogueDetails.availabilityReportedAt,reportDate);
    const expected=p.model==='111.10, 111.12'?[{...bottom,model:'111.10'},{...back,model:'111.12'}]
      :['232.50, 233.50','232.30, 233.30'].includes(p.model)?[bottom,back]:undefined;
    assert.deepEqual(p.catalogueDetails.options,expected,`Invalid connection options: ${p.model}`);
    assert.ok(!p.model.includes('with 8xx'),'Electrical-contact models are outside this batch');
  }
  for(const expected of valves){
    const update=data.stockUpdates.find(u=>u.externalId===expected.externalId);
    assert.deepEqual(update,{...expected,availability:'in-stock',availabilityReportedAt:reportDate},'Existing valve identity mismatch');
  }
  return true;
}

// Rebuild from the live record, preserving every existing detail except stock/date.
export function valveStockPatch(current:LiveProduct,update:StockUpdate):{catalogueDetails:NonNullable<ReturnType<typeof parseCatalogueDetails>>} {
  assert.ok(current.id===update.id&&current.externalId===update.externalId&&current.model===update.model,'Existing valve identity mismatch');
  assert.ok(current._status==='published'&&canPublish(current),'Existing valve must already be reviewed and published');
  assert.ok(parseCatalogueDetails(current.catalogueDetails),'Existing valve details are invalid');
  return {catalogueDetails:{...(current.catalogueDetails as NonNullable<ReturnType<typeof parseCatalogueDetails>>),availability:update.availability,availabilityReportedAt:update.availabilityReportedAt}};
}

export function planImportantImport(data:ImportantPublication,current:LiveProduct[],categories:{id:number;key:string}[]) {
  const categoryIds=new Map(categories.map(c=>[c.key,c.id]));
  const create:CategorizedAddition[]=[],unchanged:LiveProduct[]=[],stockUpdates:{current:LiveProduct;update:StockUpdate}[]=[];
  const affected=[...data.products,...data.stockUpdates];
  for(const p of affected){
    assert.ok(current.filter(c=>c.externalId===p.externalId).length<=1,`Duplicate external identity: ${p.externalId}`);
    assert.ok(!current.some(c=>c.model===p.model&&c.externalId!==p.externalId),`Model collision: ${p.model}`);
  }
  for(const p of data.products){
    const category=categoryIds.get(p.category);assert.ok(category,`Missing existing category: ${p.category}`);
    const desired={...p,category};
    const existing=current.find(c=>c.externalId===p.externalId);
    if(!existing)create.push(desired);
    else {assert.ok(existing.model===p.model&&publicationUnchanged(existing,desired),`Published addition changed; review before overwriting: ${p.model}`);unchanged.push(existing);}
  }
  for(const update of data.stockUpdates){
    const existing=current.find(c=>c.externalId===update.externalId);
    assert.ok(existing,`Missing existing valve: ${update.model}`);
    const patch=valveStockPatch(existing,update);
    const details=existing.catalogueDetails as {availability:string;availabilityReportedAt:string};
    if(details.availability!==patch.catalogueDetails.availability||details.availabilityReportedAt!==patch.catalogueDetails.availabilityReportedAt)stockUpdates.push({current:existing,update});
  }
  return {create,unchanged,stockUpdates,valveIds:data.stockUpdates.map(u=>u.id)};
}

export function resolveTargetPublication(data:ImportantPublication,current:LiveProduct[],target:'development'|'hosted'):ImportantPublication {
  assert.ok(target==='development'||target==='hosted','Explicit target required');
  const stockUpdates=data.stockUpdates.map(update=>{
    const matches=current.filter(p=>p.externalId===update.externalId);
    assert.ok(matches.length<=1,`Duplicate existing valve: ${update.externalId}`);
    const existing=matches[0];assert.ok(existing,`Missing existing valve: ${update.model}`);
    assert.equal(existing.model,update.model,`Existing valve model identity mismatch: ${update.externalId}`);
    if(target==='hosted')assert.equal(existing.id,update.id,`Existing valve hosted identity mismatch: ${update.externalId}`);
    return {...update,id:target==='development'?existing.id:update.id};
  });
  return {...data,stockUpdates};
}

export function assertImportTarget(target:unknown,expected:Record<string,string|undefined>,environment:Record<string,string|undefined>):true {
  assert.ok(target==='development'||target==='hosted','Explicit --target development|hosted required');
  assert.ok(expected.DATABASE_URL&&environment.DATABASE_URL===expected.DATABASE_URL,'Database does not match selected target environment');
  assert.ok(environment.OWNER_EMAIL&&environment.OWNER_PASSWORD,'Owner authentication credentials are required');
  return true;
}

async function main(){
  const folder=resolve('catalogue/2026-10-13');
  const data=JSON.parse(readFileSync(resolve(folder,'publication.json'),'utf8')) as ImportantPublication;
  const source=JSON.parse(readFileSync(resolve(folder,'official-extraction.json'),'utf8')) as SourceCard[];
  const intake=JSON.parse(readFileSync(resolve(folder,'intake-review.json'),'utf8')) as Intake;
  validateImportantPublication(data,source,intake);
  const provenance=JSON.parse(readFileSync(resolve(folder,'asset-evidence.json'),'utf8')) as {assets:{src:string;sha256:string}[]};
  for(const p of data.products){
    const image=p.catalogueDetails.image,bytes=readFileSync(resolve('public'+image.src));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`Invalid genuine PNG: ${p.model}`);
    assert.equal(bytes.readUInt32BE(16),image.width);assert.equal(bytes.readUInt32BE(20),image.height);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.assets.find(a=>a.src===image.src)?.sha256,`Asset provenance changed: ${p.model}`);
  }
  const sheets=JSON.parse(readFileSync(resolve(folder,'datasheet-links.json'),'utf8')) as {byCode:Record<string,{status:string;url:string;sha256:string}>;cards:{model:string;codes:string[];unresolvedCodes:string[]}[]};
  for(const p of data.products){
    const card=sheets.cards.find(c=>c.model===p.model);assert.ok(card&&!card.unresolvedCodes.length,`Unverified datasheets: ${p.model}`);
    assert.deepEqual(p.catalogueDetails.datasheets.map(d=>d.url),card.codes.map(c=>{const sheet=sheets.byCode[c];assert.equal(sheet.status,'verified');return sheet.url;}));
  }
  const digest=createHash('sha256').update(JSON.stringify(data)).digest('hex');
  console.log(`Validated 14 bilingual additions, 3 identity-preserving stock updates and source assets. Dataset ${digest.slice(0,16)}.`);
  if(!process.argv.includes('--apply')){console.log('Dry run: no database connection or changes.');return;}
  const at=process.argv.indexOf('--target'),target=at>=0?process.argv[at+1]:undefined;
  assert.ok(target==='development'||target==='hosted','Explicit --target development|hosted required');
  const expected=parseEnv(readFileSync(target==='hosted'?'.env.hosted.local':'.env.local','utf8'));
  assertImportTarget(target,expected,process.env);
  const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config.ts');
  const payload=await getPayload({config});
  try{
    const login=await payload.login({collection:'staff',data:{email:process.env.OWNER_EMAIL!,password:process.env.OWNER_PASSWORD!}});
    assert.equal(login.user?.role,'owner','Only the authenticated owner can apply this publication');
    const user={...login.user,collection:'staff' as const};
    const ids=[...data.products,...data.stockUpdates].map(p=>p.externalId);
    const models=[...data.products,...data.stockUpdates].map(p=>p.model);
    const existing=await payload.find({collection:'products',overrideAccess:false,user,depth:0,limit:100,where:{or:[{externalId:{in:ids}},{model:{in:models}}]}});
    assert.ok(!existing.hasNextPage,'Affected model collision query exceeded bounded result');
    const categories=await payload.find({collection:'categories',overrideAccess:false,user,depth:0,limit:100});
    const targetData=resolveTargetPublication(data,existing.docs as unknown as LiveProduct[],target);
    const plan=planImportantImport(targetData,existing.docs as unknown as LiveProduct[],categories.docs);
    const beforeCount=await payload.count({collection:'products',overrideAccess:false,user,where:{_status:{equals:'published'}}});
    const evidence=resolve(`artifacts/2026-10-13/catalogue-import/${target}-${new Date().toISOString().replace(/[:.]/g,'-')}`);mkdirSync(evidence,{recursive:true});
    // Only the affected existing valves' public catalogue details are saved for rollback.
    writeFileSync(resolve(evidence,'before-valve-stock.json'),JSON.stringify(plan.stockUpdates.map(({current})=>({id:current.id,externalId:current.externalId,model:current.model,catalogueDetails:current.catalogueDetails})),null,2));
    const results=plan.unchanged.map(p=>({id:p.id,externalId:p.externalId,model:p.model,action:'unchanged'}));
    for(const p of plan.create){
      const document=await payload.create({collection:'products',overrideAccess:false,user,data:{...p,category:p.category,instrumentType:p.instrumentType as Product['instrumentType'],applications:p.applications as Product['applications'],_status:'published',reviewedBy:login.user.id,reviewedAt:new Date().toISOString(),rightsConfirmed:true}});
      results.push({id:document.id,externalId:document.externalId,model:document.model,action:'created'});
      writeFileSync(resolve(evidence,'progress.json'),JSON.stringify(results,null,2));
    }
    for(const update of targetData.stockUpdates){
      const current=await payload.findByID({collection:'products',id:update.id,overrideAccess:false,user,depth:0});
      const patch=valveStockPatch(current as unknown as LiveProduct,update);
      const details=current.catalogueDetails as {availability:string;availabilityReportedAt:string};
      const changed=details.availability!==update.availability||details.availabilityReportedAt!==update.availabilityReportedAt;
      if(changed)await payload.update({collection:'products',id:update.id,overrideAccess:false,user,data:patch});
      results.push({id:current.id,externalId:current.externalId,model:current.model,action:changed?'stock-updated':'unchanged'});
      writeFileSync(resolve(evidence,'progress.json'),JSON.stringify(results,null,2));
    }
    const fresh=await payload.find({collection:'products',overrideAccess:false,user,draft:false,depth:0,limit:100,where:{externalId:{in:ids}}});
    assert.equal(fresh.docs.length,17,'All 17 affected groups must remain published');
    for(const doc of fresh.docs){assert.equal(doc._status,'published');const details=parseCatalogueDetails(doc.catalogueDetails);assert.ok(details);assert.equal(details.availability,'in-stock');assert.equal(details.availabilityReportedAt,reportDate);}
    const afterCount=await payload.count({collection:'products',overrideAccess:false,user,where:{_status:{equals:'published'}}});
    assert.equal(afterCount.totalDocs,beforeCount.totalDocs+plan.create.length,'Unexpected published catalogue count change');
    const report={target,digest,created:plan.create.length,stockUpdated:results.filter(r=>r.action==='stock-updated').length,unchanged:results.filter(r=>r.action==='unchanged').length,affected:17,beforePublished:beforeCount.totalDocs,afterPublished:afterCount.totalDocs,results};
    writeFileSync(resolve(evidence,'result.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
  }finally{await payload.destroy();}
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  main().then(()=>process.exit(0)).catch(error=>{console.error(error instanceof Error?error.message:'Important catalogue import failed');process.exit(1);});
}
