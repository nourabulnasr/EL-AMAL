import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {getPayload} from 'payload';
import config from '../src/payload.config.ts';
import {toPublicCatalogue} from '../src/lib/public-catalogue.ts';

// Run only against the isolated development database. No customer data is seeded.
if (process.env.CMS_DATABASE_CHECK !== 'development') {
  throw new Error('Set CMS_DATABASE_CHECK=development for this development-only check.');
}
const payload = await getPayload({config});
const created: Array<{collection:'staff'|'categories'|'products'|'skus';id:number}> = [];
const forbidden = (error: unknown) => error instanceof Error && 'status' in error && error.status === 403;
const suffix = randomBytes(8).toString('hex');
try {
  const owner = await payload.create({collection:'staff',overrideAccess:true,data:{
    email:`cms-check-${suffix}@example.invalid`,password:randomBytes(32).toString('hex'),role:'owner',
  }});
  created.push({collection:'staff',id:owner.id});
  const user = {...owner,collection:'staff' as const};
  await assert.rejects(payload.create({collection:'staff',overrideAccess:false,data:{
    email:`anonymous-${suffix}@example.invalid`,password:randomBytes(32).toString('hex'),role:'owner',
  }}), error => error instanceof Error && 'status' in error && error.status === 403);
  await assert.rejects(payload.find({collection:'skus',overrideAccess:false}),
    error => error instanceof Error && 'status' in error && error.status === 403);
  const category=await payload.create({collection:'categories',overrideAccess:false,user,data:{
    key:`cms-check-${suffix}`,name:{en:'Temporary test',ar:'اختبار مؤقت'},
    description:{en:'Development check only',ar:'اختبار تطوير فقط'},
  }});
  created.push({collection:'categories',id:category.id});
  const product=await payload.create({collection:'products',overrideAccess:false,user,draft:true,data:{
    externalId:`cms-check-${suffix}`,model:'TEST-ONLY',category:category.id,
    name:{en:'Temporary test',ar:'اختبار مؤقت'},description:{en:'Not catalogue content',ar:'ليس منتجاً حقيقياً'},
    sourceRef:'automated development check',_status:'draft',
  }});
  created.push({collection:'products',id:product.id});
  // Exercise actual access enforcement against persisted users, not only callbacks.
  for(const role of ['catalogue-editor','sales','warehouse'] as const){
    const member=await payload.create({collection:'staff',overrideAccess:true,data:{
      email:`${role}-${suffix}@example.invalid`,password:randomBytes(32).toString('hex'),role,
    }});
    created.push({collection:'staff',id:member.id});
    const actor={...member,collection:'staff' as const};
    await assert.rejects(payload.update({collection:'staff',id:member.id,overrideAccess:false,user:actor,
      data:{role:'owner'}}),forbidden,`${role} must not promote itself`);
    const visibleStaff=await payload.find({collection:'staff',overrideAccess:false,user:actor});
    assert.deepEqual(visibleStaff.docs.map(doc=>doc.id),[member.id],`${role} can read only its staff profile`);
    await assert.rejects(async()=>{
      const sku=await payload.create({collection:'skus',overrideAccess:false,user:actor,
        data:{skuCode:`forbidden-${role}-${suffix}`,product:product.id,configuration:{}}});
      created.push({collection:'skus',id:sku.id});
    },forbidden,`${role} cannot create SKUs`);
    if(role==='catalogue-editor'){
      await payload.update({collection:'products',id:product.id,overrideAccess:false,user:actor,draft:true,
        data:{model:'TEST-ONLY'}});
      await assert.rejects(payload.update({collection:'products',id:product.id,overrideAccess:false,user:actor,
        data:{_status:'published',reviewedBy:owner.id,reviewedAt:new Date().toISOString(),rightsConfirmed:true}}),
        error=>error instanceof Error && error.message==='Only the owner can publish reviewed products.',
        'Editor cannot publish or forge owner review');
    }else{
      await assert.rejects(payload.update({collection:'products',id:product.id,overrideAccess:false,user:actor,
        data:{model:'FORBIDDEN'}}),forbidden,`${role} cannot edit catalogue products`);
    }
  }
  const anonymous=await payload.find({collection:'products',overrideAccess:false,where:{id:{equals:product.id}}});
  assert.equal(anonymous.totalDocs,0,'Anonymous users must not see draft products');
  const staff=await payload.find({collection:'products',overrideAccess:false,user,where:{id:{equals:product.id}}});
  assert.equal(staff.totalDocs,1,'Owner must be able to retrieve persisted draft');
  const published=await payload.update({collection:'products',id:product.id,overrideAccess:false,user,data:{
    _status:'published',reviewedBy:owner.id,reviewedAt:new Date().toISOString(),rightsConfirmed:true,instrumentType:'pressure-gauge',applications:['oil-gas'],datasheetUrl:'https://example.invalid/test.pdf',
  }});
  const readPublic=async()=>{
    const records=await payload.find({collection:'products',overrideAccess:true,draft:false,depth:0,
      where:{and:[{id:{equals:product.id}},{_status:{equals:'published'}}]}});
    return toPublicCatalogue(records.docs,[category]);
  };
  assert.equal((await readPublic()).products[0]?.datasheetUrl,'https://example.invalid/test.pdf');
  assert.deepEqual((await readPublic()).products[0]?.applications,['oil-gas']);
  assert.equal((await readPublic()).products[0]?.id,`cms-${published.id}`);
  await payload.update({collection:'products',id:product.id,overrideAccess:false,user,draft:true,
    data:{_status:'draft',name:{en:'Unpublished edit',ar:'تعديل غير منشور'}}});
  assert.equal((await readPublic()).products[0]?.name.en,'Temporary test','Draft edits must not replace public content');
  await payload.update({collection:'products',id:product.id,overrideAccess:false,user,data:{_status:'draft'}});
  assert.equal((await readPublic()).products.length,0,'Unpublished products must disappear');
  console.log('Public catalogue checks succeeded: publish, draft isolation, unpublish and explicit public projection.');
  console.log('Database checks succeeded: anonymous staff creation denied, private SKUs denied, draft persisted and hidden from public reads.');
  console.log('Role checks succeeded: editor/sales/warehouse cannot promote themselves, create SKUs, or publish; staff reads stay scoped.');
} finally {
  try {
    // Only delete exact IDs created by this invocation, in dependency order.
    for (const collection of ['skus','products','categories','staff'] as const) {
      for (const item of created.filter(item=>item.collection===collection).reverse()) {
        await payload.delete({...item,overrideAccess:true});
      }
    }
    console.log('Temporary database records removed.');
  } finally {
    assert.equal(Object.keys(payload.db.sessions ?? {}).length,0,'No test transaction may remain open');
    await payload.destroy();
  }
}
console.log('Database verification complete; temporary records removed and no open transactions.');
// Payload 3.90.2 retains its initial pool.connect() client for reconnect handling.
// pool.end() would wait indefinitely for it. Exit this standalone CLI only after
// awaited cleanup and transaction checks; the OS closes its remaining sockets.
process.exit(0);
