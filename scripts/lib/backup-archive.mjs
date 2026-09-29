import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {createReadStream,createWriteStream} from 'node:fs';
import {open,appendFile,stat,unlink} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';

const magic=Buffer.from('EABK1');
export function backupKey(value){
  const key=Buffer.from(value||'','base64');
  if(key.length!==32||key.toString('base64')!==value)throw new Error('BACKUP_ENCRYPTION_KEY must be a canonical base64-encoded random 32-byte key.');
  return key;
}
export function directDatabase(value){
  const url=new URL(value||'');
  if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||!url.pathname.slice(1))throw new Error('A direct PostgreSQL database URL is required.');
  if(url.hostname.includes('-pooler.'))throw new Error('Backup and restore require an unpooled connection.');
  return url;
}
export const hostIdentity=url=>createHash('sha256').update(url.hostname.toLowerCase()).digest('hex');
export function restoreDestination(value,allowedHost,sourceHostIdentity){
  const url=directDatabase(value);
  if(!allowedHost||url.hostname!==allowedHost||hostIdentity(url)===sourceHostIdentity)throw new Error('Restore rehearsal requires an explicitly allowed development host, different from the source host.');
  return url;
}
export function postgresEnvironment(url){
  // Inherited PGHOSTADDR/PGSERVICE can silently override the validated host.
  const inherited=Object.fromEntries(Object.entries(process.env).filter(([key])=>!key.toUpperCase().startsWith('PG')));
  return {...inherited,PGHOST:url.hostname,PGPORT:url.port||'5432',PGDATABASE:decodeURIComponent(url.pathname.slice(1)),PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password),PGSSLMODE:url.searchParams.get('sslmode')||'require',PGCONNECT_TIMEOUT:'20',PGOPTIONS:'-c timezone=UTC -c statement_timeout=300000 -c lock_timeout=10000'};
}
export async function fileDigest(path){
  const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');
}
export async function encryptStream(input,path,key){
  const nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);cipher.setAAD(magic);
  // Exclusive creation prevents accidental replacement of a previous backup.
  const handle=await open(path,'wx',0o600);await handle.write(Buffer.concat([magic,nonce]));await handle.close();
  try{await pipeline(input,cipher,createWriteStream(path,{flags:'a',mode:0o600}));await appendFile(path,cipher.getAuthTag());}
  catch(error){await unlink(path).catch(()=>{});throw error;}
}
export async function decryptArchive(path,target,key){
  const size=(await stat(path)).size;if(size<33)throw new Error('Invalid encrypted archive.');
  const source=await open(path,'r');const header=Buffer.alloc(17),tag=Buffer.alloc(16);
  try{await source.read(header,0,17,0);await source.read(tag,0,16,size-16);}finally{await source.close();}
  if(!header.subarray(0,5).equals(magic))throw new Error('Unsupported encrypted archive.');
  const decipher=createDecipheriv('aes-256-gcm',key,header.subarray(5));decipher.setAAD(magic);decipher.setAuthTag(tag);
  // Never feed unauthenticated plaintext to pg_restore. Verify the complete file first.
  const handle=await open(target,'wx',0o600);await handle.close();
  try{await pipeline(createReadStream(path,{start:17,end:size-17}),decipher,createWriteStream(target,{flags:'a',mode:0o600}));}
  catch{await unlink(target).catch(()=>{});throw new Error('Backup authentication failed; plaintext discarded.');}
}
