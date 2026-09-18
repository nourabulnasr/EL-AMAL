import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {getPayload} from 'payload';
import config from '../src/payload.config.ts';

// Run only against the isolated development database. No customer data is seeded.
if (process.env.CMS_DATABASE_CHECK !== 'development') {
  throw new Error('Set CMS_DATABASE_CHECK=development for this development-only check.');
}
const payload = await getPayload({config});
const created: Array<{collection:'staff'|'categories'|'products';id:number}> = [];
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
  const anonymous=await payload.find({collection:'products',overrideAccess:false,where:{id:{equals:product.id}}});
  assert.equal(anonymous.totalDocs,0,'Anonymous users must not see draft products');
  const staff=await payload.find({collection:'products',overrideAccess:false,user,where:{id:{equals:product.id}}});
  assert.equal(staff.totalDocs,1,'Owner must be able to retrieve persisted draft');
  console.log('Database checks succeeded: anonymous staff creation denied, private SKUs denied, draft persisted and hidden from public reads.');
} finally {
  try {
    // Only delete exact IDs created by this invocation, in dependency order.
    for (const item of created.reverse()) await payload.delete({...item,overrideAccess:true});
  } finally {
    await payload.destroy();
  }
}
