import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,sep} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(readFileSync(new URL('./security/dependency-patches.json',import.meta.url),'utf8'));
const digest=value=>createHash('sha256').update(value).digest('hex');
for(const [name,expected] of Object.entries(manifest.versions)){
 const pkg=JSON.parse(readFileSync(resolve(root,'node_modules',name,'package.json'),'utf8'));
 if(pkg.version!==expected)throw new Error('Security patch requires review for '+name+' '+pkg.version);
}
// Validate the complete patch set before touching any file. Unknown upstream
// contents fail the installation/build instead of silently skipping protection.
const pending=[];
for(const patch of manifest.patches){
 const path=resolve(root,patch.path);
 if(!path.startsWith(resolve(root,'node_modules')+sep))throw new Error('Invalid security patch target');
 const original=readFileSync(path,'utf8'),checksum=digest(original);
 if(checksum===patch.after)continue;
 if(checksum!==patch.before)throw new Error('Security patch checksum mismatch: '+patch.path);
 let updated=patch.replacement??original;
 for(const {from,to} of patch.changes??[]){
  if(updated.split(from).length!==2)throw new Error('Security patch match mismatch: '+patch.path);
  updated=updated.replace(from,to);
 }
 if(digest(updated)!==patch.after)throw new Error('Security patch result mismatch: '+patch.path);
 pending.push({path,updated});
}
for(const {path,updated} of pending)writeFileSync(path,updated);
console.log('Verified dependency security patches ('+pending.length+' applied).');
