import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import {buildConfig,getPayload,type Payload} from 'payload';
import {postgresAdapter} from '@payloadcms/db-postgres';
import config from '../../src/payload.config.ts';

/** Development-only empty schema clone. No application query writes public tables. */
export async function isolatedPayload(prefix:string){
  if(process.env.CMS_DATABASE_CHECK!=='development')throw new Error('Development database only');
  if(!/^[a-z][a-z0-9_]{0,30}$/.test(prefix))throw new Error('Invalid isolated schema prefix');
  const schema=`${prefix}_${randomUUID().replaceAll('-','')}`;
  const connectionString=process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL;
  const control=new Pool({connectionString,max:1,connectionTimeoutMillis:15000});
  const quote=(value:string)=>`"${value.replaceAll('"','""')}"`;
  let created=false,payload:Payload|undefined;
  async function close(){
    try{if(payload)await payload.destroy();}
    finally{try{if(created){await control.query(`DROP SCHEMA ${quote(schema)} CASCADE`);created=false;}}
      finally{await control.end();}}
  }
  try{
    await control.query(`CREATE SCHEMA ${quote(schema)}`);created=true;
    // Fetch metadata once and batch DDL; hundreds of sequential cloud round trips
    // make otherwise tiny regressions spend several minutes in setup.
    const tables=await control.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    const serials=await control.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND column_default LIKE 'nextval(%'");
    await control.query('SET search_path=pg_catalog');
    const keys=await control.query("SELECT c.conname,t.relname,pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND c.contype='f'");
    const statements=tables.rows.map(({table_name:table})=>`CREATE TABLE ${quote(schema)}.${quote(table)} (LIKE public.${quote(table)} INCLUDING ALL)`);
    for(const {table_name:table,column_name:column} of serials.rows){
      const sequence=`test_${table}_${column}_seq`;
      statements.push(`CREATE SEQUENCE ${quote(schema)}.${quote(sequence)}`);
      const sequenceLiteral=`${quote(schema)}.${quote(sequence)}`.replaceAll("'","''");
      statements.push(`ALTER TABLE ${quote(schema)}.${quote(table)} ALTER COLUMN ${quote(column)} SET DEFAULT nextval('${sequenceLiteral}')`);
    }
    for(const row of keys.rows)statements.push(`ALTER TABLE ${quote(schema)}.${quote(row.relname)} ADD CONSTRAINT ${quote(row.conname)} ${row.definition.replaceAll('public.',`${quote(schema)}.`)}`);
    await control.query(`BEGIN;${statements.join(';')};COMMIT`);
    const base=await config;
    const isolated=await buildConfig({secret:base.secret,db:postgresAdapter({schemaName:schema,pool:{connectionString,max:3,connectionTimeoutMillis:15000,options:`-c search_path=${schema},public -c statement_timeout=15000 -c lock_timeout=5000`},push:false})});
    payload=await getPayload({config:{...base,db:isolated.db}});
    return {payload,close};
  }catch(error){
    await control.query('ROLLBACK').catch(()=>{});
    await close();throw error;
  }
}
