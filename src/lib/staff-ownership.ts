import {createHash} from 'node:crypto';
import {sql,type PostgresAdapter} from '@payloadcms/db-postgres';
import {APIError,type CollectionBeforeChangeHook} from 'payload';

const roleLock=createHash('sha256').update('el-amal-staff-ownership-v1').digest().readBigInt64BE().toString();

/** Keep at least one owner through the commit, including concurrent demotions.
 * Read database state after acquiring the lock: originalDoc can already be stale.
 * Individual updates are required because a bulk request can run several hooks
 * concurrently inside the same transaction, where advisory locks are reentrant.
 */
export const protectStaffOwnership:CollectionBeforeChangeHook=async({operation,data,originalDoc,req})=>{
  if(operation!=='update'||data.role===undefined)return data;
  const transactionID=await req.transactionID;
  const session=transactionID==null?undefined:req.payload.db.sessions?.[String(transactionID)]?.db as Pick<PostgresAdapter['drizzle'],'execute'>|undefined;
  if(!session)throw new APIError('Staff role changes require a database transaction.',409);
  const locked=await session.execute(sql`SELECT pg_try_advisory_xact_lock(${roleLock}::bigint) AS locked`);
  if(locked.rows[0]?.locked!==true)throw new APIError('Another staff role change is in progress. Reload and try again.',409);
  // Unqualified table names deliberately use the adapter's schema/search_path,
  // including the isolated schemas used by our database regressions.
  const result=await session.execute(sql`
    SELECT role, (SELECT count(*)::int FROM staff WHERE role='owner') AS owners
    FROM staff WHERE id=${originalDoc.id}
  `);
  const current=result.rows[0];
  if(!current)throw new APIError('Staff account unavailable. Reload and try again.',409);
  if(current.role==='owner'&&data.role!=='owner'&&Number(current.owners)<=1){
    throw new APIError('Keep at least one owner. Appoint another owner before changing this account\'s role.',409);
  }
  return data;
};
