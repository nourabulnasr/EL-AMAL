import type {Locale,Product,Translated} from './catalogue.ts';

export type TechnicalFacetId='size'|'unit'|'accuracy'|'material'|'explosion'|'connection'|'pressure'|'family';
export type TechnicalFilters=Partial<Record<TechnicalFacetId,string[]>>;
export type TechnicalFacetOption={id:string;label:Translated;count:number};
export type TechnicalFacetGroup={id:TechnicalFacetId;label:Translated;options:TechnicalFacetOption[]};

const definitions:Record<TechnicalFacetId,{label:Translated;options:{id:string;label:Translated}[]}>= {
 size:{label:{en:'Nominal size',ar:'المقاس الاسمي'},options:[
  {id:'size-lte-40',label:{en:'≤ 40 mm',ar:'≤ ٤٠ مم'}},{id:'size-50',label:{en:'50 mm',ar:'٥٠ مم'}},
  {id:'size-63',label:{en:'63 mm',ar:'٦٣ مم'}},{id:'size-80',label:{en:'80 mm',ar:'٨٠ مم'}},
  {id:'size-100',label:{en:'100 mm',ar:'١٠٠ مم'}},{id:'size-gte-160',label:{en:'≥ 160 mm',ar:'≥ ١٦٠ مم'}},
 ]},
 unit:{label:{en:'Measuring unit',ar:'وحدة القياس'},options:[
  {id:'unit-bar',label:{en:'bar',ar:'بار'}},{id:'unit-mbar',label:{en:'mbar',ar:'مللي بار'}},
  {id:'unit-psi',label:{en:'psi',ar:'رطل/بوصة²'}},{id:'unit-mpa',label:{en:'MPa',ar:'ميجا باسكال'}},
  {id:'unit-celsius',label:{en:'°C',ar:'°م'}},{id:'unit-fahrenheit',label:{en:'°F',ar:'°ف'}},
 ]},
 accuracy:{label:{en:'Indication accuracy',ar:'دقة الإشارة'},options:[
  {id:'accuracy-1',label:{en:'Class 1.0',ar:'الفئة ١٫٠'}},{id:'accuracy-1-6',label:{en:'Class 1.6',ar:'الفئة ١٫٦'}},
  {id:'accuracy-2-5',label:{en:'Class 2.5',ar:'الفئة ٢٫٥'}},{id:'accuracy-4',label:{en:'Class 4.0',ar:'الفئة ٤٫٠'}},
 ]},
 material:{label:{en:'Material',ar:'الخامة'},options:[
  {id:'material-stainless-steel',label:{en:'Stainless steel',ar:'ستانلس ستيل'}},
  {id:'material-copper-alloy',label:{en:'Copper alloy',ar:'سبيكة نحاس'}},
  {id:'material-brass',label:{en:'Brass',ar:'نحاس أصفر'}},{id:'material-steel',label:{en:'Steel',ar:'فولاذ'}},
 ]},
 explosion:{label:{en:'Explosion protection',ar:'الحماية من الانفجار'},options:[
  {id:'explosion-ex-ia',label:{en:'Ex ia',ar:'Ex ia'}},{id:'explosion-ex-d',label:{en:'Ex d',ar:'Ex d'}},
 ]},
 connection:{label:{en:'Process connection',ar:'وصلة العملية'},options:[
  {id:'connection-thread',label:{en:'Thread',ar:'سن لولبي'}},{id:'connection-flange',label:{en:'Flange',ar:'فلانشة'}},
  {id:'connection-compression',label:{en:'Compression fitting',ar:'وصلة ضغط'}},{id:'connection-surface',label:{en:'Surface mounting',ar:'تركيب سطحي'}},
  {id:'connection-bayonet',label:{en:'Bayonet',ar:'بايونيت'}},
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
 if(/\bex\s*ia\b/.test(lower))add(target,'explosion','explosion-ex-ia');
 if(/\bex\s*d\b/.test(lower))add(target,'explosion','explosion-ex-d');
}

export function getProductTechnicalFacets(product:Product):TechnicalFilters{
 const result:TechnicalFilters={};
 for(const row of rows(product)){
  const label=row.label.en.trim().toLowerCase(),value=row.value.en;
  if(product.category==='pressure'){
   if(exactLabel(label,['nominal size']))addSizes(result,value);
   if(exactLabel(label,['scale range','measuring range','setting range']))addPressureUnits(result,value);
   if(exactLabel(label,['accuracy class'])){
    for(const [pattern,id] of [[/\b1[.,]0\b/,'accuracy-1'],[/\b1[.,]6\b/,'accuracy-1-6'],[/\b2[.,]5\b/,'accuracy-2-5'],[/\b4[.,]0\b/,'accuracy-4']] as const)if(pattern.test(value))add(result,'accuracy',id);
   }
   if(exactLabel(label,['material','wetted parts']))addMaterials(result,value);
   if(exactLabel(label,['ignition protection type']))addExplosion(result,value);
  }else if(product.category==='temperature'){
   if(exactLabel(label,['nominal size']))addSizes(result,value);
   if(exactLabel(label,['measuring range','scale range'])){
    if(/°\s*c\b/i.test(value))add(result,'unit','unit-celsius');
    if(/°\s*f\b/i.test(value))add(result,'unit','unit-fahrenheit');
   }
   if(exactLabel(label,['wetted parts','material']))addMaterials(result,value);
   if(exactLabel(label,['ignition protection type']))addExplosion(result,value);
   if(exactLabel(label,['process connection'])){
    const lower=value.toLowerCase();
    if(/thread|mounting thread/.test(lower))add(result,'connection','connection-thread');
    if(/flange/.test(lower))add(result,'connection','connection-flange');
    if(/compression/.test(lower))add(result,'connection','connection-compression');
    if(/surface mounting/.test(lower))add(result,'connection','connection-surface');
    if(/bayonet/.test(lower))add(result,'connection','connection-bayonet');
   }
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

export function buildTechnicalFacetGroups(products:Product[],locale:Locale):TechnicalFacetGroup[]{
 const counts=new Map<string,number>();
 for(const product of products)for(const [id,values] of Object.entries(getProductTechnicalFacets(product)))for(const value of values??[]){
  const key=`${id}:${value}`;counts.set(key,(counts.get(key)??0)+1);
 }
 return order.flatMap(id=>{
  const options=definitions[id].options.flatMap(option=>{
   const count=counts.get(`${id}:${option.id}`)??0;
   return count?[{...option,label:{en:option.label.en,ar:option.label.ar},count}]:[];
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
