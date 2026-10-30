import type {Locale,Product,Translated} from './catalogue.ts';

export type TechnicalFacetId='material'|'unit'|'size'|'caseMaterial'|'accuracy'|'connection'|'explosion'|'filling'|'principle'|'approval'|'pressure'|'family';
export type TechnicalFilters=Partial<Record<TechnicalFacetId,string[]>>;
export type TechnicalFacetOption={id:string;label:Translated;count:number};
export type TechnicalFacetGroup={id:TechnicalFacetId;label:Translated;options:TechnicalFacetOption[]};

const definitions:Record<TechnicalFacetId,{label:Translated;options:{id:string;label:Translated}[]}>= {
 material:{label:{en:'Material of wetted parts',ar:'خامة الأجزاء الملامسة للوسط'},options:[
  {id:'material-stainless-steel',label:{en:'Stainless steel',ar:'ستانلس ستيل'}},
  {id:'material-copper-alloy',label:{en:'Copper alloy',ar:'سبيكة نحاس'}},
  {id:'material-special',label:{en:'Special materials',ar:'خامات خاصة'}},
  {id:'material-brass',label:{en:'Brass',ar:'نحاس أصفر'}},{id:'material-steel',label:{en:'Steel',ar:'فولاذ'}},
 ]},
 unit:{label:{en:'Measuring range',ar:'نطاق القياس'},options:[
  {id:'unit-bar',label:{en:'bar',ar:'بار'}},{id:'unit-psi',label:{en:'psi',ar:'رطل/بوصة²'}},
  {id:'unit-mpa',label:{en:'MPa',ar:'ميجا باسكال'}},{id:'unit-mbar',label:{en:'mbar',ar:'مللي بار'}},
  {id:'unit-celsius',label:{en:'°C',ar:'°م'}},{id:'unit-fahrenheit',label:{en:'°F',ar:'°ف'}},
 ]},
 size:{label:{en:'Nominal size',ar:'المقاس الاسمي'},options:[
  {id:'size-lte-40',label:{en:'≤ 40 mm · 1½ in',ar:'≤ ٤٠ مم · ١½ بوصة'}},{id:'size-50',label:{en:'50 mm · 2 in',ar:'٥٠ مم · ٢ بوصة'}},
  {id:'size-63',label:{en:'63 mm · 2½ in',ar:'٦٣ مم · ٢½ بوصة'}},{id:'size-80',label:{en:'80 mm · 3 in',ar:'٨٠ مم · ٣ بوصة'}},
  {id:'size-100',label:{en:'100 mm · 4 in',ar:'١٠٠ مم · ٤ بوصة'}},{id:'size-gte-160',label:{en:'≥ 160 mm · 6 in',ar:'≥ ١٦٠ مم · ٦ بوصة'}},
 ]},
 caseMaterial:{label:{en:'Case material',ar:'خامة العلبة'},options:[
  {id:'case-stainless-steel',label:{en:'Stainless steel',ar:'ستانلس ستيل'}},
  {id:'case-steel',label:{en:'Steel',ar:'فولاذ'}},{id:'case-plastic',label:{en:'Plastic',ar:'بلاستيك'}},
 ]},
 accuracy:{label:{en:'Indication accuracy',ar:'دقة الإشارة'},options:[
  {id:'accuracy-highest',label:{en:'Highest · 0.1%; 0.25%',ar:'الأعلى · ٠٫١٪؛ ٠٫٢٥٪'}},
  {id:'accuracy-high',label:{en:'High · 0.6%',ar:'عالية · ٠٫٦٪'}},
  {id:'accuracy-standard',label:{en:'Standard · 1%; 1.6%; 2.5%; 4%',ar:'قياسية · ١٪؛ ١٫٦٪؛ ٢٫٥٪؛ ٤٪'}},
 ]},
 explosion:{label:{en:'Explosion protection',ar:'الحماية من الانفجار'},options:[
  {id:'explosion-iecex',label:{en:'IECEx',ar:'IECEx'}},{id:'explosion-atex',label:{en:'ATEX',ar:'ATEX'}},
  {id:'explosion-ukraine',label:{en:'Ex Ukraine',ar:'Ex Ukraine'}},{id:'explosion-eac',label:{en:'EAC Ex',ar:'EAC Ex'}},
  {id:'explosion-ukex',label:{en:'UKEX',ar:'UKEX'}},{id:'explosion-ecasex',label:{en:'ECASEx',ar:'ECASEx'}},
 ]},
 connection:{label:{en:'Connector type',ar:'نوع التوصيل'},options:[
  {id:'connection-thread',label:{en:'Thread',ar:'سن لولبي'}},{id:'connection-flange',label:{en:'Flange',ar:'فلانشة'}},{id:'connection-hygiene',label:{en:'Hygiene',ar:'توصيل صحي'}},
  {id:'connection-compression',label:{en:'Compression fitting',ar:'وصلة ضغط'}},{id:'connection-surface',label:{en:'Surface mounting',ar:'تركيب سطحي'}},
  {id:'connection-bayonet',label:{en:'Bayonet',ar:'بايونيت'}},
 ]},
 filling:{label:{en:'Case filling',ar:'تعبئة العلبة'},options:[
  {id:'filling-filled',label:{en:'Filled gauge',ar:'عداد مملوء'}},{id:'filling-unfilled',label:{en:'Unfilled gauge',ar:'عداد غير مملوء'}},
 ]},
 principle:{label:{en:'Measuring principle',ar:'مبدأ القياس'},options:[
  {id:'principle-bourdon',label:{en:'Bourdon tube',ar:'أنبوب بوردون'}},{id:'principle-diaphragm',label:{en:'Diaphragm element',ar:'عنصر غشائي'}},
  {id:'principle-capsule',label:{en:'Capsule element',ar:'عنصر كبسولي'}},
 ]},
 approval:{label:{en:'Approvals',ar:'الاعتمادات'},options:[
  {id:'approval-sil',label:{en:'SIL',ar:'SIL'}},{id:'approval-dnv',label:{en:'DNV',ar:'DNV'}},{id:'approval-flow-100',label:{en:'Flow 100',ar:'Flow 100'}},
 ]},
 pressure:{label:{en:'Permissible pressure',ar:'الضغط المسموح'},options:[
  {id:'pressure-6000',label:{en:'Up to 6,000 psi',ar:'حتى ٦٬٠٠٠ psi'}},{id:'pressure-10000',label:{en:'Up to 10,000 psi',ar:'حتى ١٠٬٠٠٠ psi'}},
  {id:'pressure-15000',label:{en:'15,000 psi',ar:'١٥٬٠٠٠ psi'}},{id:'pressure-30000',label:{en:'30,000 psi',ar:'٣٠٬٠٠٠ psi'}},
  {id:'pressure-60000',label:{en:'60,000 psi',ar:'٦٠٬٠٠٠ psi'}},
 ]},
 family:{label:{en:'Accessory type',ar:'نوع الملحق'},options:[
  {id:'family-shut-off',label:{en:'Shut-off valve',ar:'صمام غلق'}},{id:'family-needle',label:{en:'Needle / multiport valve',ar:'صمام إبرة / متعدد المنافذ'}},
  {id:'family-block-bleed',label:{en:'Block-and-bleed valve',ar:'صمام عزل وتنفيـس'}},{id:'family-manifold',label:{en:'Valve manifold',ar:'مجموعة صمامات'}},
  {id:'family-protection',label:{en:'Protective device',ar:'وسيلة حماية'}},
 ]},
};

