import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const here=new URL('./',import.meta.url);
const read=f=>JSON.parse(readFileSync(new URL(f,here),'utf8'));
const records=read('official-extraction.json'),intake=read('intake-review.json'),links=read('datasheet-links.json');
const catalogueUrl='https://microsites.wika.com/upload/BR_ProductPortfolio_en_co_6434.pdf';
const clean=s=>s.replace(/\n(?!•)/g,' ').trim();
const dictionary=new Map(read('translation-cache.json').map(t=>[t.en,t.ar]));
const terms={
 'Standard version':'إصدار قياسي',
 'Stainless steel case':'غلاف من الفولاذ المقاوم للصدأ',
 'Heavy-duty version, case filling':'إصدار للخدمة الشاقة، مع تعبئة الغلاف بسائل',
 'Stainless steel case, case filling':'غلاف من الفولاذ المقاوم للصدأ، مع تعبئة بسائل',
 'For the process industry, standard version':'للصناعات التحويلية، إصدار قياسي',
 'For the process industry, safety version':'للصناعات التحويلية، إصدار أمان',
 'Grey cast iron case':'غلاف من الحديد الزهر الرمادي',
 'For the process industry, high overload safety up to 10 times the full scale value, max. 40 bar':'للصناعات التحويلية، حماية من الضغط الزائد حتى 10 أضعاف نهاية التدريج، وبحد أقصى 40 بار',
 'For the process industry, high overload safety to 40, 100 or 400 bar':'للصناعات التحويلية، حماية من الضغط الزائد حتى 40 أو 100 أو 400 بار',
 'With magnetic piston or with magnetic piston and separating diaphragm':'بمكبس مغناطيسي أو بمكبس مغناطيسي وغشاء فاصل',
 'With parallel entry, copper alloy or stainless steel':'بمدخلين متوازيين، من سبيكة النحاس أو الفولاذ المقاوم للصدأ',
 'With integrated working pressure indication (DELTA-plus)':'مع بيان مدمج لضغط التشغيل (DELTA-plus)',
 'Process version per ASME B40.200':'إصدار للصناعات التحويلية وفق ASME B40.200',
 'High-quality process version per EN 13190':'إصدار عالي الجودة للصناعات التحويلية وفق EN 13190',
};
for(const [en,ar] of Object.entries(terms))dictionary.set(en,ar);
// Numeric technical values retain model codes and standards; translate their units and qualifiers.
function translate(en){
 if(dictionary.has(en))return dictionary.get(en);
 const ar=en.replace(/with increasing differential pressure/g,'مع زيادة الضغط التفاضلي').replace(/with liquid filling/g,'مع التعبئة بسائل').replace(/Liquid damping/g,'تخميد بسائل').replace(/Stainless steel/g,'الفولاذ المقاوم للصدأ').replace(/case and probe/g,'الغلاف والمجس').replace(/optional/g,'اختياري').replace(/max\./g,'حد أقصى').replace(/\bto\b/g,'إلى').replace(/\bNS\b/g,'المقاس الاسمي').replace(/\bmbar\b/g,'ملي بار').replace(/\bbar\b/g,'بار').replace(/\bmm\b/g,'مم');
 assert.ok(!/[a-z]{3}/i.test(ar.replace(/DELTA-plus|ASME|IP\d+/g,'')),`Missing precise translation: ${en}`);
 return ar;
}
const bilingual=en=>({en,ar:translate(en)});
const names=[
 ['Bourdon tube pressure gauge — standard version','مقياس ضغط بأنبوب بوردون — إصدار قياسي'],
 ['Bourdon tube pressure gauge — stainless steel case','مقياس ضغط بأنبوب بوردون — غلاف من الفولاذ المقاوم للصدأ'],
 ['Bourdon tube pressure gauge — heavy-duty, liquid-filled','مقياس ضغط بأنبوب بوردون — للخدمة الشاقة، مع تعبئة بسائل'],
 ['Bourdon tube pressure gauge — stainless steel case, liquid-filled','مقياس ضغط بأنبوب بوردون — غلاف من الفولاذ المقاوم للصدأ، مع تعبئة بسائل'],
 ['Bourdon tube pressure gauge — process industry, standard version','مقياس ضغط بأنبوب بوردون — للصناعات التحويلية، إصدار قياسي'],
 ['Bourdon tube pressure gauge — process industry, safety version','مقياس ضغط بأنبوب بوردون — للصناعات التحويلية، إصدار أمان'],
 ['Diaphragm pressure gauge — grey cast iron case','مقياس ضغط غشائي — غلاف من الحديد الزهر الرمادي'],
 ['Diaphragm pressure gauge — up to 10-fold overload safety','مقياس ضغط غشائي — حماية من الضغط الزائد حتى 10 أضعاف نهاية التدريج'],
 ['Diaphragm pressure gauge — high overload safety','مقياس ضغط غشائي — حماية عالية من الضغط الزائد'],
 ['Differential pressure gauge — magnetic piston','مقياس ضغط تفاضلي — مكبس مغناطيسي'],
 ['Differential pressure gauge — parallel entry','مقياس ضغط تفاضلي — مدخلان متوازيان'],
 ['Differential pressure gauge — DELTA-plus','مقياس ضغط تفاضلي — DELTA-plus'],
 ['Bimetal thermometer — process version per ASME B40.200','مقياس حرارة ثنائي المعدن — للصناعات التحويلية وفق ASME B40.200'],
 ['Bimetal thermometer — high-quality process version per EN 13190','مقياس حرارة ثنائي المعدن — إصدار عالي الجودة للصناعات التحويلية وفق EN 13190'],
];
// Reviewed application headings in the exact manufacturer datasheets, not prose matches.
const applicationEvidence={
 '111.10, 111.12':{applications:['general-industry'],codes:['PM01.01'],basis:'Pneumatics; heating and air-conditioning technology'},
 '212.20':{applications:['general-industry'],codes:['PM02.01'],basis:'Industrial applications'},
 '213.40':{applications:['general-industry'],codes:['PM02.06'],basis:'Mining industry; hydraulics; shipbuilding'},
 '113.53, 213.53':{applications:['general-industry'],codes:['PM01.08','PM02.12'],basis:'Pumps and compressors; hydraulics'},
 '232.50, 233.50':{applications:['oil-gas','general-industry'],codes:['PM02.02'],basis:'Oil and gas industry; chemical and petrochemical industries; machine building and general plant construction'},
 '232.30, 233.30':{applications:['oil-gas','general-industry'],codes:['PM02.04'],basis:'Oil and gas industry; chemical and petrochemical industries; water and wastewater technology'},
 '422.12, 423.12':{applications:['general-industry'],codes:['PM04.02'],basis:'Plant engineering and construction; gaseous and liquid media'},
 '432.50, 433.50, 432.30, 433.30, 452.50, 453.50, 452.30, 453.30':{applications:['oil-gas','general-industry'],codes:['PM04.03'],basis:'Process industry: chemical, petrochemical, oil and gas, power generation, water and wastewater; original brochure retains 452/453 family'},
 '432.56, 433.56, 432.36, 433.36':{applications:['oil-gas','general-industry'],codes:['PM04.07'],basis:'Process industry: chemical, petrochemical, oil and gas, power generation, water and wastewater'},
 '700.01, 700.02':{applications:['general-industry'],codes:['PM07.14'],basis:'Filter plants; pump monitoring; cooling circuits; pipeline systems'},
 '711.12, 731.12':{applications:['general-industry'],codes:['PM07.02'],basis:'Heating, ventilation and air-conditioning'},
 'DPG40':{applications:['general-industry'],codes:['PM07.20'],basis:'Monitoring filtration, flow and level; boilers, pressure vessels, water treatment, pumping stations, heating and fire-extinguishing systems'},
 'TG53':{applications:['oil-gas','general-industry'],codes:['TM53.02'],basis:'Chemical and petrochemical, oil and gas, power generation, water/wastewater industries'},
 '55':{applications:['oil-gas','general-industry'],codes:['TM55.01'],basis:'Chemical and petrochemical, oil and gas, energy, water/wastewater industries'},
};
const categories=JSON.parse(readFileSync(new URL('../2026-09-27/publication.json',here),'utf8')).categories.filter(c=>['pressure','temperature'].includes(c.key));
const products=records.map((r,i)=>{
 const photo=intake.photos.find(p=>p.groups.some(g=>g.models.join(', ')===r.model));assert.ok(photo);
 const selected=photo.groups.find(g=>g.models.join(', ')===r.model);
 const card=links.cards.find(c=>c.model===r.model);assert.ok(card&&!card.unresolvedCodes.length);
 const name={en:names[i][0],ar:names[i][1]};
 const specifications=r.rows.filter(row=>row.label!=='Data sheet').map(row=>({label:bilingual(clean(row.label)),value:bilingual(clean(row.value))}));
 specifications.unshift({label:{en:'Version',ar:'الإصدار'},value:bilingual(clean(r.label))});
 if(r.model==='111.10, 111.12')specifications.push({label:{en:'Datasheet scope',ar:'نطاق ورقة البيانات'},value:{en:'PM 01.17 describes the 27 mm miniature back-mount version 111.12.027. Other nominal sizes are covered by PM 01.01.',ar:'تصف PM 01.17 الإصدار المصغر 111.12.027 بمقاس 27 مم وتوصيل خلفي. تغطي PM 01.01 المقاسات الاسمية الأخرى.'}});
 if(r.model.startsWith('432.50,'))specifications.push({label:{en:'Datasheet scope',ar:'نطاق ورقة البيانات'},value:{en:'Current PM 04.03 covers the 432/433 series. The 452/453 specifications shown here follow the supplied WIKA catalogue; confirm the required configuration when requesting a quotation.',ar:'تغطي PM 04.03 الحالية سلسلة 432/433. مواصفات سلسلة 452/453 المعروضة هنا مستمدة من كتالوج WIKA المقدم؛ يرجى تأكيد التكوين المطلوب عند طلب عرض السعر.'}});
 const datasheets=card.codes.map(code=>({title:`WIKA ${code.replace(/^([A-Z]+)(\d)/,'$1 $2')}`,url:links.byCode[code].url}));
 const category=photo.category;assert.ok(category==='pressure'||category==='temperature');
 const range=specifications.find(s=>s.label.en==='Scale range');
 const description={en:`WIKA ${r.model}. ${clean(r.label)}.${range?` Catalogue scale ranges: ${range.value.en.replace(/\n/g,' ')}.`:''}`,ar:`WIKA ${r.model}. ${translate(clean(r.label))}.${range?` نطاقات التدريج وفق الكتالوج: ${range.value.ar.replace(/\n/g,' ')}.`:''}`};
 const applications=applicationEvidence[r.model]?.applications;
 assert.ok(applications,`Missing reviewed applications: ${r.model}`);
 return {externalId:'wika-'+r.model.toLowerCase().replace(/[^a-z0-9]+/g,'-'),model:r.model,category,name,description,instrumentType:category==='temperature'?'temperature-instrument':'pressure-gauge',applications,datasheetUrl:datasheets[0].url,
 sourceRef:`User-confirmed important catalogue products and model-level stock on 2026-10-13; ${r.sourceId}; photo ${photo.filename}; SHA256 ${photo.sha256}; original WIKA portfolio p.${r.page}; exact highlighted model group; no SKU quantities inferred.`,
 catalogueDetails:{manufacturer:'WIKA',image:{src:r.image.src,width:r.image.width,height:r.image.height,alt:{en:`WIKA ${r.model} — ${name.en}`,ar:`WIKA ${r.model} — ${name.ar}`},sourceUrl:`${catalogueUrl}#page=${r.page}`},specifications,availability:'in-stock',availabilityReportedAt:'2026-10-13',datasheets,...selected.proposedOptions?{options:selected.proposedOptions}:{}}};
});
const stockUpdates=intake.photos.flatMap(p=>p.groups).filter(g=>g.action==='reuse-existing').map(g=>({id:Number(g.existingProductId.replace('cms-','')),externalId:g.externalId,model:g.models.join(', '),availability:'in-stock',availabilityReportedAt:'2026-10-13'}));
writeFileSync(new URL('publication.json',here),JSON.stringify({reviewDate:'2026-10-13',categories,products,stockUpdates},null,2)+'\n');
writeFileSync(new URL('application-evidence.json',here),JSON.stringify(applicationEvidence,null,2)+'\n');
writeFileSync(new URL('content-source.json',here),JSON.stringify(records.map(r=>({...r,rows:r.rows.filter(row=>row.label!=='Data sheet').map(row=>({label:clean(row.label),value:clean(row.value)}))})),null,2)+'\n');
const assets=records.flatMap(r=>[r.image,...r.alternateImages||[]].map(image=>({src:image.src,width:image.width,height:image.height,pdfPage:r.page,pdfImageName:image.pdfImageName,sha256:createHash('sha256').update(readFileSync(new URL('../../public'+image.src,here))).digest('hex')})));
writeFileSync(new URL('asset-evidence.json',here),JSON.stringify({sourceUrl:catalogueUrl,sourceSha256:createHash('sha256').update(readFileSync(new URL('../../docs/source/wika-2026-09-27/product-portfolio.pdf',here))).digest('hex'),policy:'Original embedded PDF image pixels; CMYK converted to RGB only for PNG compatibility. No generated imagery or photographic retouching.',assets},null,2)+'\n');
console.log(JSON.stringify({additions:products.length,stockUpdates:stockUpdates.length,specifications:products.reduce((n,p)=>n+p.catalogueDetails.specifications.length,0),options:products.filter(p=>p.catalogueDetails.options).length}));
