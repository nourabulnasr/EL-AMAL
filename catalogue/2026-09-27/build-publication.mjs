import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const base=new URL('./',import.meta.url);
const read=file=>JSON.parse(readFileSync(new URL(file,base),'utf8'));
const records=read('content-source.json'),input=read('translation-input.json'),translated=read('translations.json'),links=read('datasheet-links.json'),manifest=read('source-manifest.json');
assert.equal(translated.length,input.length);
const translation=new Map(translated.map((t,i)=>{assert.equal(t.id,input[i].id);assert.equal(t.en,input[i].en);assert.ok(t.ar.trim());return[t.en,t.ar];}));
const bilingual=en=>{const ar=translation.get(en);assert.ok(ar,`Missing translation: ${en}`);return {en,ar};};
const categories=[
 {key:'pressure',name:{en:'Pressure measurement',ar:'قياس الضغط'},description:{en:'Pressure gauges, sensors, switches and diaphragm seal systems.',ar:'مقاييس وحساسات ومفاتيح الضغط وأنظمة العزل الغشائي.'}},
 {key:'temperature',name:{en:'Temperature measurement',ar:'قياس الحرارة'},description:{en:'Thermocouples, resistance thermometers, probes, transmitters and displays.',ar:'المزدوجات الحرارية ومقاييس الحرارة بالمقاومة والمجسات والمرسلات وشاشات العرض.'}},
 {key:'accessories',name:{en:'Valves & accessories',ar:'الصمامات والملحقات'},description:{en:'Valves, manifolds, protective devices and instrument accessories.',ar:'الصمامات ومجموعاتها وأجهزة الحماية وملحقات أدوات القياس.'}},
];
const products=records.map(record=>{
 const source=manifest.images.find(s=>s.sourceId===record.sourceId),sheets=links.cards.find(s=>s.model===record.model&&s.sourceId===record.sourceId);
 assert.ok(source&&sheets&&!sheets.unresolvedCodes.length,`Unverified source: ${record.model}`);
 const category=[27,28,29,50].includes(record.page)&&!record.model.startsWith('CS')?'accessories':record.page>=34?'temperature':'pressure';
 const instrumentType=category==='accessories'?'accessory':category==='temperature'?'temperature-instrument':/switch/i.test(record.label)?'pressure-switch':/sensor/i.test(record.label)&&!record.model.endsWith('M')?'pressure-transmitter':'pressure-gauge';
 const specifications=record.rows.map(s=>({label:bilingual(s.label),value:bilingual(s.value)}));
 // Manufacturer datasheets resolve these documented brochure inconsistencies.
 if(record.model==='A-1200')for(const spec of specifications)if(spec.label.en==='Measuring range')for(const locale of ['en','ar'])spec.value[locale]=spec.value[locale].replace(/(^|• )1 … 0/g,'$1-1 … 0');
 if(record.model==='HPNV')for(const spec of specifications)if(spec.label.en==='Nominal pressure')spec.value={en:'15,000 … 60,000 psi [1,034 … 4,136 bar]',ar:'15,000 … 60,000 psi [1,034 … 4,136 bar]'};
 const applicationEvidence=sheets.codes.map(code=>links.byCode[code].firstPageSummary.split(/Applications/i)[1]?.split(/Special features|Description/i)[0]??'').join(' ');
 const applications=[];
 if(/oil|petrochem|refiner|gas industry|gas applications/i.test(applicationEvidence))applications.push('oil-gas');
 if(/machin|plant|process|industrial|industry|water|hydraulic|pneumatic|chemical|heating|refrigeration|ventilation|power|automation|test bench|manufactur/i.test(applicationEvidence))applications.push('general-industry');
 const name=bilingual(record.label);
 const highlight=specifications.find(s=>['Measuring range','Scale range','Setting range','Input','Nominal pressure','Switching temperature'].includes(s.label.en));
 const description={en:`WIKA ${record.model} — ${name.en}.${highlight?` ${highlight.label.en}: ${highlight.value.en.replace(/\n•/g,';').replace(/• /g,'')}.`:''}`,ar:`${name.ar} من WIKA، الطراز ${record.model}.${highlight?` ${highlight.label.ar}: ${highlight.value.ar.replace(/\n•/g,'؛').replace(/• /g,'')}.`:''}`};
 const datasheets=sheets.documents.map(({title,url})=>({title,url}));
 if(!datasheets.length)datasheets.push({title:`WIKA catalogue · ${record.model} · p. ${record.page}`,url:sheets.catalogueUrl});
 const externalId='wika-'+record.model.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 return {externalId,model:record.model,category,name,description,instrumentType,applications,datasheetUrl:datasheets[0].url,
  sourceRef:`User-authorized real catalogue publication 2026-09-27; ${record.sourceId}; photo SHA256 ${source.sha256}; official portfolio p.${record.page}; all main-page models inherit folder stock; model-family specifications, no exact SKU quantities.`,
  catalogueDetails:{manufacturer:'WIKA',image:{src:record.image.src,width:record.image.width,height:record.image.height,alt:{en:`WIKA ${record.model} — ${name.en}`,ar:`WIKA ${record.model} — ${name.ar}`},sourceUrl:sheets.catalogueUrl},specifications,availability:record.availability,availabilityReportedAt:'2026-09-27',datasheets}};
});
writeFileSync(new URL('publication.json',base),JSON.stringify({categories,products},null,2)+'\n');
console.log(JSON.stringify({products:products.length,specifications:products.reduce((n,p)=>n+p.catalogueDetails.specifications.length,0),inStock:products.filter(p=>p.catalogueDetails.availability==='in-stock').length,categories:categories.map(c=>[c.key,products.filter(p=>p.category===c.key).length]),oilGas:products.filter(p=>p.applications.includes('oil-gas')).length,generalIndustry:products.filter(p=>p.applications.includes('general-industry')).length}));
