import {normalise, type Locale, type Product, type Translated} from './catalogue.ts';

type RelatedProductOptions = {limit?:number; now?:Date};
type SuggestionRule = {left:Set<string>;right:Set<string>;purpose:Translated;priority:number};
const models=(values:readonly string[])=>new Set(values.map(normalise));
const rule=(left:readonly string[],right:readonly string[],purpose:Translated,priority=100):SuggestionRule=>({left:models(left),right:models(right),purpose,priority});

// Reviewed model families, not guesses from names, broad categories or industry tags.
// These are configuration enquiries, not certified instrument assemblies. Sources:
// WIKA AC 09.19/09.22 (single-pressure isolation), AC 09.23 (differential),
// AC 09.03/09.06 (protection), TE 15.01/16.01/32.04/38.01 (sensor inputs),
// TE 65.82 (TC82 accessories), and the supplied, dated publication datasets.
const threadedPressureInstruments=[
 '111.10, 111.12','212.20','213.40','113.53, 213.53','232.50, 233.50','232.30, 233.30',
 'PGS21','PGS23.100, PGS23.160','PGS25','PGS23.063','PGS21.100, PGS21.160',
 'PGT21','PGT23.063','PGT23.100, PGT23.160','O-10',
 'PSM01','PSM-520','PSM02','PSM-550','PSM-700','PXS, PXA','BWX, BA','PCS, PCA','MW, MA','APW, APA',
];
const differentialInstruments=['DPGT43','DPGT43HP','DPGS43','DPGS43HP','DW, DA'];
const resistanceSensors=[
 'TR10-A','TR10-D','TR10-B','TR10-F','TR10-C','TR10-H','TR11-A','TR12-A',
 'TR10-K','TR12-B','TR12-M','TR10-L','TR53','TR55','TR81','TR50','TR60','TR40','TR41',
];
const thermocouples=[
 'TC10-K','TC12-A','TC10-L','TC12-B','TC12-M','TC10-A','TC10-D','TC10-B','TC10-F',
 'TC10-C','TC10-H','TC59-T','TC59-E','TC59-V','TC82','TC80','TC83','TC81','TC84','TC90',
 'TC40','TC50','TC46','TC53','TC47',
];
const rules:readonly SuggestionRule[]=[
 rule(threadedPressureInstruments,['IV1','IV2','BV','910.10, 910.11','IBM, IBF'],
  {en:'Pressure measurement and isolation',ar:'قياس الضغط وعزل الجهاز'}),
 rule(threadedPressureInstruments,['910.12'],
  {en:'Protection from pressure pulsations',ar:'الحماية من نبضات الضغط'},80),
 rule(threadedPressureInstruments,['910.15'],
  {en:'For installations with hot media',ar:'للتركيبات ذات الأوساط الساخنة'},70),
 rule(differentialInstruments,['IV3, IV5'],
  {en:'Differential pressure isolation and equalising',ar:'عزل الضغط التفاضلي وموازنته'}),
 rule(['DSS26M','DSS26T'],['IVM'],
  {en:'Flanged pressure measurement and isolation',ar:'قياس الضغط وعزله بوصلات ذات فلنجات'}),
 rule(['HPNV'],['HPFA'],
  {en:'High-pressure connection components',ar:'مكوّنات توصيل الضغط العالي'}),
 rule(resistanceSensors,['T15','T32','T38'],
  {en:'Resistance sensor and transmitter',ar:'حساس مقاومة ومرسل حرارة'}),
 rule(thermocouples,['T16','T32','T38'],
  {en:'Thermocouple and transmitter',ar:'مزدوج حراري ومرسل حرارة'}),
 rule(['T38'],['TND'],
  {en:'Display option for the T38 head-mounted version',ar:'خيار عرض لإصدار T38 المثبّت في رأس التوصيل'},200),
 rule(['TC82'],['PP82'],
  {en:'Purge-gas provision for the TC82 configuration',ar:'تجهيز غاز التطهير لطراز TC82'},200),
 rule(['TC82'],['IR80'],
  {en:'Installation support for the TC82 configuration',ar:'دعم تركيب طراز TC82'},200),
];

