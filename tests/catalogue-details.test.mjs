import {test} from 'node:test';
import assert from 'node:assert/strict';
import {toPublicCatalogue} from '../src/lib/public-catalogue.ts';
import {productSchema} from '../src/lib/product-schema.ts';
import {Products} from '../src/cms/collections.ts';
import {validateCatalogueDetails} from '../src/lib/catalogue-details.ts';
const text={en:'Pressure',ar:'ضغط'};
const category={id:1,key:'pressure',name:text,description:text};
const base={id:1,model:'P',category:1,name:text,description:text,_status:'published',sourceRef:'private',reviewedBy:1,reviewedAt:'2026-01-01',rightsConfirmed:true};
const details={manufacturer:'WIKA',image:{src:'/images/products/p.webp',width:600,height:800,alt:text,sourceUrl:'https://www.wika.com/p'},specifications:[{label:text,value:text}],availability:'in-stock',availabilityReportedAt:'2026-01-01',datasheets:[{title:'Data',url:'https://www.wika.com/data.pdf'}]};
const project=value=>toPublicCatalogue([{...base,catalogueDetails:value}],[category]).products[0];
test('projects reviewed catalogue details and removes unknown/private fields at every level',()=>{
 const result=project({...details,private:'SECRET',image:{...details.image,private:'SECRET'},specifications:[{label:{...text,private:'SECRET'},value:text,private:'SECRET'}],datasheets:[{...details.datasheets[0],private:'SECRET'}]});
 assert.deepEqual(result.details,details);
 assert.equal(JSON.stringify(result).includes('SECRET'),false);
 const schema=productSchema(result,'en','cms')['@graph'].find(x=>x['@type']==='Product');
 assert.equal(schema.manufacturer.name,'WIKA');assert.ok(schema.image.endsWith(details.image.src));assert.equal(schema.offers,undefined);
});
test('malformed legacy details are wholly omitted while base record remains usable',()=>{
 const invalid=[null,[],{}, {...details,availability:'available'}, {...details,availabilityReportedAt:'2099-01-01'}, {...details,availabilityReportedAt:'2026-02-30'}, {...details,availabilityReportedAt:'yesterday'}, {...details,manufacturer:'Other'}, {...details,specifications:[{label:{en:'P'},value:text}]}, {...details,specifications:Array(81).fill(details.specifications[0])}, {...details,datasheets:[{title:'Data',url:'javascript:alert(1)'}]}];
 for(const src of ['https://example.com/p.jpg','/images/products/../p.jpg','/images/products/%2e%2e/p.jpg','/images/products/p.svg','/images/products/p.jpg?x=1','/images/products/sub/p.jpg'])invalid.push({...details,image:{...details.image,src}});
 for(const width of [0,10001,1.5,'600'])invalid.push({...details,image:{...details.image,width}});
 invalid.push({...details,image:{...details.image,alt:{en:'',ar:'ضغط'}}});
 for(const value of invalid){assert.equal(project(value).details,undefined);assert.equal(project(value).model,'P');}
});
test('CMS field and change hook reject malformed writes and strip private keys in valid writes',()=>{
 const field=Products.fields.find(field=>field.name==='catalogueDetails');
 assert.equal(field.type,'json');assert.equal(field.validate(details),true);
 assert.equal(validateCatalogueDetails(undefined),true);assert.equal(validateCatalogueDetails(null),true);
 const hook=Products.hooks.beforeChange[0],context={req:{user:{id:1,role:'owner'}}};
 for(const invalid of [{...details,image:{...details.image,src:'https://private.example/a.jpg'}},{...details,specifications:[{label:text,value:{en:'P'}}]},{...details,image:{...details.image,alt:{en:'a'.repeat(301),ar:'صورة'}}},{...details,datasheets:Array(21).fill(details.datasheets[0])}]){
  assert.equal(typeof field.validate(invalid),'string');
  assert.throws(()=>hook({...context,data:{catalogueDetails:invalid}}));
 }
 assert.deepEqual(hook({...context,data:{catalogueDetails:{...details,private:'SECRET'}}}).catalogueDetails,details);
 assert.deepEqual(hook({...context,originalDoc:{catalogueDetails:details},data:{model:'New'}}).catalogueDetails,details);
 assert.equal(hook({...context,originalDoc:{catalogueDetails:details},data:{catalogueDetails:null}}).catalogueDetails,null);
});
