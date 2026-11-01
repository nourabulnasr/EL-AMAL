import type {Locale,Translated} from './catalogue.ts';
import type {CatalogueDetails} from './catalogue-details.ts';
export const configurationIds=['model','size','scale','thread'] as const;
export type Configuration=Partial<Record<typeof configurationIds[number],string>>;
export type ConfigProduct={model:string;category:string;details?:Pick<CatalogueDetails,'specifications'>};
export type ConfigurationField={id:typeof configurationIds[number];label:Translated;choices:{id:string;label:Translated}[]};
const tr=(en:string,ar=en):Translated=>({en,ar});
const choice=(id:string,en:string,ar=en)=>({id,label:tr(en,ar)});
const field=(id:ConfigurationField['id'],en:string,ar:string,choices:ConfigurationField['choices']):ConfigurationField=>({id,label:tr(en,ar),choices});
const number='[+-]?\\d[\\d,]*(?:\\.\\d+)?';
const rangePattern=new RegExp(`(${number})\\s*(?:…|\\.{2,3})\\s*(${number})\\s*(mbar|bar(?: abs\\.?)?|psi|MPa|kPa|°C|°F)?`,'g');
const units:Record<string,Translated>={bar:tr('bar','بار'),mbar:tr('mbar','مللي بار'),psi:tr('psi'),MPa:tr('MPa'),kPa:tr('kPa'),c:tr('°C','°م'),f:tr('°F','°ف'),'bar-abs':tr('bar abs.','بار مطلق')};
function scale(unit:string,low:number,high:number){const u=units[unit];return choice(`${unit}:${low}:${high}`,`${low}–${high} ${u.en}`,`${low}–${high} ${u.ar}`);}
const zeros=(unit:string,values:number[])=>values.map(high=>scale(unit,0,high));
const row=(p:ConfigProduct,name:string)=>p.details?.specifications.find(r=>r.label.en.toLowerCase().trim()===name)?.value.en;
function applicableRows(value:string,model:string,size?:string){return value.split(/\n/).filter(line=>{
 const prefix=line.match(/^\s*[•\-]?\s*([A-Za-z0-9][A-Za-z0-9.-]*)\s*:/)?.[1];
 if(prefix&&/\d/.test(prefix)&&!model.includes(prefix))return false;
 const nominal=line.match(/\bNS\s+(\d+)\s*:/)?.[1];return !nominal||!size||nominal===size;
}).join('\n');}
function explicitSizes(value:string){
 if(/…|\.{2,}|\bto\b/.test(value))return [];
 const parts=value.replace(/^.*?:/gm,'').match(/\d+(?:\.\d+)?\s*[x×]\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?/g)??[];
 const unit=/["”]|\binch/.test(value)&&!value.includes('mm')?'in':'mm';
 return [...new Set(parts.map(n=>n.replace(/\s*[x×]\s*/,'x')))].map(n=>choice(n,`${n.replace('x',' × ')} ${unit}`,`${n.replace('x',' × ')} ${unit==='in'?'بوصة':'مم'}`));
}
function explicitScales(value:string){
 // Family spans prove endpoints only. Never interpolate unlisted scales.
 const matches=[...value.matchAll(rangePattern)],fallback=[...matches].reverse().find(m=>m[3])?.[3];
 return matches.flatMap(m=>{let unit=m[3]??fallback;if(!unit)return [];unit=unit==='°C'?'c':unit==='°F'?'f':unit.startsWith('bar abs')?'bar-abs':unit;
 const low=Number(m[1].replaceAll(',','')),high=Number(m[2].replaceAll(',',''));
 return units[unit]&&Number.isFinite(low)&&Number.isFinite(high)&&low<high?[scale(unit,low,high)]:[];});
}
const threads={g8:choice('g-eighth','G ⅛ B'),g4:choice('g-quarter','G ¼ B'),g2:choice('g-half','G ½ B'),n8:choice('npt-eighth','⅛ NPT'),n4:choice('npt-quarter','¼ NPT'),n2:choice('npt-half','½ NPT')};
/** Orderable scale rows only; operating limits are never interpreted as customer choices.
 * Curated connections use each model's linked WIKA PM/PV/TM/TV sheet; provenance is in docs/product-configuration-progress.md.
 */
export function configurationFields(p:ConfigProduct,selected:Configuration={}):ConfigurationField[]{
 const fields:ConfigurationField[]=[];if(!['pressure','temperature'].includes(p.category))return fields;
 const models=p.model.split(/,\s*/).map(s=>s.trim()).filter(Boolean);
 if(models.length>1)fields.push(field('model','Model','الطراز',models.map(m=>choice(m,m))));
 const model=selected.model??(models.length===1?models[0]:'');
 const nominal=row(p,'nominal size');
 if(nominal){let sizes=explicitSizes(applicableRows(nominal,model));
  const suffix=model.match(/^(?:PGS|PGT)\d+\.(063|100|160)$/)?.[1];if(suffix)sizes=sizes.filter(s=>Number(s.id)===Number(suffix));
  if(model==='111.12')sizes=sizes.filter(s=>s.id!=='160');
  if(/^111\.(10|12)$/.test(model))sizes=sizes.filter(s=>s.id!=='27');
  if(sizes.length)fields.push(field('size',sizes.some(s=>s.id.includes('x'))?'Case size':'Dial size',sizes.some(s=>s.id.includes('x'))?'مقاس العلبة':'قطر القرص',sizes));
 }
 const sf=fields.find(f=>f.id==='size'),size=selected.size??(sf?.choices.length===1?sf.choices[0].id:undefined);
 // Measuring/setting limits describe capabilities, not necessarily orderable scales (e.g. autorange probes).
 let scales=explicitScales(applicableRows(row(p,'scale range')??'',model,size));
 if(p.category==='pressure')scales=scales.filter(s=>Number(s.id.split(':')[1])<=0);
 let connection:ConfigurationField['choices']=[];
 if(/^(232|233)\.50$/.test(model)){
  scales=[...zeros('bar',[0.6,1,1.6,2.5,4,6,10,16,25,40,60,100,160,250,400,600,1000,1600].filter(n=>n<=(size==='160'?1600:1000)&&(size!=='63'||n>=1))),...zeros('psi',[10,15,30,60,100,160,200,300,400,600,800,1000,1500,2000,3000,4000,5000,6000,7500,10000,15000,20000].filter(n=>(size!=='63'||n>=15)&&(size==='160'||n<=15000))),scale('bar',-1,0),...[0.6,1.5,3,5,9,15,24].map(n=>scale('bar',-1,n))];
  connection=size==='63'?[threads.g8,threads.g4,threads.n8,threads.n4,choice('m12','M12 × 1.5'),choice('r-quarter','R ¼')]:[threads.g4,threads.g2,threads.n4,threads.n2,choice('m12','M12 × 1.5'),choice('m20','M20 × 1.5'),choice('r-quarter','R ¼'),choice('r-half','R ½')];
 }else if(/^111\.(10|12)$/.test(model)){
  scales=[...zeros('bar',[0.6,1,1.6,2.5,4,6,10,16,20,25,40,60,100,160,250,315,400].filter(n=>size!=='160'||n<=40)),scale('bar',-1,0),...[0.6,1.5,3,5,9,15,24,30].map(n=>scale('bar',-1,n))];
  connection=[threads.g8,threads.g4,threads.n8,threads.n4,choice('r-eighth','R ⅛'),choice('r-quarter','R ¼'),...Number(size)>=80?[threads.g2,threads.n2,choice('r-half','R ½')]:[]];
 }else if(/^(432|433|452|453)\.(30|50)$/.test(model)){
  scales=[...zeros('mbar',[16,25,40,60,100,160,250,400,600,1000]),...zeros('bar',[0.6,1,1.6,2.5,4,6,10,16,25]),...zeros('psi',[10,15,30,60,100,160,200,300,400])];connection=[threads.g2,threads.n2,choice('m20','M20 × 1.5'),choice('dn25-pn40','Flange DN 25 PN 40','فلنجة DN 25 PN 40'),choice('dn50-pn40','Flange DN 50 PN 40','فلنجة DN 50 PN 40'),choice('flange-1-150','Flange 1 in Class 150 RF','فلنجة 1 بوصة Class 150 RF'),choice('flange-2-150','Flange 2 in Class 150 RF','فلنجة 2 بوصة Class 150 RF'),choice('flange-1-300','Flange 1 in Class 300 RF','فلنجة 1 بوصة Class 300 RF')];
 }else if(p.category==='temperature'&&['55','TG53'].includes(model)){
  const negative=model==='55'?[[-70,70],[-70,30],[-50,50],[-50,100],[-50,300],[-50,500],[-40,60],[-40,80],[-40,160],[-30,50],[-30,70],[-20,60],[-20,80],[-20,100],[-20,120],[-20,140],[-10,50]]:[[-70,70],[-70,30],[-60,50],[-50,50],[-50,100],[-50,200],[-50,300],[-50,400],[-50,500],[-40,40],[-40,60],[-40,80],[-40,160],[-30,30],[-30,50],[-30,70],[-20,40],[-20,60],[-20,80],[-20,100],[-20,120],[-20,140],[-10,50]];
  const fahrenheit=model==='55'?[[-80,120],[-80,240],[-20,120],[0,200],[0,250],[30,300],[30,400],[50,300],[50,400],[100,800],[200,700],[200,1000]]:[[-100,150],[-80,120],[-80,240],[-40,120],[0,140],[0,200],[0,250],[30,300],[30,400],[50,400],[100,800],[150,750],[200,1000]];
  scales=[...negative.map(([a,b])=>scale('c',a,b)),...zeros('c',[60,80,100,120,150,160,200,250,300,400,500,600]),...fahrenheit.map(([a,b])=>scale('f',a,b))];
  connection=[threads.g2,threads.n2,choice('plain','Plain stem','ساق بدون سن'),choice('g-half-female','G ½ female'),choice('npt-half-female','½ NPT female'),choice('m20','M20 × 1.5'),choice('m24-female','M24 × 1.5 female')];
 }
 if(!connection.length){
  if(['212.20','213.40','232.30','233.30'].includes(model))connection=size==='63'?[threads.g8,threads.g4,threads.n8,threads.n4]:[threads.g4,threads.g2,threads.n4,threads.n2];
  if(['422.12','423.12'].includes(model))connection=[threads.g2];
  if(/^(432|433)\.(36|56)$/.test(model)||/^PG[ST]43(?:\.(100|160))?$/.test(model))connection=[threads.g2,threads.n2,choice('m20','M20 × 1.5'),choice('dn25-pn40','Flange DN 25 PN 40','فلنجة DN 25 PN 40'),choice('dn50-pn40','Flange DN 50 PN 40','فلنجة DN 50 PN 40')];
  if(['711.12','731.12'].includes(model))connection=[choice('pair-g-half','2 × G ½ B')];
  if(model==='DPG40')connection=[choice('pair-g-quarter-female','2 × G ¼ female'),choice('pair-g-quarter-male','2 × G ¼ B male'),...[6,8,10].map(n=>choice(`pair-compression-${n}`,`2 × compression fitting ${n} mm`,`وصلتا ضغط ${n} مم`))];
  if(model==='PGS21')connection=[threads.g8,threads.g4,threads.n8,threads.n4,choice('m10','M10 × 1')];
  if(/^PG[ST]23\.(100|160)$/.test(model))connection=[threads.g4,threads.g2,threads.n4,threads.n2];
  // Small Bourdon instruments: PM01.08 / PM02.12 / PV21.04 / PV22.03 / PV12.03 / PV11.03.
  if(['113.53','213.53'].includes(model))connection=Number(size)>=80?[threads.g4,threads.g2,threads.n4,threads.n2]:[threads.g8,threads.g4,threads.n8,threads.n4];
  if(['PGS25','PGS23.063','PGT21'].includes(model))connection=[threads.g8,threads.g4,threads.n8,threads.n4];
  if(model==='PGT23.063')connection=[threads.g8,threads.g4,threads.g2,threads.n4,threads.n2,choice('m10','M10 × 1'),choice('m12','M12 × 1.5')];
  if(/^PGS21\.(100|160)$/.test(model))connection=[threads.g4,choice('g-three-eighths','G ⅜ B'),threads.g2,threads.n2];
  // Paired differential connections are explicit; never substitute a single port.
  if(['700.01','700.02'].includes(model))connection=[choice('pair-g-quarter-female','2 × G ¼ female')];
  if(['DPGT40','DPGS40','DPGS40TA'].includes(model))connection=[choice('pair-g-quarter-female','2 × G ¼ female'),choice('pair-g-quarter-male','2 × G ¼ B male'),...[6,8,10].map(n=>choice(`pair-compression-${n}`,`2 × compression fitting ${n} mm`,`وصلتا ضغط ${n} مم`))];
  if(['DPGT43','DPGS43'].includes(model))connection=[choice('pair-g-quarter-female','2 × G ¼ female'),choice('pair-g-half','2 × G ½ B male'),choice('pair-npt-quarter-female','2 × ¼ NPT female'),choice('pair-npt-half','2 × ½ NPT male')];
  if(['DPGT43HP','DPGS43HP'].includes(model))connection=[choice('pair-g-half-female','2 × G ½ female'),choice('pair-g-half','2 × G ½ B male'),choice('pair-npt-half','2 × ½ NPT male'),choice('en61518','Differential flange EN 61518','فلنجة فرق ضغط EN 61518')];
  if(['APGT43','532.53 with 8xx'].includes(model))connection=[threads.g2,threads.n2];
  if(['632.51 with 8xx','PGT63HP'].includes(model))connection=[threads.g2,threads.n2,choice('m20','M20 × 1.5')];
  if(['432.56 with 8xx','PGT43HP'].includes(model))connection=[threads.g2,threads.n2,choice('npt-half-female','½ NPT female'),choice('dn25-pn40','Flange DN 25 PN 40','فلنجة DN 25 PN 40'),choice('dn50-pn40','Flange DN 50 PN 40','فلنجة DN 50 PN 40')];
  // Thermometer process threads are independent of the dial diameter (TV28.01/.02/.03, TV25.01, TV27.01).
  if(['TGS55','TGS73','70 with 8xx'].includes(model))connection=[threads.g2,threads.n2,choice('plain','Plain stem','ساق بدون سن'),choice('g-three-quarter','G ¾ B'),choice('npt-three-quarter','¾ NPT')];
  if(model==='SC15')connection=[threads.g2,choice('g-three-eighths','G ⅜ B'),threads.n8,threads.n4,threads.n2,choice('m10','M10 × 1')];
  if(model==='SB15')connection=[threads.g4,choice('g-three-eighths','G ⅜ B'),threads.g2,choice('m14','M14 × 1.5'),choice('m16','M16 × 1.5'),choice('m18','M18 × 1.5')];
 }
 if(model==='PGT63HP')scales=zeros('mbar',[2.5,100]); // PV16.06: portfolio text omits the zero starts.
 if(['212.20','213.40','113.53','213.53'].includes(model)){
  const maxima=model==='113.53'?[1,1.6,2.5,4,6,10,16,25,40,60,100,160,200,250,315,400,600]:[0.6,1,1.6,2.5,4,6,10,16,25,40,60,100,160,250,315,400,600,1000];
  scales=[...zeros('bar',maxima),scale('bar',-1,0),...[0.6,1.5,3,5,9,15,24,30].map(n=>scale('bar',-1,n))];
 }
 if(model==='TGS55')scales=[...[[-70,30],[-50,50],[-30,50],[-20,60],[-20,120],[-20,140]].map(([a,b])=>scale('c',a,b)),...zeros('c',[60,80,100,120,160,200,250,300,400,500,600])];
 if(model==='70 with 8xx')scales=[...[[-60,40],[-40,60],[-30,50],[-20,80]].map(([a,b])=>scale('c',a,b)),...zeros('c',[60,80,100,120,160,200,250])];
 const unique=[...new Map(scales.map(s=>[s.id,s])).values()];
 if(unique.length)fields.push(field('scale',p.category==='temperature'?'Temperature scale & unit':'Pressure scale & unit',p.category==='temperature'?'تدريج الحرارة والوحدة':'تدريج الضغط والوحدة',unique));
 if(connection.length)fields.push(field('thread','Process connection','وصلة العملية',connection));return fields;
}
export function resolveConfiguration(p:ConfigProduct,selected:Configuration={}):Configuration{
 const result={...selected};for(let i=0;i<2;i++)for(const f of configurationFields(p,result))if(f.choices.length===1&&result[f.id]===undefined)result[f.id]=f.choices[0].id;
 return Object.fromEntries(configurationIds.filter(k=>result[k]!==undefined).map(k=>[k,result[k]]));
}
export function validateConfiguration(p:ConfigProduct,selected:Configuration={}):boolean{
 const fields=configurationFields(p,selected),resolved=resolveConfiguration(p,selected);
 return Object.keys(selected).every(key=>fields.some(f=>f.id===key))&&fields.every(f=>f.choices.some(c=>c.id===resolved[f.id]));
}
export function configurationSummary(p:ConfigProduct,selected:Configuration={},locale:Locale):string{
 const resolved=resolveConfiguration(p,selected);return configurationFields(p,resolved).map(f=>`${f.label[locale]}: ${f.choices.find(c=>c.id===resolved[f.id])?.label[locale]??'—'}`).join(' | ');
}
export function configurationSnapshot(p:ConfigProduct,selected:Configuration={}):string|undefined{
 if(!validateConfiguration(p,selected))throw new Error('Invalid product configuration');
 if(!configurationFields(p,selected).length)return;
 const resolved=resolveConfiguration(p,selected),labels={model:'Model/طراز',size:'Size/مقاس',scale:'Scale/تدريج',thread:'Thread/وصلة'};
 const value=configurationFields(p,resolved).map(f=>`${labels[f.id]}: ${f.choices.find(c=>c.id===resolved[f.id])!.label.en}`).join(' | ');
 if(value.length>160)throw new Error('Configuration exceeds snapshot limit');return value;
}
export function configurationKey(config:Configuration={}){return configurationIds.map(k=>config[k]??'').join(';');}
export function configurationProduct(p:ConfigProduct):ConfigProduct{
 return {model:p.model,category:p.category,...p.details?{details:{specifications:p.details.specifications.filter(r=>['nominal size','scale range'].includes(r.label.en.toLowerCase().trim()))}}:{}};
}
