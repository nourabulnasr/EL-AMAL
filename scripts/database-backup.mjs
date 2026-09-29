import {Client} from 'pg';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {Readable} from 'node:stream';
import {mkdir,mkdtemp,readFile,unlink,rmdir,stat,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,dirname,basename} from 'node:path';
import {backupKey,directDatabase,hostIdentity,restoreDestination,postgresEnvironment,fileDigest,encryptStream,decryptArchive} from './lib/backup-archive.mjs';

const quote=value=>'"'+value.replaceAll('"','""')+'"';
const executable=name=>process.env.PG_BIN_DIR?join(process.env.PG_BIN_DIR,name+(process.platform==='win32'?'.exe':'')):name;
function command(name,args,url){
  const child=spawn(executable(name),args,{env:postgresEnvironment(url),stdio:['ignore','pipe','pipe'],windowsHide:true});
  let diagnostic='';child.stderr.on('data',chunk=>{if(diagnostic.length<8000)diagnostic+=chunk.toString();});
  // COPY/constraint diagnostics can contain private row contents. Only classify
  // known operational failures; do not print arbitrary provider stderr.
  const safeDiagnostic=()=>diagnostic.includes('server version mismatch')?'The PostgreSQL tools must match or exceed the server major version.':diagnostic.includes('already exists')?'An object already exists in the disposable restore database.':diagnostic.includes('permission denied')?'The database role lacks a required permission.':'Check connectivity, tool compatibility and the private restore configuration.';
  const done=new Promise((ok,fail)=>{child.once('error',()=>fail(new Error(`${name} could not start. Check PG_BIN_DIR.`)));child.once('close',code=>code===0?ok():fail(new Error(`${name} exited with status ${code}. ${safeDiagnostic()}`)));});
  done.catch(()=>{});return {child,done};
}
async function connect(url){const client=new Client({connectionString:url.href,connectionTimeoutMillis:20000});await client.connect();await client.query("SET timezone='UTC'");return client;}
async function fingerprint(client){
  const tables=await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
  const rows=[];
  for(const {tablename:name} of tables.rows){
    const result=await client.query(`SELECT count(*)::text AS count,md5(coalesce(string_agg(digest,'' ORDER BY digest),'')) AS digest FROM (SELECT md5(to_jsonb(t)::text) AS digest FROM public.${quote(name)} t) hashed`);
    rows.push({table:name,...result.rows[0]});
  }
  const constraints=await client.query("SELECT count(*)::text AS count FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public'");
  return {tables:rows,constraints:constraints.rows[0].count};
}
async function createBackup(path,key){
  const url=directDatabase(process.env.BACKUP_DATABASE_URL||process.env.DATABASE_URL_UNPOOLED);
  await mkdir(dirname(path),{recursive:true});
  const client=await connect(url);let manifestCreated=false,archiveCreated=false;
  try{
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const snapshot=(await client.query('SELECT pg_export_snapshot() AS snapshot')).rows[0].snapshot;
    const data=await fingerprint(client);
    const {child,done}=command('pg_dump',['--format=custom','--no-owner','--no-acl','--schema=public','--snapshot='+snapshot],url);
    try{await encryptStream(child.stdout,path,key);archiveCreated=true;await done;}catch(error){child.kill();await done.catch(()=>{});throw error;}
    await client.query('COMMIT');
    const manifest={version:1,createdAt:new Date().toISOString(),archive:basename(path),archiveSha256:await fileDigest(path),sourceHostIdentity:hostIdentity(url),...data};
    await encryptStream(Readable.from([JSON.stringify(manifest)]),path+'.manifest.enc',key);manifestCreated=true;
    console.log(JSON.stringify({backup:path,bytes:(await stat(path)).size,tables:data.tables.length,rows:data.tables.reduce((n,t)=>n+Number(t.count),0),encrypted:true}));
  }finally{await client.query('ROLLBACK').catch(()=>{});await client.end();if(!manifestCreated){if(archiveCreated)await unlink(path);console.error('Backup incomplete: both the archive and authenticated manifest are required.');}}
}
async function rehearse(path,key){
  const token=randomUUID().replaceAll('-',''),temporary=await mkdtemp(join(tmpdir(),'elamal-restore-')),plain=join(temporary,'archive.dump'),manifestPath=join(temporary,'manifest.json');
  let archiveCreated=false,manifestCreated=false,control,target,databaseCreated=false;
  const name='elamal_restore_'+token;let failure;
  try{
    await decryptArchive(path+'.manifest.enc',manifestPath,key);manifestCreated=true;
    const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
    if(manifest.version!==1||manifest.archive!==basename(path)||manifest.archiveSha256!==await fileDigest(path))throw new Error('Backup manifest does not match archive.');
    const development=restoreDestination(process.env.RESTORE_DATABASE_URL,process.env.RESTORE_ALLOWED_HOST,manifest.sourceHostIdentity);
    await decryptArchive(path,plain,key);archiveCreated=true;
    control=await connect(development);
    // A random new database is the only restore target. Existing databases are never cleared.
    await control.query(`CREATE DATABASE ${quote(name)}`);databaseCreated=true;
    const restoreURL=new URL(development);restoreURL.pathname='/'+name;
    const {child,done}=command('pg_restore',['--no-owner','--no-acl','--clean','--if-exists','--exit-on-error','--single-transaction','--dbname='+name,plain],restoreURL);child.stdout.resume();await done;
    target=await connect(restoreURL);const restored=await fingerprint(target);
    if(JSON.stringify(restored.tables)!==JSON.stringify(manifest.tables)||restored.constraints!==manifest.constraints)throw new Error('Restored rows or constraints differ from backup snapshot.');
    await target.end();target=undefined;
    await control.query(`DROP DATABASE ${quote(name)}`);databaseCreated=false;
    const result={verifiedAt:new Date().toISOString(),backup:basename(path),tables:restored.tables.length,rows:restored.tables.reduce((n,t)=>n+Number(t.count),0),rowFingerprintsMatch:true,constraintCountMatches:true,isolatedDatabaseRemoved:true};
    await writeFile(path+'.restore-'+token+'.json',JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(result));
  }catch(error){failure=error;throw error;}
  finally{
    const cleanupErrors=[];
    for(const cleanup of [
      async()=>{if(target)await target.end();},
      async()=>{if(databaseCreated&&control)await control.query(`DROP DATABASE ${quote(name)}`);},
      async()=>{if(control)await control.end();},
      async()=>{if(archiveCreated)await unlink(plain);},
      async()=>{if(manifestCreated)await unlink(manifestPath);},
      async()=>{await rmdir(temporary);},
    ])try{await cleanup();}catch{cleanupErrors.push(true);}
    if(cleanupErrors.length){console.error('Restore cleanup needs attention for the temporary directory/database recorded by this run.');if(!failure)throw new Error('Restore cleanup incomplete.');}
  }
}
try{
  const [action,file]=process.argv.slice(2);if(!['create','rehearse'].includes(action)||!file)throw new Error('Usage: node scripts/database-backup.mjs create|rehearse <backup.enc>');
  const path=resolve(file),key=backupKey(process.env.BACKUP_KEY_FILE?(await readFile(process.env.BACKUP_KEY_FILE,'utf8')).trim():process.env.BACKUP_ENCRYPTION_KEY);
  if(action==='create')await createBackup(path,key);else await rehearse(path,key);
}catch(error){console.error(error instanceof Error?error.message:'Backup operation failed.');process.exitCode=1;}
