import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import type {Payload} from 'payload';
import {claimDeliveryLease,completeDeliveryLease,maintainDeliveryData} from '../src/lib/delivery-store.ts';
import {assertQueueCapacity,QueueCapacityError} from '../src/lib/queue-capacity.ts';
import {deliverNextNotification} from '../src/lib/notification-worker.ts';

if(process.env.CMS_DATABASE_CHECK!=='development')throw new Error('Development database only');
// All mutations use a unique schema cloned from the migrated development structure.
const schema=`delivery_test_${randomUUID().replaceAll('-','')}`;
const connectionString=process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL;
const control=new Pool({connectionString,max:1,connectionTimeoutMillis:10000});
const pool=new Pool({connectionString,max:3,connectionTimeoutMillis:10000,options:`-c search_path=${schema},public -c statement_timeout=10000`});
const payload={db:{pool}} as unknown as Payload;
const tables=['delivery_operations','enquiries','verification_emails','notifications','enquiry_verifications','request_limits'];
let created=false;
try{
 await control.query(`CREATE SCHEMA ${schema}`);created=true;
 for(const table of tables){
  await control.query(`CREATE TABLE ${schema}.${table}(LIKE public.${table} INCLUDING ALL)`);
  await control.query(`CREATE SEQUENCE ${schema}.${table}_test_ids`);
  await control.query(`ALTER TABLE ${schema}.${table} ALTER COLUMN id SET DEFAULT nextval('${schema}.${table}_test_ids')`);
 }
 const leases=await Promise.all([claimDeliveryLease(payload),claimDeliveryLease(payload)]);
 assert.equal(leases.filter(Boolean).length,1,'Overlapping scheduler calls have one lease');
 const lease=leases.find(Boolean)!;
 assert.equal(await completeDeliveryLease(payload,'delivery','obsolete',{outcome:'complete',processed:8,accepted:8,failures:0}),false);
 assert.equal(await completeDeliveryLease(payload,'delivery',lease,{outcome:'complete',processed:0,accepted:0,failures:0}),true);
 let row=(await pool.query('SELECT * FROM delivery_operations')).rows[0];
 assert.ok(row.last_success_at);assert.equal(row.lease_token,null);
 const next=await claimDeliveryLease(payload);assert.ok(next);
 await pool.query("UPDATE delivery_operations SET lease_expires_at=now()-interval '1 second'");
 const recovered=await claimDeliveryLease(payload);assert.ok(recovered);assert.notEqual(recovered,next);
 assert.equal(await completeDeliveryLease(payload,'delivery',next!,{outcome:'complete',processed:0,accepted:0,failures:0}),false);
 await completeDeliveryLease(payload,'delivery',recovered!,{outcome:'degraded',processed:1,accepted:0,failures:1});
 row=(await pool.query('SELECT * FROM delivery_operations')).rows[0];
 assert.equal(row.last_outcome,'degraded');assert.equal(Number(row.failures),1);
 const beforeMaintenance=Number(new Date(row.last_success_at));
 const maintenanceLease=await claimDeliveryLease(payload);assert.ok(maintenanceLease);
 assert.equal(await completeDeliveryLease(payload,'delivery',maintenanceLease,{outcome:'maintenance',processed:0,accepted:0,failures:0}),true);
 row=(await pool.query('SELECT * FROM delivery_operations')).rows[0];
 assert.equal(row.last_outcome,'maintenance');assert.equal(Number(new Date(row.last_success_at)),beforeMaintenance,'Maintenance must never advance mail health');
 const maintenanceOnly=await claimDeliveryLease(payload,'maintenance-fixture');assert.ok(maintenanceOnly);
 assert.equal(await completeDeliveryLease(payload,'maintenance-fixture',maintenanceOnly,{outcome:'maintenance',processed:0,accepted:0,failures:0}),true);
 assert.equal((await pool.query("SELECT last_success_at FROM delivery_operations WHERE key='maintenance-fixture'")).rows[0].last_success_at,null,'Maintenance cannot create initial mail health');

 await pool.query(`INSERT INTO enquiries(id,reference,request_key,fingerprint,locale,source,name,email,company)
  SELECT n,'EA-test-'||n,'request-'||n,'fingerprint','en','cms','Test','test@example.invalid','Disposable' FROM generate_series(1,105) n`);
 await pool.query(`INSERT INTO verification_emails(id,enquiry_id,reference,delivery_key,sealed_message,status,next_attempt_at,expires_at,issue_count,issuance_window_ends_at,last_issued_at)
  SELECT n,n,'EA-test-'||n,'verification-'||n,'disposable-envelope','pending',now(),now()-interval '1 minute',1,now()+interval '1 day',now() FROM generate_series(1,4) n`);
 await pool.query("UPDATE verification_emails SET status='processing',lease_expires_at=now()+interval '5 minutes',lease_token='active-lease' WHERE id=2");
 await pool.query("UPDATE verification_emails SET expires_at=now()+interval '1 hour' WHERE id=3");
 await pool.query("UPDATE verification_emails SET status='sent' WHERE id=4");
 await pool.query(`INSERT INTO enquiry_verifications(id,enquiry_id,token_hash,expires_at) SELECT n,n,repeat(n::text,64),now()-interval '1 minute' FROM generate_series(1,4) n`);
 await pool.query("UPDATE enquiry_verifications SET expires_at=now()+interval '1 hour' WHERE id=3");
 await pool.query("INSERT INTO request_limits(key,hits,window_ends_at) VALUES('renewing',6,now()-interval '2 days'),('expired',6,now()-interval '2 days'),('active',6,now()+interval '1 day')");
 const held=await pool.connect();
 try{
  await held.query('BEGIN');
  await held.query("UPDATE request_limits SET window_ends_at=now()+interval '1 day' WHERE key='renewing'");
  await maintainDeliveryData(payload);
  await held.query('COMMIT');
 }finally{await held.query('ROLLBACK');held.release();}
 const retained=await pool.query('SELECT key FROM request_limits');
 assert.deepEqual(retained.rows.map(r=>r.key).sort(),['active','renewing']);
 const qs=(await pool.query('SELECT * FROM verification_emails ORDER BY id')).rows;
 assert.equal(qs[0].status,'cancelled');assert.equal(qs[0].sealed_message,null);
 assert.equal(qs[1].status,'processing');assert.equal(qs[1].sealed_message,'disposable-envelope');
 assert.equal(qs[2].sealed_message,'disposable-envelope');assert.equal(qs[3].sealed_message,null);
 const hashes=(await pool.query('SELECT token_hash FROM enquiry_verifications ORDER BY id')).rows.map(r=>r.token_hash);
 assert.deepEqual(hashes,['expired:1','2'.repeat(64),'3'.repeat(64),'expired:4']);

 await pool.query("INSERT INTO notifications(id,enquiry_id,reference,delivery_key,recipient,source,status,next_attempt_at) SELECT n,n,'EA-test-'||n,'delivery-'||n,'staff@example.invalid','cms','pending',now() FROM generate_series(1,100) n");
 const admission=await pool.connect(),contender=await pool.connect();
 try{
  await admission.query('BEGIN');
  await assert.rejects(assertQueueCapacity(sql=>admission.query(sql)),QueueCapacityError);
  await admission.query('DELETE FROM notifications WHERE id=100');
  await assertQueueCapacity(sql=>admission.query(sql));
  await contender.query('BEGIN');
  await contender.query("SET LOCAL lock_timeout='200ms'");
  await assert.rejects(assertQueueCapacity(sql=>contender.query(sql)),error=>(error as {code?:string}).code==='55P03');
  await contender.query('ROLLBACK');
  await admission.query('COMMIT');
  await contender.query('BEGIN');
  await assertQueueCapacity(sql=>contender.query(sql));
  await contender.query('COMMIT');
 }finally{await admission.query('ROLLBACK');await contender.query('ROLLBACK');admission.release();contender.release();}
 await pool.query('DELETE FROM notifications');

 await pool.query("INSERT INTO notifications(id,enquiry_id,reference,delivery_key,recipient,source,status,next_attempt_at,created_at) SELECT n,n,'EA-test-'||n,'delivery-'||n,'staff@example.invalid','cms','pending',now(),CASE WHEN n=4 THEN now()-interval '24 hours' ELSE now() END FROM generate_series(1,4) n");
 await pool.query("UPDATE enquiries SET source='demo',verification_status='test-verified',verified_at=now() WHERE id=2");
 await pool.query("UPDATE enquiries SET verification_status='verified',verified_at=now() WHERE id IN (3,4)");
 const delivered:string[]=[];
 const transport={send:async(message:{idempotencyKey:string})=>{delivered.push(message.idempotencyKey);return{id:'fake-provider-receipt'};}};
 assert.equal((await deliverNextNotification(payload,transport)).outcome,'sent');
 assert.equal((await deliverNextNotification(payload,transport)).outcome,'empty');
 assert.deepEqual(delivered,['delivery-3']);
 assert.equal((await pool.query('SELECT status FROM notifications WHERE id=4')).rows[0].status,'failed');
 console.log('Delivery operations checks succeeded: overlap, stale lease rejection, recovery, durable health, bounded retention, active lease/hash preservation, renewal-safe cleanup, capacity serialization, verified-CMS gating and 23-hour cutoff. Fake transport only.');
}finally{
 await pool.end();
 if(created)await control.query(`DROP SCHEMA ${schema} CASCADE`);
 await control.end();
}
console.log('Isolated development test schema removed.');
