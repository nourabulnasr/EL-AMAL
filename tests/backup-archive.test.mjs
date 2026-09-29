import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {mkdtemp,readFile,writeFile,unlink,rmdir,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {backupKey,directDatabase,hostIdentity,restoreDestination,postgresEnvironment,encryptStream,decryptArchive} from '../scripts/lib/backup-archive.mjs';

test('backup roundtrip authenticates the entire archive and refuses overwritten files',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'elamal-backup-test-')),archive=join(directory,'data.enc'),output=join(directory,'restored'),key=randomBytes(32),data=randomBytes(256*1024);
  try{
    await encryptStream(Readable.from([data]),archive,key);
    assert.notDeepEqual(await readFile(archive),data);
    await assert.rejects(encryptStream(Readable.from(['replacement']),archive,key),{code:'EEXIST'});
    await decryptArchive(archive,output,key);assert.deepEqual(await readFile(output),data);await unlink(output);
    const corrupt=await readFile(archive);corrupt[40]^=1;await writeFile(archive,corrupt);
    await assert.rejects(decryptArchive(archive,output,key),/authentication failed/);
    await assert.rejects(stat(output),{code:'ENOENT'});
  }finally{await unlink(archive).catch(()=>{});await unlink(output).catch(()=>{});await rmdir(directory);}
});
test('restore requires a distinct explicitly allowed direct development host',()=>{
  const source=directDatabase('postgresql://user:secret@source.example/app');
  const identity=hostIdentity(source);
  assert.throws(()=>restoreDestination(source.href,'source.example',identity),/different from/);
  assert.throws(()=>restoreDestination('postgresql://user:secret@dev.example/app','other.example',identity),/explicitly allowed/);
  assert.throws(()=>directDatabase('postgresql://user:secret@dev-pooler.example/app'),/unpooled/);
  assert.equal(restoreDestination('postgresql://user:secret@dev.example/app','dev.example',identity).hostname,'dev.example');
  assert.throws(()=>backupKey('short'),/32-byte/);
  assert.equal(backupKey(randomBytes(32).toString('base64')).length,32);
});
test('native PostgreSQL tools cannot inherit a different service or host address',()=>{
  const old=process.env.PGHOSTADDR;process.env.PGHOSTADDR='another-host';
  try{const env=postgresEnvironment(directDatabase('postgresql://user:secret@dev.example/app'));assert.equal(env.PGHOSTADDR,undefined);assert.equal(env.PGHOST,'dev.example');assert.equal(env.PGDATABASE,'app');}
  finally{if(old===undefined)delete process.env.PGHOSTADDR;else process.env.PGHOSTADDR=old;}
});
