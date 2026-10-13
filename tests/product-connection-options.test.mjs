import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCatalogueDetails} from '../src/lib/catalogue-details.ts';
import {readBasket,addLine} from '../src/lib/basket.ts';
import {parseEnquiry,enquiryFingerprint,snapshotItems} from '../src/lib/enquiries.ts';
const options=[{id:'bottom-connection',name:{en:'Bottom connection',ar:'توصيل سفلي'},model:'111.10'},{id:'back-connection',name:{en:'Back connection',ar:'توصيل خلفي'},model:'111.12'}];
const details={manufacturer:'WIKA',image:{src:'/images/products/p.webp',width:600,height:800,alt:{en:'Gauge',ar:'مقياس'},sourceUrl:'https://www.wika.com/p'},specifications:[],availability:'in-stock',availabilityReportedAt:'2026-01-01',datasheets:[],options};
const product={id:'p1',model:'111.10 / 111.12',name:{en:'Gauge',ar:'مقياس'},category:'pressure',description:{en:'Pressure',ar:'ضغط'},details};
const raw=(lines)=>({requestKey:'12345678-1234-4234-8234-123456789abc',locale:'ar',contact:{name:'Engineer',email:'engineer@example.invalid',company:'Test company',notes:''},lines});
test('catalogue options retain bilingual reviewed values and strip unknown fields',()=>{
 const actual=parseCatalogueDetails({...details,options:options.map(o=>({...o,secret:'hidden',name:{...o.name,secret:'hidden'}}))});
 assert.deepEqual(actual.options,options);assert.equal(JSON.stringify(actual).includes('hidden'),false);
});
test('malformed catalogue options never become trusted selections',()=>{
 for(const value of [null,{},[options[0],options[0]],[{...options[0],id:''}],[{...options[0],id:'bad id'}],[{...options[0],name:{en:' ',ar:'سفلي'}}],[{...options[0],name:{en:'Bottom'}}],[{...options[0],model:''}],[{...options[0],model:'111\n.10'}],[{...options[0],model:{en:'111'}}]])assert.equal(parseCatalogueDetails({...details,options:value}),undefined);
 assert.ok(parseCatalogueDetails({...details,options:undefined}));
});
test('both connections are separate basket lines and quantity changes affect only the selected connection',()=>{
 const first=addLine([],'p1',2,'bottom-connection');
 const both=addLine(first,'p1',3,'back-connection');
 assert.deepEqual(addLine(both,'p1',1,'bottom-connection'),[{productId:'p1',quantity:3,optionId:'bottom-connection'},{productId:'p1',quantity:3,optionId:'back-connection'}]);
 assert.deepEqual(readBasket(JSON.stringify(both)),[{productId:'p1',quantity:2,optionId:'bottom-connection'},{productId:'p1',quantity:3,optionId:'back-connection'}]);
 assert.deepEqual(readBasket(JSON.stringify([...both,both[0]])),[]);
});
test('public normalization resolves both bilingual option snapshots from trusted catalogue and ignores forged labels/models',()=>{
 const input=parseEnquiry(raw([{productId:'p1',quantity:2,optionId:'back-connection',optionNameEn:'FORGED',optionModel:'999'},{productId:'p1',quantity:1,optionId:'bottom-connection'}]));
 assert.deepEqual(snapshotItems(input.lines,[product]),[
  {productId:'p1',model:'111.10 / 111.12',nameEn:'Gauge',nameAr:'مقياس',quantity:2,optionId:'back-connection',optionNameEn:'Back connection',optionNameAr:'توصيل خلفي',optionModel:'111.12'},
  {productId:'p1',model:'111.10 / 111.12',nameEn:'Gauge',nameAr:'مقياس',quantity:1,optionId:'bottom-connection',optionNameEn:'Bottom connection',optionNameAr:'توصيل سفلي',optionModel:'111.10'}
 ]);
});
test('missing, stale or forged options reject the entire mixed enquiry while unaffected legacy lines remain valid',()=>{
 const plain={...product,id:'plain',details:undefined};
 assert.equal(snapshotItems([{productId:'plain',quantity:1}],[plain])[0].optionId,undefined);
 for(const line of [{productId:'p1',quantity:1},{productId:'p1',quantity:1,optionId:'forged'},{productId:'plain',quantity:1,optionId:'back-connection'}])assert.throws(()=>snapshotItems([{productId:'plain',quantity:2},line],[plain,product]),/connection|option/i);
 assert.deepEqual(readBasket('[{"productId":"plain","quantity":2}]'),[{productId:'plain',quantity:2}]);
});
test('request identity differs by option and remains stable when line order changes',()=>{
 const bottom={productId:'p1',quantity:1,optionId:'bottom-connection'},back={...bottom,optionId:'back-connection'};
 assert.notEqual(enquiryFingerprint(parseEnquiry(raw([bottom])),'cms'),enquiryFingerprint(parseEnquiry(raw([back])),'cms'));
 assert.equal(enquiryFingerprint(parseEnquiry(raw([bottom,back])),'cms'),enquiryFingerprint(parseEnquiry(raw([back,bottom])),'cms'));
});

