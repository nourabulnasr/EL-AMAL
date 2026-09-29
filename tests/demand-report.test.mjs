import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseDemandQuery,canReadDemand,DemandError,aggregateDemand,demandCsv} from '../src/lib/demand-report.ts';
import {demandReportHandler} from '../src/lib/demand-http.ts';

const now=new Date('2026-09-29T22:00:00Z');
const query=(search='')=>parseDemandQuery(new URLSearchParams(search),now);
const actor=role=>({id:7,collection:'staff',role});
const line=(overrides={})=>({enquiryId:1,cohort:'verified',model:'A-10',productId:'cms-1',range:'0–10 bar',quantity:2,...overrides});

test('report defaults use Cairo dates and reject invalid, oversized and ambiguous filters',()=>{
  const value=query();assert.equal(value.start,'2026-09-01');assert.equal(value.end,'2026-09-30');assert.equal(value.cohort,'customers');
  for(const search of ['start=2026-02-30','start=2026-09-30&end=2026-09-29','start=2026-01-01&end=2026-09-29','end=2026-10-01','start=2026-9-1','page=0','page=1.5','page=20001','pageSize=101','cohort=owner','format=xml','page=1&page=2','email=private@example.invalid',`model=${'a'.repeat(121)}`])assert.throws(()=>query(search),DemandError,search);
  assert.equal(query('start=2026-09-29&end=2026-09-29&page=2&pageSize=5&format=csv').page,2);
});
test('only identified owner and sales staff may read demand',()=>{
  for(const user of [null,{role:'owner'},actor('warehouse'),actor('catalogue-editor'),{...actor('owner'),collection:'customers'},{...actor('owner'),id:-1}])assert.equal(canReadDemand(user),false);
  for(const role of ['owner','sales'])assert.equal(canReadDemand(actor(role)),true);
});
test('demand counts distinct enquiries per group and totals, with separate verification and demo cohorts',()=>{
  const result=aggregateDemand([line(),line({quantity:3}),line({range:'10–20 bar',quantity:4}),line({enquiryId:2,cohort:'unverified'}),line({enquiryId:3,cohort:'test'}),line({enquiryId:4,cohort:'demo'})],query('cohort=all'));
  assert.deepEqual(result.totals,{requests:4,units:15,verifiedRequests:1,unverifiedRequests:1,testRequests:1,demoRequests:1});
  assert.equal(result.totalRows,5);assert.equal(result.rows.find(row=>row.cohort==='verified'&&row.range==='0–10 bar').requests,1);
  assert.equal(result.rows.find(row=>row.cohort==='verified'&&row.range==='0–10 bar').units,5);
  const customers=aggregateDemand([line(),line({enquiryId:3,cohort:'test'}),line({enquiryId:4,cohort:'demo'})],query());
  assert.equal(customers.totals.requests,1);assert.equal(customers.totalRows,1);
});
test('direct model and arbitrary range text cannot disclose customer details in output or filters',()=>{
  const input=[line({productId:'customer-specified',model:'private@example.invalid',range:'Call 01234567890',notes:'secret'}),line({enquiryId:2,range:'private@example.invalid'})];
  const result=aggregateDemand(input,query());const json=JSON.stringify(result);
  assert.doesNotMatch(json,/private@|01234567890|notes|secret|enquiryId|productId/);
  assert.ok(result.rows.some(row=>row.model==='Customer-specified model'&&row.range==='Range requires staff review'));
  assert.equal(aggregateDemand(input,query('model=private')).totalRows,0);
  const demo=aggregateDemand([line({cohort:'demo',productId:'customer-specified',model:'private@example.invalid'})],query('cohort=demo'));
  assert.doesNotMatch(JSON.stringify(demo),/private@/);
});
test('measurement ranges stay literal, empty ranges are explicit, and invalid quantities fail closed',()=>{
  const result=aggregateDemand([line({range:'-20 to 80 °C'}),line({enquiryId:2,range:''})],query());
  assert.ok(result.rows.some(row=>row.range==='-20 to 80 °C'));assert.ok(result.rows.some(row=>row.range==='Range not specified'));
  for(const quantity of [0,-1,1.1,NaN,10000])assert.throws(()=>aggregateDemand([line({quantity})],query()),DemandError);
  const oversized=Array.from({length:20001},()=>line());
  assert.throws(()=>aggregateDemand(oversized,query()),error=>error instanceof DemandError&&error.status===413);
});
test('pagination is stable and summaries cover the complete filtered report, including empty later pages',()=>{
  const lines=[line({model:'B'}),line({enquiryId:2,model:'A'}),line({enquiryId:3,model:'C'})];
  const result=aggregateDemand(lines,query('page=2&pageSize=1'));
  assert.equal(result.rows[0].model,'B');assert.equal(result.totals.requests,3);assert.equal(result.totalPages,3);
  assert.equal(aggregateDemand(lines,query('page=4&pageSize=1')).rows.length,0);
  assert.equal(aggregateDemand(lines,query('model=A')).totalRows,1);
  assert.equal(aggregateDemand([],query()).totals.requests,0);
});
test('one-group pages can reach every permitted group, including pages above 1000 and the final source-bound page',()=>{
  const lines=Array.from({length:20000},(_,index)=>line({enquiryId:index+1,model:`M${String(index+1).padStart(5,'0')}`}));
  const beyondOldLimit=aggregateDemand(lines,query('page=1001&pageSize=1'));
  assert.equal(beyondOldLimit.totalPages,20000);assert.equal(beyondOldLimit.rows[0].model,'M01001');
  const final=aggregateDemand(lines,query('page=20000&pageSize=1'));
  assert.equal(final.rows.length,1);assert.equal(final.rows[0].model,'M20000');assert.equal(final.totals.requests,20000);
  assert.throws(()=>query('page=20001&pageSize=1'),DemandError);
});
test('CSV exports all matching groups and neutralizes spreadsheet formulas with escaped quoted cells',()=>{
  const rows=['=HYPERLINK("evil")','+cmd','-cmd','@SUM(1)','\t=tab','\ufeff=bom'].map((model,index)=>line({model,enquiryId:index+1}));
  const report=aggregateDemand(rows,query('format=csv&page=2&pageSize=1'));
  const csv=demandCsv(report);assert.equal(csv.split('\r\n').length,8);
  assert.match(csv,/"'=HYPERLINK\(""evil""\)"/);assert.match(csv,/"'\+cmd"/);assert.match(csv,/"'-cmd"/);assert.match(csv,/"'@SUM/);
  assert.match(csv,/"'=tab"/);assert.match(csv,/"'=bom"/);
  assert.doesNotMatch(csv,/enquiryId|productId|email|reference|notes|token/i);
  const tooMany=Array.from({length:2001},(_,i)=>line({enquiryId:i+1,model:`M${i}`}));
  assert.throws(()=>aggregateDemand(tooMany,query('format=csv')),error=>error instanceof DemandError&&error.status===413);
  assert.throws(()=>demandCsv(aggregateDemand(rows,query('pageSize=1'))),DemandError,'A paginated JSON view cannot silently become an incomplete export');
  assert.match(demandCsv(aggregateDemand([line({range:'-20 to 80 °C'})],query('format=csv'))),/"'-20 to 80 °C"/);
});
test('HTTP denies anonymous and unrelated roles before any report read, and validates bounded query first',async()=>{
  let user=null,reads=0;
  const handler=demandReportHandler({enabled:()=>true,authenticate:async()=>user,read:async(_actor,filters)=>{reads++;return aggregateDemand([],filters);},now:()=>now});
  const request=search=>new Request(`https://example.test/api/staff/demand-report${search||''}`);
  for(user of [null,actor('warehouse'),actor('catalogue-editor')]){const response=await handler(request());assert.equal(response.status,403);assert.match(response.headers.get('cache-control'),/no-store/);assert.match(response.headers.get('x-robots-tag'),/noindex/);}
  user=actor('sales');assert.equal((await handler(request('?page=0'))).status,400);assert.equal(reads,0);
  const json=await handler(request());assert.equal(json.status,200);assert.equal(reads,1);
  const csv=await handler(request('?format=csv'));assert.match(csv.headers.get('content-type'),/text\/csv/);assert.match(csv.headers.get('content-disposition'),/attachment; filename="el-amal-demand-2026-09-01-to-2026-09-30.csv"/);
});
test('HTTP disabled and database failure responses never expose diagnostics',async()=>{
  let enabled=false;
  const handler=demandReportHandler({enabled:()=>enabled,authenticate:async()=>actor('owner'),read:async()=>{throw new Error('database password private@example.invalid');},now:()=>now});
  assert.equal((await handler(new Request('https://example.test/api/staff/demand-report'))).status,503);
  enabled=true;const response=await handler(new Request('https://example.test/api/staff/demand-report'));assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/password|private@/);
});
