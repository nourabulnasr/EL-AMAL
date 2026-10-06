import {createHash} from 'node:crypto';
import {sql,type PostgresAdapter} from '@payloadcms/db-postgres';
import {APIError,type Payload,type PayloadRequest} from 'payload';

const roleLock=createHash('sha256').update('el-amal-staff-ownership-v1').digest().readBigInt64BE().toString();

const explicitEdits=new WeakMap<object,{id:unknown;role:unknown}>();
const installed=new WeakSet<object>();

/** Capture submitted intent before Payload fills omitted fields from old data.
 * This marker is server-local; request JSON/context cannot manufacture it.
 */
export function recordStaffRoleEdit(req:PayloadRequest,args:{id?:unknown;data?:unknown}){
  explicitEdits.delete(req);
  if(args.data&&typeof args.data==='object'&&Object.hasOwn(args.data,'role')){
    explicitEdits.set(req,{id:args.id,role:(args.data as {role:unknown}).role});
  }
}

/** Auth/session operations write user snapshots directly to the adapter and
 * bypass collection hooks. Strip role from ALL staff updateOne data. Only an
 * explicit, access-checked collection edit may change it, via an atomic predicate
 * and update in that edit's transaction. This also protects parallel individual
 * edits sharing one transaction. Trusted SQL/create/delete are outside this gate.
 */
export function installStaffRoleGuard(payload:Payload){
  if(installed.has(payload.db))return;
  installed.add(payload.db);
  const updateOne=payload.db.updateOne.bind(payload.db);
  payload.db.updateOne=async args=>{
    if(args.collection!=='staff')return updateOne(args);
    const intent=args.req?explicitEdits.get(args.req):undefined;
    if(args.req)explicitEdits.delete(args.req);
    const data={...args.data};delete data.role;
    if(intent&&intent.id===args.id&&intent.role===args.data.role){
      const transactionID=await args.req?.transactionID;
      const session=transactionID==null?undefined:payload.db.sessions?.[String(transactionID)]?.db as Pick<PostgresAdapter['drizzle'],'execute'>|undefined;
      if(!session)throw new APIError('Staff role changes require a database transaction.',409);
      const locked=await session.execute(sql`SELECT pg_try_advisory_xact_lock(${roleLock}::bigint) AS locked`);
      if(locked.rows[0]?.locked!==true)throw new APIError('Another staff role change is in progress. Reload and try again.',409);
      // search_path selects the live or isolated schema. This write rolls back
      // together with the remainder of Payload's document update.
      const changed=await session.execute(sql`
        UPDATE staff SET role=${intent.role}
        WHERE id=${args.id} AND (role<>'owner' OR ${intent.role}='owner'
          OR (SELECT count(*) FROM staff WHERE role='owner')>1)
        RETURNING id
      `);
      if(changed.rows.length!==1)throw new APIError('Keep at least one owner. Appoint another owner before changing this account\'s role.',409);
    }
    return updateOne({...args,data});
  };
}
