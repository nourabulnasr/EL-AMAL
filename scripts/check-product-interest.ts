import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {sql} from '@payloadcms/db-postgres';
import {isolatedPayload} from './lib/isolated-payload.ts';
import {interestSchema} from '../src/lib/product-interest-schema.ts';
import {saveProductInterest,readProductInterest,removeExpiredProductInterest} from '../src/lib/product-interest-service.ts';
import {parseInterestQuery} from '../src/lib/product-interest.ts';

if(process.env.CMS_DATABASE_CHECK!=='development')throw new Error('Development database only');
const isolated=await isolatedPayload('product_interest_test');
const {payload}=isolated;
try{
  // Local development need not migrate its shared schema to exercise this feature.
  const exists=await payload.db.pool.query("SELECT to_regclass('product_interest') AS present");
  if(!exists.rows[0].present)await payload.db.drizzle.execute(sql.raw(interestSchema));
  const owner=await payload.create({collection:'staff',overrideAccess:true,data:{email:`${randomUUID()}@example.invalid`,password:randomUUID()+randomUUID(),role:'owner'}});
  await payload.create({collection:'staff',overrideAccess:true,data:{email:`${randomUUID()}@example.invalid`,password:randomUUID()+randomUUID(),role:'owner'}});
  const category=await payload.create({collection:'categories',overrideAccess:true,data:{key:'interest-test',name:{en:'Test',ar:'اختبار'},description:{en:'Test',ar:'اختبار'}}});
  const product=await payload.create({collection:'products',overrideAccess:true,user:owner,data:{externalId:randomUUID(),model:'Interest fixture',category:category.id,name:{en:'Test product',ar:'اختبار'},description:{en:'Test description',ar:'اختبار'},sourceRef:'Disposable fixture',reviewedBy:owner.id,reviewedAt:new Date().toISOString(),rightsConfirmed:true,_status:'published'}});
  const actor={id:owner.id,role:'owner',collection:'staff'};
  const secret='isolated-product-interest-test-secret-0123456789';
  const session={id:randomUUID(),issued:Date.now(),device:'mobile' as const};
  const productId=`cms-${product.id}`;
  const event={productId,locale:'en' as const,list:'catalogue' as const};
  const filters=parseInterestQuery(new URLSearchParams());
  await saveProductInterest(payload,session,[{...event,kind:'selection'}],secret);
  let report=await readProductInterest(payload,actor,filters,true);
  assert.equal(report.rows[0].impressions,0);assert.equal(report.rows[0].selections,0);assert.equal(report.rows[0].ctr,null,'Fast clicks must not create impressions');
  await Promise.all(Array.from({length:5},()=>saveProductInterest(payload,session,[{...event,kind:'impression'},{...event,kind:'selection'}],secret)));
  await saveProductInterest(payload,session,[{...event,list:'search',kind:'impression'},{...event,list:'search',kind:'selection'},{...event,list:'detail',kind:'view'},{...event,list:'detail',kind:'basket'}],secret);
  await saveProductInterest(payload,{...session,id:randomUUID()},[{...event,kind:'impression'}],secret);
  report=await readProductInterest(payload,actor,filters,true);
  assert.deepEqual(report.rows[0],{productId,model:'Interest fixture',impressions:2,selections:1,views:1,basketAdds:1,datasheets:0,ctr:50,smallSample:true});
  assert.equal((await readProductInterest(payload,actor,{...filters,list:'search'},true)).rows[0].impressions,1);
  assert.equal((await readProductInterest(payload,actor,{...filters,locale:'ar'},true)).rows.length,0);
  assert.equal((await readProductInterest(payload,actor,{...filters,device:'desktop'},true)).rows.length,0);
  assert.doesNotMatch(JSON.stringify(report),/sessionHash|session_hash|@example|Disposable fixture|issued|expiresAt/);
  await assert.rejects(saveProductInterest(payload,session,[{...event,productId:'cms-2147483647',kind:'impression'}],secret));
  await payload.update({collection:'products',id:product.id,overrideAccess:true,data:{_status:'draft'}});
  await assert.rejects(saveProductInterest(payload,session,[{...event,kind:'impression'}],secret));
  for(const role of ['warehouse','catalogue-editor'])await assert.rejects(readProductInterest(payload,{...actor,role},filters,true),{status:403});
  await payload.update({collection:'staff',id:owner.id,overrideAccess:true,data:{role:'sales'}});
  assert.equal((await readProductInterest(payload,actor,filters,true)).rows.length,1);
  await payload.update({collection:'staff',id:owner.id,overrideAccess:true,data:{role:'warehouse'}});
  await assert.rejects(readProductInterest(payload,actor,filters,true),{status:403});
  // Retention must be enforced by reads even if no visitor has triggered cleanup.
  await payload.db.pool.query("UPDATE product_interest SET expires_at=now()-interval '1 second'");
  await payload.update({collection:'staff',id:owner.id,overrideAccess:true,data:{role:'owner'}});
  assert.equal((await readProductInterest(payload,actor,filters,true)).rows.length,0);
  await removeExpiredProductInterest(payload);
  assert.equal((await payload.db.pool.query('SELECT count(*)::integer AS count FROM product_interest')).rows[0].count,0);
  console.log('Product interest integration: concurrent deduplication, paired CTR, filter alignment, published-only intake, role revocation, privacy and retention succeeded.');
}finally{await isolated.close();}
process.exit(0);