function isReviewedManufacturer(product:Product):boolean {
 if(product.details?.manufacturer==='WIKA')return true;
 if(!product.datasheetUrl)return false;
 try {
  const url=new URL(product.datasheetUrl);
  return url.protocol==='https:'&&!url.username&&!url.password&&(url.hostname==='wika.com'||url.hostname.endsWith('.wika.com'));
 } catch {return false;}
}

function relation(left:string,right:string):SuggestionRule|undefined {
 return rules.find(rule=>(rule.left.has(left)&&rule.right.has(right))||(rule.right.has(left)&&rule.left.has(right)));
}

export function productSuggestionPurpose(product:Product,candidate:Product,locale:Locale):string|undefined {
 if(!isReviewedManufacturer(product)||!isReviewedManufacturer(candidate))return;
 return relation(normalise(product.model),normalise(candidate.model))?.purpose[locale];
}

// A stable shuffle avoids client hydration changes and does not use visitor data.
function hash(value:string) {
 let result=2166136261;
 for(const character of value){result^=character.charCodeAt(0);result=Math.imul(result,16777619);}
 // Avalanche similar model references so neighbouring catalogue IDs do not cluster.
 result^=result>>>16;result=Math.imul(result,0x85ebca6b);
 result^=result>>>13;result=Math.imul(result,0xc2b2ae35);
 return (result^(result>>>16))>>>0;
}

/** Complementary discovery from the published catalogue, never a compatibility guarantee. */
export function selectRelatedProducts<T extends Product>(product:Product,products:readonly T[],{limit=3,now=new Date()}:RelatedProductOptions={}):T[] {
 const count=Number.isFinite(limit)?Math.max(0,Math.min(3,Math.floor(limit))):3;
 if(!count||!isReviewedManufacturer(product))return [];
 const currentModel=normalise(product.model);
 const applications=new Set(product.applications??[]);
 const day=Number.isFinite(now.getTime())?now.toISOString().slice(0,10):'catalogue';
 const seed=`${product.id}:${currentModel}:${day}`;
 const ranked=products.flatMap(candidate=>{
  if(candidate.id===product.id||normalise(candidate.model)===currentModel||!isReviewedManufacturer(candidate))return [];
  const match=relation(currentModel,normalise(candidate.model));
  if(!match)return [];
  return [{
   product:candidate,purpose:match.purpose.en,
   relevance:match.priority*100+Math.min(9,new Set(candidate.applications?.filter(application=>applications.has(application))??[]).size),
   order:hash(`${seed}:${normalise(candidate.model)}:${candidate.id}`),
  }];
 })
  .sort((a,b)=>b.relevance-a.relevance||a.order-b.order||(a.product.id<b.product.id?-1:a.product.id>b.product.id?1:0));
 const selected:T[]=[],seenIds=new Set<string>(),seenModels=new Set<string>(),seenPurposes=new Set<string>();
 const include=(candidate:typeof ranked[number])=>{
  selected.push(candidate.product);seenIds.add(candidate.product.id);
  seenModels.add(normalise(candidate.product.model));seenPurposes.add(candidate.purpose);
 };
 // A valve page should always introduce a reviewed gauge when one is available;
 // remaining slots can still rotate through other useful measuring instruments.
 const gauge=product.category==='accessories'?ranked.find(candidate=>candidate.product.instrumentType==='pressure-gauge'):undefined;
 if(gauge)include(gauge);
 // Prefer distinct complementary functions before filling with alternative models
 // of the same accessory. The seed rotates only within reviewed candidate pools.
 for(const distinctPurpose of [true,false]){
  for(const candidate of ranked){
   if(selected.length===count)return selected;
   const model=normalise(candidate.product.model);
   if(seenIds.has(candidate.product.id)||seenModels.has(model)||(distinctPurpose&&seenPurposes.has(candidate.purpose)))continue;
   include(candidate);
  }
 }
 return selected;
}
