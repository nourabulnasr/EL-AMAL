import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {isolatedPayload} from './lib/isolated-payload.ts';
import {readDemandReport} from '../src/lib/demand-service.ts';
import {demandReportHandler} from '../src/lib/demand-http.ts';
import {parseDemandQuery,DemandError,type DemandActor} from '../src/lib/demand-report.ts';
import type {Enquiry} from '../src/payload-types.ts';

if(process.env.CMS_DATABASE_CHECK!=='development')throw new Error('Development database only');
console.log('Preparing an empty isolated demand-report schema.');
const isolated=await isolatedPayload('demand_report_test');
const {payload}=isolated;
const now=new Date('2026-09-30T12:00:00Z');
const filters=(search='')=>parseDemandQuery(new URLSearchParams(`start=2026-09-29&end=2026-09-29&${search}`),now);
const forbidden=(error:unknown)=>error instanceof DemandError&&error.status===403;
const users=new Map<string,DemandActor>();
const tokens=new Map<string,string>();
try{
  for(const role of ['owner','sales','warehouse','catalogue-editor'] as const){
    const email=`${role}-${randomUUID()}@example.invalid`,password=randomBytes(32).toString('hex');
    const user=await payload.create({collection:'staff',overrideAccess:true,data:{email,password,role}});
    users.set(role,{id:user.id,role,collection:'staff'} as DemandActor);
    const result=await payload.login({collection:'staff',data:{email,password}});
    assert.ok(result.token);tokens.set(role,result.token);
  }
  async function enquiry(overrides:Partial<Enquiry>={},createdAt='2026-09-28T21:00:00.000Z'){
    const record=await payload.create({collection:'enquiries',overrideAccess:true,data:{
      reference:`DEMAND-TEST-${randomUUID()}`,requestKey:randomUUID(),fingerprint:'disposable-demand-fixture',locale:'en',source:'cms',
      name:'Never exported',email:'private-demand-fixture@example.invalid',company:'Private company',notes:'Private customer notes',internalNotes:'Private staff notes',
      items:[{productId:'cms-101',model:'Snapshot A-10',nameEn:'Original model',nameAr:'طراز',quantity:2,range:'0–10 bar'}],
      verificationStatus:'verified',verifiedAt:'2026-09-29T10:00:00.000Z',status:'new',deliveryStatus:'not-configured',...overrides,
    }});
    // Deterministic dates are confined to this disposable empty schema.
    await payload.db.pool.query('UPDATE enquiries SET created_at=$1 WHERE id=$2',[createdAt,record.id]);
    return record;
  }
  const owner=users.get('owner')!,sales=users.get('sales')!;
  assert.equal((await readDemandReport(payload,owner,filters())).totals.requests,0);
  await enquiry({items:[
    {productId:'cms-101',model:'Snapshot A-10',nameEn:'Original',nameAr:'طراز',quantity:2,range:'0–10 bar'},
    {productId:'cms-101',model:'Snapshot A-10',nameEn:'Original',nameAr:'طراز',quantity:3,range:'0–10 bar'},
    {productId:'cms-101',model:'Snapshot A-10',nameEn:'Original',nameAr:'طراز',quantity:4,range:'10–20 bar'},
  ]});
  await enquiry({verificationStatus:'unverified',verifiedAt:null});
  await enquiry({verificationStatus:'test-verified'});
  await enquiry({source:'demo'});
  await enquiry({verificationStatus:'verified',verifiedAt:null});
  await enquiry({items:[{productId:'customer-specified',model:'private-model@example.invalid',nameEn:'Customer request',nameAr:'طلب',quantity:1,range:'Call 01234567890'}]});
  await enquiry({status:'closed',items:[{productId:'cms-102',model:'=SUM(1,2)',nameEn:'Formula fixture',nameAr:'طراز',quantity:1}]});
  await enquiry({},'2026-09-28T20:59:59.999Z');
  await enquiry({},'2026-09-29T21:00:00.000Z');
  const report=await readDemandReport(payload,owner,filters('cohort=all'));
  assert.deepEqual(report.totals,{requests:7,units:19,verifiedRequests:3,unverifiedRequests:2,testRequests:1,demoRequests:1});
  assert.equal(report.rows.find(row=>row.model==='Snapshot A-10'&&row.range==='0–10 bar'&&row.cohort==='verified')?.units,5);
  assert.equal(report.rows.find(row=>row.model==='Snapshot A-10'&&row.range==='0–10 bar'&&row.cohort==='verified')?.requests,1);
  assert.equal((await readDemandReport(payload,sales,filters())).totals.requests,5);
  const allText=JSON.stringify(report);
  assert.doesNotMatch(allText,/private-|Private company|Private customer|Private staff|01234567890|DEMAND-TEST|enquiryId|productId|fingerprint|requestKey/);
  assert.ok(report.rows.some(row=>row.model==='Customer-specified model'));
  assert.equal((await readDemandReport(payload,owner,filters('model=private-model'))).totalRows,0);
  assert.equal((await readDemandReport(payload,owner,filters('model=%27%20OR%201%3D1--'))).totalRows,0);
  assert.equal((await readDemandReport(payload,owner,filters('range=10%E2%80%9320'))).totals.units,4);
  const paged=await readDemandReport(payload,owner,filters('cohort=all&pageSize=1&page=2'));
  assert.equal(paged.rows.length,1);assert.deepEqual(paged.totals,report.totals);
  for(const actor of [null,users.get('warehouse'),users.get('catalogue-editor'),{...owner,collection:'customers'}])await assert.rejects(readDemandReport(payload,actor,filters()),forbidden);
  // Re-check the stored role: an earlier authentication result is insufficient.
  await payload.update({collection:'staff',id:sales.id,overrideAccess:true,data:{role:'warehouse'}});
  await assert.rejects(readDemandReport(payload,sales,filters()),forbidden);
  await payload.update({collection:'staff',id:sales.id,overrideAccess:true,data:{role:'sales'}});
  const handler=demandReportHandler({enabled:()=>true,authenticate:async headers=>(await payload.auth({headers})).user,read:(actor,query)=>readDemandReport(payload,actor,query),now:()=>now});
  const request=(role:string,extra='')=>new Request(`https://example.invalid/api/staff/demand-report?start=2026-09-29&end=2026-09-29&${extra}`,{headers:tokens.has(role)?{authorization:`JWT ${tokens.get(role)}`}:{}});
  for(const role of ['anonymous','warehouse','catalogue-editor'])assert.equal((await handler(request(role,'format=csv'))).status,403);
  for(const role of ['owner','sales']){
    const response=await handler(request(role,'cohort=all&format=csv&pageSize=1&page=2'));
    assert.equal(response.status,200);assert.match(response.headers.get('cache-control')!,/no-store/);assert.match(response.headers.get('x-robots-tag')!,/noindex/);
    const csv=await response.text();assert.match(csv,/"'=SUM\(1,2\)"/);assert.match(csv,/Snapshot A-10/);assert.doesNotMatch(csv,/private-|01234567890|DEMAND-TEST/);
    assert.equal(csv.split('\r\n').length,report.totalRows+2,'CSV covers all groups regardless of page');
  }
  assert.equal((await handler(request('owner','start=2026-09-28'))).status,400,'Duplicate query keys are rejected');
  // Cairo jumps from UTC+2 to UTC+3 on this date. Local midnight conversion must
  // include both ends of the 23-hour day, without the adjacent calendar dates.
  await enquiry({},'2026-04-23T21:59:59.999Z');await enquiry({},'2026-04-23T22:00:00.000Z');
  await enquiry({},'2026-04-24T20:59:59.999Z');await enquiry({},'2026-04-24T21:00:00.000Z');
  const dst=parseDemandQuery(new URLSearchParams('start=2026-04-24&end=2026-04-24'),now);
  assert.equal((await readDemandReport(payload,owner,dst)).totals.requests,2,'Cairo daylight-saving date boundary');
  console.log('Demand regression succeeded: persisted snapshots, distinct requests, quantities, verification/demo separation, privacy redaction, literal filtering, pagination/full CSV, formula protection, owner/sales JWT authorization, role revocation, and Cairo daylight-saving boundaries.');
}finally{await isolated.close();console.log('Isolated demand-report schema removed.');}
// Payload login leaves background handles alive; terminate only after every
// assertion and awaited schema cleanup completes, as other auth regressions do.
process.exit(0);