test('legacy option-bearing basket lines require explicit reselection and changing to an existing choice merges only that choice',async()=>{
 const {normalizeBasket,basketSelectionRequired,selectBasketOption}=await import('../src/lib/basket.ts');
 const products=[{id:'p1',options},{id:'plain'}];
 const legacy=[{productId:'p1',quantity:2},{productId:'plain',quantity:4}];
 assert.deepEqual(normalizeBasket(legacy,products),legacy);
 assert.equal(basketSelectionRequired(legacy[0],products[0]),true);
 assert.equal(basketSelectionRequired(legacy[1],products[1]),false);
 const lines=[...legacy,{productId:'p1',quantity:3,optionId:'back-connection'}];
 assert.deepEqual(selectBasketOption(lines,legacy[0],'back-connection'),[{productId:'plain',quantity:4},{productId:'p1',quantity:5,optionId:'back-connection'}]);
});
test('trusted option summaries retain both bilingual choices but withhold unknown options and customer fields',async()=>{
 const {notificationOptionSummary}=await import('../src/lib/notification-options.ts');
 const items=snapshotItems(parseEnquiry(raw([{productId:'p1',quantity:1,optionId:'bottom-connection'},{productId:'p1',quantity:2,optionId:'back-connection'}])).lines,[product]);
 const summary=notificationOptionSummary(items.map(item=>({...item,notes:'SECRET',email:'secret@example.invalid'})));
 assert.match(summary,/111\.10/);assert.match(summary,/111\.12/);assert.match(summary,/Bottom connection/);assert.match(summary,/توصيل خلفي/);assert.equal(summary.includes('SECRET'),false);assert.equal(summary.includes('secret@example.invalid'),false);
 assert.equal(notificationOptionSummary([{model:'SECRET',quantity:1,optionId:'forged',optionNameEn:'FORGED',optionNameAr:'مزور'}]),'');
 assert.equal(notificationOptionSummary([{model:'Old',quantity:1}]),'');
});
test('staff enquiry item history exposes optional immutable connection fields',async()=>{
 const {Enquiries}=await import('../src/cms/enquiries.ts');
 const itemField=Enquiries.fields.find(field=>field.name==='items');
 for(const key of ['optionId','optionNameEn','optionNameAr','optionModel'])assert.ok(itemField.fields.some(field=>field.name===key&&!field.required));
 const original={items:[{productId:'p1',model:'111',quantity:1,optionId:'bottom-connection',optionNameEn:'Bottom connection',optionNameAr:'توصيل سفلي'}]};
 assert.throws(()=>Enquiries.hooks.beforeChange[0]({operation:'update',originalDoc:original,data:{items:[{...original.items[0],optionId:'back-connection'}]}}),/immutable/);
});

