import {createHash} from 'node:crypto';
import {sql,type PostgresAdapter} from '@payloadcms/db-postgres';
import type {PayloadRequest} from 'payload';

/** Serialize one reset token inside the transaction Payload already owns.
 * A contending reset fails immediately, leaving the three-connection pool free.
 * The lock lasts through password update/session creation and releases on rollback.
 */
export async function lockStaffReset(req:PayloadRequest,token:unknown){
  if(typeof token!=='string'||!/^[a-f0-9]{40}$/.test(token))throw new Error('Password reset unavailable');
  const transactionID=await req.transactionID;
  const session=transactionID==null?undefined:req.payload.db.sessions?.[String(transactionID)]?.db as Pick<PostgresAdapter['drizzle'],'execute'>|undefined;
  if(!session||typeof session.execute!=='function')throw new Error('Password reset requires an active transaction');
  const lockKey=createHash('sha256').update(`staff-password-reset-v1:${token}`).digest().readBigInt64BE().toString();
  const result=await session.execute(sql`SELECT pg_try_advisory_xact_lock(${lockKey}::bigint) AS locked`);
  if(result.rows[0]?.locked!==true)throw new Error('Password reset already in progress');
}
