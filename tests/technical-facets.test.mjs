import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTechnicalFacetGroups,
  getProductTechnicalFacets,
  matchesTechnicalFilters,
  parseTechnicalFilters,
  technicalFilterParams,
} from '../src/lib/technical-facets.ts';
import {searchProducts} from '../src/lib/catalogue.ts';
import {cataloguePath} from '../src/lib/seo-discovery.ts';

const translated=(value)=>({en:value,ar:value});
const product=(overrides={})=>({
  id:'cms-1',model:'TEST',category:'pressure',name:translated('Gauge'),description:translated('Reviewed product'),
  details:{manufacturer:'WIKA',image:{src:'/images/products/test.webp',width:600,height:800,alt:translated('Gauge'),sourceUrl:'https://www.wika.com/test'},availability:'in-stock',availabilityReportedAt:'2026-10-01',datasheets:[],specifications:[]},
  ...overrides,
});
const spec=(label,value)=>({label:translated(label),value:translated(value)});

test('technical query parsing keeps only allowlisted facet values and removes duplicates',()=>{
  assert.deepEqual(parseTechnicalFilters({
    'f-size':['size-100','size-100','<script>'],
    'f-unit':'unit-bar',
    'f-material':['material-stainless-steel','material-not-real'],
    'f-unknown':'anything',
  }),{
    size:['size-100'],
    unit:['unit-bar'],
    material:['material-stainless-steel'],
  });
});

test('pressure facets are derived only from reviewed specification rows',()=>{
  const reviewed=product({details:{...product().details,specifications:[
    spec('Nominal size','63, 100, 160 mm'),
    spec('Scale range','0 … 16 mbar to 0 … 40 bar'),
    spec('Accuracy class','1.0 (NS 100, 160), 1.6 (NS 63)'),
    spec('Material','Measuring element: Stainless steel 316L; Case: Aluminium'),
    spec('Ignition protection type','Ex ia or Ex d'),
  ]}});
  assert.deepEqual(getProductTechnicalFacets(reviewed),{
    size:['size-63','size-100','size-gte-160'],
    unit:['unit-bar','unit-mbar'],
    accuracy:['accuracy-1','accuracy-1-6'],
    material:['material-stainless-steel'],
    explosion:['explosion-ex-ia','explosion-ex-d'],
  });
  assert.deepEqual(getProductTechnicalFacets(product({details:{...product().details,specifications:[spec('Description','Stainless steel, 100 mm, Ex d')]}})),{});
});

test('temperature and accessory facets use their own category vocabulary',()=>{
  const temperature=product({category:'temperature',details:{...product().details,specifications:[
    spec('Measuring range','-196 … +600 °C, -320 … +1,112 °F'),
    spec('Process connection','Mounting thread, flange'),
    spec('Wetted parts','Copper alloy'),
  ]}});
  const accessory=product({category:'accessories',name:translated('Block-and-bleed valve'),details:{...product().details,specifications:[
    spec('Material','Brass, steel, stainless steel'),
    spec('Nominal pressure','To PN 420 (6,000 psi) Option: to PN 680 (10,000 psi)'),
    spec('Version','Block-and-bleed valve'),
  ]}});
  assert.deepEqual(getProductTechnicalFacets(temperature),{
    unit:['unit-celsius','unit-fahrenheit'],
    material:['material-copper-alloy'],
    connection:['connection-thread','connection-flange'],
  });
  assert.deepEqual(getProductTechnicalFacets(accessory),{
    material:['material-stainless-steel','material-brass','material-steel'],
    pressure:['pressure-6000','pressure-10000'],
    family:['family-block-bleed'],
  });
});

test('facet matching is OR within a facet and AND between facets',()=>{
  const candidate=product({details:{...product().details,specifications:[spec('Nominal size','63, 100 mm'),spec('Accuracy class','1.6')]}});
  assert.equal(matchesTechnicalFilters(candidate,{size:['size-50','size-100'],accuracy:['accuracy-1-6']}),true);
  assert.equal(matchesTechnicalFilters(candidate,{size:['size-50','size-100'],accuracy:['accuracy-1']}),false);
  assert.equal(matchesTechnicalFilters(candidate,{}),true);
  assert.equal(matchesTechnicalFilters(product(),{size:['size-100']}),false);
});

test('facet groups count only verified options in the current candidate set',()=>{
  const a=product({id:'a',details:{...product().details,specifications:[spec('Nominal size','63, 100 mm')]}});
  const b=product({id:'b',details:{...product().details,specifications:[spec('Nominal size','100, 160 mm')]}});
  const groups=buildTechnicalFacetGroups([a,b],'en');
  const size=groups.find(group=>group.id==='size');
  assert.deepEqual(size.options.map(option=>[option.id,option.count]),[['size-63',1],['size-100',2],['size-gte-160',1]]);
  assert.equal(groups.some(group=>group.id==='connection'),false);
});

test('catalogue search and URL serialization intersect technical facets with existing filters',()=>{
  const a=product({id:'a',model:'A',applications:['oil-gas'],details:{...product().details,specifications:[spec('Nominal size','100 mm')]}});
  const b=product({id:'b',model:'B',applications:['oil-gas'],details:{...product().details,specifications:[spec('Nominal size','63 mm')]}});
  const filters={size:['size-100']};
  assert.deepEqual(searchProducts([a,b],'','pressure','','oil-gas',filters).map(item=>item.id),['a']);
  assert.deepEqual([...technicalFilterParams(filters)],[['f-size','size-100']]);
  assert.equal(cataloguePath({category:'pressure',application:'oil-gas',technical:filters}),'/products?category=pressure&application=oil-gas&f-size=size-100');
});
