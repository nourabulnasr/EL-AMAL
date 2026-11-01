import {test} from 'node:test';
import assert from 'node:assert/strict';
import {configurationFields,validateConfiguration,configurationSummary,configurationSnapshot} from '../src/lib/product-configuration.ts';
import {addLine,readBasket,basketLineKey} from '../src/lib/basket.ts';
import {snapshotItems} from '../src/lib/enquiries.ts';
import {notificationOptionSummary} from '../src/lib/notification-options.ts';
import fs from 'node:fs';
const p={model:'232.50, 233.50',category:'pressure',details:{specifications:[{label:{en:'Nominal size'},value:{en:'63, 100, 160 mm'}}]}};
test('size controls allowed pressure scales and connection sizes',()=>{
 assert.ok(configurationFields(p,{model:'232.50',size:'63'}).find(f=>f.id==='scale').choices.some(c=>c.id==='bar:0:10'));
 assert.ok(!configurationFields(p,{model:'232.50',size:'63'}).find(f=>f.id==='scale').choices.some(c=>c.id==='bar:0:1600'));
 assert.equal(validateConfiguration(p,{model:'232.50',size:'63',scale:'bar:0:1600',thread:'g-half'}),false);
});
test('temperature scales include verified 0 to 120 and require explicit selection',()=>{
 const t={...p,model:'55',category:'temperature'};
 assert.ok(configurationFields(t,{}).find(f=>f.id==='scale').choices.some(c=>c.id==='c:0:120'));
 assert.equal(validateConfiguration(t,{}),false);
 assert.match(configurationSummary(t,{size:'100',scale:'c:0:120'},'en'),/0–120 °C/);
});
test('unknown models never acquire invented ranges',()=>{
 const u={...p,model:'UNKNOWN'};
 assert.deepEqual(configurationFields(u,{}).map(f=>f.id),['size']);
 assert.equal(validateConfiguration(u,{size:'100',scale:'bar:0:10'}),false);
});
test('same product with different configurations remains separately editable after reload',()=>{
 const a={model:'232.50',size:'63',scale:'bar:0:10',thread:'g-quarter'},b={...a,scale:'bar:0:16'};
 const basket=addLine(addLine([],'p',2,undefined,a),'p',3,undefined,b);
 assert.equal(readBasket(JSON.stringify(basket)).length,2);
 assert.notEqual(basketLineKey(basket[0]),basketLineKey(basket[1]));
});
test('server snapshots preserve bounded bilingual configuration and reject fabricated combinations',()=>{
 const product={...p,id:'p',name:{en:'Gauge',ar:'عداد'}};
 const config={model:'232.50',size:'100',scale:'bar:0:10',thread:'g-half'};
 const [saved]=snapshotItems([{productId:'p',quantity:2,configuration:config}],[product]);
 assert.match(saved.range,/100 mm/);assert.match(saved.range,/0–10 bar/);assert.match(saved.range,/G ½ B/);
 assert.ok(saved.range.length<=160);assert.match(saved.range,/مقاس/);
 assert.throws(()=>snapshotItems([{productId:'p',quantity:2,configuration:{...config,thread:'fake'}}],[product]));
});
test('fixed-size instruments resolve the only size, and panel dimensions stay intact',()=>{
 const fixed={model:'DPG40',category:'pressure',details:{specifications:[{label:{en:'Nominal size'},value:{en:'100 mm'}}]}};
 assert.equal(validateConfiguration(fixed,{thread:'pair-g-quarter-female'}),true);
 assert.match(configurationSnapshot(fixed,{thread:'pair-g-quarter-female'}),/100 mm/);
 const panel={...fixed,details:{specifications:[{label:{en:'Nominal size'},value:{en:'60, 80, 100 mm 72 x 72, 96 x 96 mm'}}]}};
 assert.deepEqual(configurationFields(panel)[0].choices.map(c=>c.id),['60','80','100','72x72','96x96']);
});
test('notification includes saved range and size even without a mounting choice',()=>{
 const summary=notificationOptionSummary([{model:'55',quantity:2,range:'Size/مقاس: 100 mm | Scale/تدريج: 0–120 °C'}]);
 assert.match(summary,/100 mm/);assert.match(summary,/0–120 °C/);assert.match(summary,/Quantity: 2/);
});
test('configuration keys in different property orders have the same retry fingerprint',async()=>{
 const {parseEnquiry,enquiryFingerprint}=await import('../src/lib/enquiries.ts');
 const base={requestKey:'12345678-1234-4234-8234-123456789abc',locale:'en',contact:{name:'Test',email:'test@example.invalid',company:'Test',notes:''}};
 const one={productId:'p',quantity:1,configuration:{size:'100',scale:'c:0:120'}};
 const two={...one,configuration:{scale:'c:0:120',size:'100'}};
 assert.equal(enquiryFingerprint(parseEnquiry({...base,lines:[one]}),'cms'),enquiryFingerprint(parseEnquiry({...base,lines:[two]}),'cms'));
});
test('mounting cannot contradict an explicitly selected model',()=>{
 const product={...p,id:'p',name:{en:'Gauge',ar:'عداد'},details:{...p.details,options:[{id:'back-connection',model:'233.50',name:{en:'Back',ar:'خلفي'}}]}};
 assert.throws(()=>snapshotItems([{productId:'p',quantity:1,optionId:'back-connection',configuration:{model:'232.50',size:'100',scale:'bar:0:10',thread:'g-half'}}],[product]));
});
test('sensor operating limits and autorange capabilities do not become orderable scale alternatives',()=>{
 const sensor={model:'TR75',category:'temperature',details:{specifications:[{label:{en:'Measuring range'},value:{en:'-40.0 … +199.9 °C, +200 … +450 °C with automatic measuring range changeover (autorange)'}}]}};
 assert.equal(configurationFields(sensor).some(f=>f.id==='scale'),false);
});
test('every existing dial family has size and verified process connection fields; sensors keep their capability limits',()=>{
 const products=['2026-09-27','2026-10-13'].flatMap(date=>JSON.parse(fs.readFileSync(`catalogue/${date}/publication.json`,'utf8')).products);
 let dials=0;
 for(const product of products){
  const details=product.catalogueDetails??product.details;
  if(!details?.specifications.some(r=>r.label.en==='Nominal size'))continue;
  dials++;
  for(const model of product.model.split(/,\s*/)){
   const p={model,category:product.category,details},base=configurationFields(p);
   const sizes=base.find(f=>f.id==='size');assert.ok(sizes,model+' size');
   for(const size of sizes.choices){
    const fields=configurationFields(p,{size:size.id}),thread=fields.find(f=>f.id==='thread');assert.ok(thread,model+' process connection');
    const selected=Object.fromEntries(fields.map(f=>[f.id,f.id==='size'?size.id:f.choices[0].id]));
    assert.equal(validateConfiguration(p,selected),true,model);
    assert.ok(configurationSnapshot(p,selected).length<=160,model);
   }
  }
 }
 assert.equal(dials,42);
 const small={model:'213.53',category:'pressure',details:{specifications:[{label:{en:'Nominal size'},value:{en:'50, 63, 100 mm'}}]}};
 assert.equal(configurationFields(small,{size:'63'}).find(f=>f.id==='thread').choices.some(c=>c.id==='g-half'),false);
 assert.equal(configurationFields(small,{size:'100'}).find(f=>f.id==='thread').choices.some(c=>c.id==='g-half'),true);
});