const order=Object.keys(definitions) as TechnicalFacetId[];
const pressureOrder:TechnicalFacetId[]=['material','unit','size','caseMaterial','accuracy','connection','explosion','filling','principle','approval'];
const pressureVisible:Partial<Record<TechnicalFacetId,string[]>>={
 material:['material-stainless-steel','material-copper-alloy','material-special'],
 unit:['unit-bar','unit-psi','unit-mpa','unit-mbar'],
 connection:['connection-thread','connection-flange','connection-hygiene'],
};
const allowed=new Map(order.map(id=>[id,new Set(definitions[id].options.map(option=>option.id))]));
const parameter=(id:TechnicalFacetId)=>`f-${id}`;
const unique=(values:string[])=>[...new Set(values)];

export function parseTechnicalFilters(input:Record<string,string|string[]|undefined>):TechnicalFilters{
 const result:TechnicalFilters={};
 for(const id of order){
  const raw=input[parameter(id)],values=(Array.isArray(raw)?raw:raw===undefined?[]:[raw]).filter(value=>allowed.get(id)!.has(value));
  if(values.length)result[id]=unique(values);
 }
 return result;
}

export function technicalFilterParams(filters:TechnicalFilters):URLSearchParams{
 const params=new URLSearchParams();
 for(const id of order)for(const value of filters[id]??[])if(allowed.get(id)!.has(value))params.append(parameter(id),value);
 return params;
}

const add=(target:TechnicalFilters,id:TechnicalFacetId,value:string)=>{if(allowed.get(id)!.has(value))target[id]=unique([...(target[id]??[]),value]);};
const rows=(product:Product)=>product.details?.specifications??[];
const exactLabel=(label:string,allowedLabels:string[])=>allowedLabels.includes(label.trim().toLowerCase());

