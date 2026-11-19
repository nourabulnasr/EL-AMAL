import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {deliverNextNotification} from '../src/lib/notification-worker.ts';
import {verificationMessage} from '../src/lib/verification-message.ts';
const directory=resolve(process.argv[2]??'artifacts/email-preview');
await mkdir(directory,{recursive:true});
for(const locale of ['en','ar']){
 const message=verificationMessage({from:'enquiries@example.invalid',origin:'https://example.invalid',secret:'x'.repeat(40)},'customer@example.invalid',locale,'0'.repeat(64),'EA-PREVIEW',locale==='ar'?'أحمد حسن':'Ahmed Hassan');
 await writeFile(resolve(directory,`customer-${locale}.html`),message.html);
}
const reference='EA-PREVIEW';
const pool={query:async statement=>{
 if(statement.includes('RETURNING id,reference,recipient'))return {rows:[{id:1,enquiry_id:1,reference,recipient:'owner@example.invalid',delivery_key:'enquiry-v2-'+reference}],rowCount:1};
 if(statement.startsWith('SELECT model'))return {rows:[
  {name_en:'Pressure transmitter',model:'A-10',quantity:1,range:'0–10 bar'},
  {name_en:'Stainless steel pressure gauge',model:'232.50',quantity:2,range:'100 mm | 0–16 bar | G ½ B'},
 ]};
 if(statement.startsWith('SELECT name'))return {rows:[{name:'Ahmed Hassan',company:'Example Engineering',email:'customer@example.invalid',locale:'en',request_kind:'products'}]};
 return {rows:[],rowCount:1};
}};
await deliverNextNotification({db:{pool}},{send:async message=>{
 await writeFile(resolve(directory,'owner.html'),message.html);
 return {id:'local-preview'};
}});
console.log('Synthetic email previews saved to '+directory);
