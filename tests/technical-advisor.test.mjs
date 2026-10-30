import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildTechnicalFacetGroups,removeTechnicalFilter,technicalAdvisorHiddenFields,technicalSelections} from '../src/lib/technical-facets.ts';

const groups=[{id:'size',label:{en:'Nominal size',ar:'المقاس الاسمي'},options:[
  {id:'size-63',label:{en:'63 mm',ar:'٦٣ مم'},count:4},
  {id:'size-100',label:{en:'100 mm',ar:'١٠٠ مم'},count:9},
]}];

test('advisor model exposes bilingual labels, counts and preserved catalogue fields',()=>{
 const item={id:'one',model:'P',category:'pressure',name:{en:'Gauge',ar:'عداد'},description:{en:'',ar:''},details:{specifications:[{label:{en:'Nominal size',ar:'المقاس الاسمي'},value:{en:'63, 100 mm',ar:'٦٣، ١٠٠ مم'}}]}};
 const group=buildTechnicalFacetGroups([item],'en','pressure').find(group=>group.id==='size');
 assert.equal(group.label.en,'Nominal size');assert.equal(group.label.ar,'المقاس الاسمي');
 assert.deepEqual(group.options.filter(option=>option.count).map(option=>[option.label.en,option.label.ar,option.count]),[['63 mm · 2½ in','٦٣ مم · ٢½ بوصة',1],['100 mm · 4 in','١٠٠ مم · ٤ بوصة',1]]);
 assert.deepEqual(technicalAdvisorHiddenFields({query:'gauge',category:'pressure',instrumentType:'pressure-gauge',application:'oil-gas'}),[
  {name:'q',value:'gauge'},{name:'category',value:'pressure'},{name:'type',value:'pressure-gauge'},{name:'application',value:'oil-gas'},
 ]);
 assert.deepEqual(technicalAdvisorHiddenFields({query:'',category:'temperature',instrumentType:'',application:''}),[{name:'category',value:'temperature'}]);
});

test('active technical selections have translated labels and can be removed without mutating the original',()=>{
 const selected={size:['size-63','size-100']};
 assert.deepEqual(technicalSelections(selected,'en').map(item=>item.label),['63 mm · 2½ in','100 mm · 4 in']);
 assert.deepEqual(removeTechnicalFilter(selected,'size','size-63'),{size:['size-100']});
 assert.deepEqual(selected,{size:['size-63','size-100']});
 assert.deepEqual(removeTechnicalFilter({size:['size-63']},'size','size-63'),{});
});