function addSizes(target:TechnicalFilters,value:string){
 const numbers=[...value.matchAll(/\b(\d{2,3})\b/g)].map(match=>Number(match[1]));
 if(numbers.some(number=>number<=40))add(target,'size','size-lte-40');
 for(const number of [50,63,80,100])if(numbers.includes(number))add(target,'size',`size-${number}`);
 if(numbers.some(number=>number>=160))add(target,'size','size-gte-160');
}
function addMaterials(target:TechnicalFilters,value:string){
 const lower=value.toLowerCase();
 if(lower.includes('stainless steel'))add(target,'material','material-stainless-steel');
 if(lower.includes('copper alloy'))add(target,'material','material-copper-alloy');
 if(lower.includes('brass'))add(target,'material','material-brass');
 if(lower.replaceAll('stainless steel','').match(/\bsteel\b/))add(target,'material','material-steel');
 if(/hastelloy|monel|ptfe|tantalum|nickel alloy|special material|gold(?:-plated| plated)?/.test(lower))add(target,'material','material-special');
}
function addPressureUnits(target:TechnicalFilters,value:string){
 const lower=value.toLowerCase();
 if(/\bbar\b/.test(lower))add(target,'unit','unit-bar');
 if(/\bmbar\b/.test(lower))add(target,'unit','unit-mbar');
 if(/\bpsi\b/.test(lower))add(target,'unit','unit-psi');
 if(/\bmpa\b/.test(lower))add(target,'unit','unit-mpa');
}
function addExplosion(target:TechnicalFilters,value:string){
 const lower=value.toLowerCase();
 if(/\biecex\b/.test(lower))add(target,'explosion','explosion-iecex');
 if(/\batex\b/.test(lower))add(target,'explosion','explosion-atex');
 if(/ex\s*ukraine/.test(lower))add(target,'explosion','explosion-ukraine');
 if(/\beac\s*ex\b/.test(lower))add(target,'explosion','explosion-eac');
 if(/\bukex\b/.test(lower))add(target,'explosion','explosion-ukex');
 if(/\becasex\b/.test(lower))add(target,'explosion','explosion-ecasex');
}
function addConnections(target:TechnicalFilters,value:string){
 const lower=value.toLowerCase();
 if(/thread|mounting thread|\bg\s*\d|\bnpt\b/.test(lower))add(target,'connection','connection-thread');
 if(/flange/.test(lower))add(target,'connection','connection-flange');
 if(/hygien|sanitary|tri-clamp|clamp connection/.test(lower))add(target,'connection','connection-hygiene');
 if(/compression/.test(lower))add(target,'connection','connection-compression');
 if(/surface mounting/.test(lower))add(target,'connection','connection-surface');
 if(/bayonet/.test(lower))add(target,'connection','connection-bayonet');
}