test('persisted option snapshots survive identical retries after catalogue changes while changed options conflict',async()=>{
 const {submitEnquiry}=await import('../src/lib/submit-enquiry.ts');
 const records=[],queue=[];let transactions=0;
 const payload={db:{beginTransaction:async()=>{transactions++;return 1;},commitTransaction:async()=>{},rollbackTransaction:async()=>{}},find:async({where})=>({docs:records.filter(record=>record.requestKey===where.requestKey.equals)}),create:async({collection,data})=>{
  if(collection==='enquiries'){const record={id:records.length+1,...structuredClone(data)};records.push(record);return record;}
  if(collection==='notifications'){queue.push(structuredClone(data));return {id:queue.length,...data};}
  throw new Error('Unexpected collection');
 }};
 const input=raw([{productId:'p1',quantity:1,optionId:'bottom-connection'},{productId:'p1',quantity:2,optionId:'back-connection'}]);
 const saved=await submitEnquiry(payload,input,{source:'demo',categories:[],products:[product]});
 assert.equal(records[0].items.length,2);assert.equal(records[0].items[0].optionNameAr,'توصيل خلفي');assert.equal(records[0].items[1].optionModel,'111.10');assert.equal(queue.length,1);
 assert.deepEqual(await submitEnquiry(payload,input,{source:'demo',categories:[],products:[]}),{reference:saved.reference,repeated:true});assert.equal(transactions,1);assert.equal(queue.length,1);
 await assert.rejects(submitEnquiry(payload,raw([{productId:'p1',quantity:3,optionId:'bottom-connection'}]),{source:'demo',categories:[],products:[product]}),/different details/);
});
test('public API reports invalid trusted option selection clearly without reflecting client text',async()=>{
 const {customerHandlers}=await import('../src/lib/customer-http.ts');
 const origin='https://example.test';
 const handler=customerHandlers({settings:()=>({origin,secret:'s'.repeat(40)}),allow:async()=>true,submit:async(input)=>{snapshotItems(input.lines,[product]);throw new Error('Must not persist');},resend:async()=>{}});
 const request=new Request(origin+'/api/customer-enquiries',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(raw([{productId:'p1',quantity:1,optionId:'forged'}]))});
 const response=await handler.POST(request);assert.equal(response.status,400);const body=await response.json();assert.equal(body.code,'option-selection');assert.equal(JSON.stringify(body).includes('forged'),false);
});
test('notification worker sends immutable connection snapshots with its existing delivery key and omits contact information',async()=>{
 const {deliverNextNotification}=await import('../src/lib/notification-worker.ts');
 const sent=[];
 const pool={query:async(statement,params)=>{
  if(statement.startsWith('WITH candidates AS'))return {rows:[],rowCount:0};
  if(statement.includes('RETURNING id,reference,recipient'))return {rows:[{id:7,enquiry_id:9,reference:'EA-test',recipient:'owner@example.invalid',delivery_key:'enquiry-EA-test',attempts:1}],rowCount:1};
  if(statement.startsWith('SELECT model,quantity,option_id')){assert.deepEqual(params,[9]);return {rows:[{model:'111.10 / 111.12',quantity:'2',option_id:'back-connection',option_name_en:'Back connection',option_name_ar:'توصيل خلفي',option_model:'111.12'}],rowCount:1};}
  if(statement.startsWith('UPDATE notifications SET status='))return {rows:[],rowCount:1};
  throw new Error('Unexpected SQL');
 }};
 assert.deepEqual(await deliverNextNotification({db:{pool}},{send:async(message)=>{sent.push(message);return {id:'receipt'};}}),{outcome:'sent'});
 assert.equal(sent[0].idempotencyKey,'enquiry-EA-test');assert.equal(sent[0].to,'owner@example.invalid');assert.match(sent[0].text,/111\.12/);assert.match(sent[0].text,/توصيل خلفي/);assert.match(sent[0].text,/Quantity: 2/);assert.match(sent[0].text,/admin inbox/);
});

test('a stale basket selection event cannot restore a removed line or reuse an outdated quantity',async()=>{
 const {selectBasketOption}=await import('../src/lib/basket.ts');
 const stale={productId:'p1',quantity:2};
 assert.deepEqual(selectBasketOption([],stale,'back-connection'),[]);
 assert.deepEqual(selectBasketOption([{productId:'p1',quantity:5}],stale,'back-connection'),[{productId:'p1',quantity:5,optionId:'back-connection'}]);
});