export function getProductTechnicalFacets(product:Product):TechnicalFilters{
 const result:TechnicalFilters={};
 for(const row of rows(product)){
  const label=row.label.en.trim().toLowerCase(),value=row.value.en;
  if(product.category==='pressure'){
   if(exactLabel(label,['nominal size']))addSizes(result,value);
   if(exactLabel(label,['scale range','measuring range','setting range']))addPressureUnits(result,value);
   if(exactLabel(label,['accuracy class'])){
    if(/\b(?:0[.,]1|0[.,]25)\b/.test(value))add(result,'accuracy','accuracy-highest');
    if(/\b0[.,]6\b/.test(value))add(result,'accuracy','accuracy-high');
    if(/\b(?:1(?:[.,]0)?|1[.,]6|2[.,]5|4(?:[.,]0)?)\b/.test(value))add(result,'accuracy','accuracy-standard');
   }
   if(exactLabel(label,['material of wetted parts','wetted parts','measuring element material']))addMaterials(result,value);
   if(exactLabel(label,['case material','case'])){
    const lower=value.toLowerCase();
    if(/stainless steel/.test(lower))add(result,'caseMaterial','case-stainless-steel');
    if(lower.replaceAll('stainless steel','').match(/\bsteel\b/))add(result,'caseMaterial','case-steel');
    if(/plastic|polyamide|abs\b/.test(lower))add(result,'caseMaterial','case-plastic');
   }
   if(exactLabel(label,['connector type','process connection','connection']))addConnections(result,value);
   if(exactLabel(label,['ignition protection type']))addExplosion(result,value);
   if(exactLabel(label,['case filling','filling'])){
    const lower=value.toLowerCase();
    if(/without|unfilled|dry case|not filled/.test(lower))add(result,'filling','filling-unfilled');
    if(!/without|unfilled|not filled/.test(lower)&&/filled|filling|glycerine|glycerin|silicone oil/.test(lower))add(result,'filling','filling-filled');
   }
   if(exactLabel(label,['measuring principle','measuring element','measurement principle'])){
    const lower=value.toLowerCase();
    if(/bourdon/.test(lower))add(result,'principle','principle-bourdon');
    if(/diaphragm/.test(lower))add(result,'principle','principle-diaphragm');
    if(/capsule/.test(lower))add(result,'principle','principle-capsule');
   }
   if(exactLabel(label,['approvals','approval','certificates'])){
    const lower=value.toLowerCase();
    if(/\bsil\b/.test(lower))add(result,'approval','approval-sil');
    if(/\bdnv\b/.test(lower))add(result,'approval','approval-dnv');
    if(/flow\s*100/.test(lower))add(result,'approval','approval-flow-100');
   }
  }else if(product.category==='temperature'){
   if(exactLabel(label,['nominal size']))addSizes(result,value);
   if(exactLabel(label,['measuring range','scale range'])){
    if(/°\s*c\b/i.test(value))add(result,'unit','unit-celsius');
    if(/°\s*f\b/i.test(value))add(result,'unit','unit-fahrenheit');
   }
   if(exactLabel(label,['wetted parts','material']))addMaterials(result,value);
   if(exactLabel(label,['ignition protection type']))addExplosion(result,value);
   if(exactLabel(label,['process connection']))addConnections(result,value);
  }else if(product.category==='accessories'){
   if(exactLabel(label,['material']))addMaterials(result,value);
   if(exactLabel(label,['nominal pressure'])){
    const compact=value.replaceAll(',','');
    for(const amount of [6000,10000,15000,30000,60000])if(new RegExp(`\\b${amount}\\b`).test(compact))add(result,'pressure',`pressure-${amount}`);
   }
   if(exactLabel(label,['version','application'])){
    const lower=value.toLowerCase();
    if(/block-and-bleed|block and bleed/.test(lower))add(result,'family','family-block-bleed');
    else if(/needle|multiport/.test(lower))add(result,'family','family-needle');
    else if(/manifold|3-way and 5-way/.test(lower))add(result,'family','family-manifold');
    else if(/shut(?:ting)? off|shut-off/.test(lower))add(result,'family','family-shut-off');
    if(/protection|protective|snubber|syphon|cooling/.test(lower))add(result,'family','family-protection');
   }
  }
 }
 return result;
}

export function matchesTechnicalFilters(product:Product,filters:TechnicalFilters):boolean{
 const productFacets=getProductTechnicalFacets(product);
 return order.every(id=>{
  const selected=filters[id];if(!selected?.length)return true;
  const values=productFacets[id]??[];return selected.some(value=>values.includes(value));
 });
}

export function buildTechnicalFacetGroups(products:Product[],locale:Locale,category=''):TechnicalFacetGroup[]{
 const counts=new Map<string,number>();
 for(const product of products)for(const [id,values] of Object.entries(getProductTechnicalFacets(product)))for(const value of values??[]){
  const key=`${id}:${value}`;counts.set(key,(counts.get(key)??0)+1);
 }
 const groupOrder=category==='pressure'?pressureOrder:order;
 return groupOrder.flatMap(id=>{
  const visibleIds=category==='pressure'?pressureVisible[id]:undefined;
  const candidates=visibleIds?definitions[id].options.filter(option=>visibleIds.includes(option.id)):definitions[id].options;
  const options=candidates.flatMap(option=>{
   const count=counts.get(`${id}:${option.id}`)??0;
   return category==='pressure'||count?[{...option,label:{en:option.label.en,ar:option.label.ar},count}]:[];
  });
  return options.length?[{id,label:definitions[id].label,options}]:[];
 });
}

export function technicalFilterLabel(id:TechnicalFacetId,value:string,locale:Locale):string{
 return definitions[id].options.find(option=>option.id===value)?.label[locale]??value;
}

export function technicalFacetLabel(id:TechnicalFacetId,locale:Locale):string{return definitions[id].label[locale];}

export function technicalSelections(filters:TechnicalFilters,locale:Locale){
 return order.flatMap(id=>(filters[id]??[]).map(value=>({id,value,label:technicalFilterLabel(id,value,locale),facet:definitions[id].label[locale]})));
}

export function removeTechnicalFilter(filters:TechnicalFilters,id:TechnicalFacetId,value:string):TechnicalFilters{
 const next:TechnicalFilters={};
 for(const key of order){
  const values=(filters[key]??[]).filter(item=>!(key===id&&item===value));
  if(values.length)next[key]=values;
 }
 return next;
}

export function technicalAdvisorHiddenFields({query,category,instrumentType,application}:{query:string;category:string;instrumentType:string;application:string}){
 return ([['q',query],['category',category],['type',instrumentType],['application',application]] as const)
  .filter(([,value])=>value.length>0)
  .map(([name,value])=>({name,value}));
}
