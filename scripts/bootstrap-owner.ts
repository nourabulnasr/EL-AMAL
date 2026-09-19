import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {getPayload} from 'payload';
import config from '../src/payload.config.ts';

// Trusted local setup only. This script is never exposed through an HTTP route.
const email=process.env.BOOTSTRAP_OWNER_EMAIL?.trim().toLowerCase();
const target=process.env.CMS_BOOTSTRAP;
if(!['development','hosted'].includes(target??'')||!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Explicit development or hosted bootstrap and a valid owner email are required.');
}
const payload=await getPayload({config});
try {
  const existing=await payload.find({collection:'staff',overrideAccess:true,limit:1});
  if(existing.totalDocs!==0) throw new Error('Staff already exists. Bootstrap will not create, promote or reset an account.');
  const password=randomBytes(32).toString('base64url');
  // Exclusive creation prevents accidental credential overwrite; Git ignores .env*.
  // Keep this file if a database operation fails so credentials can be recovered.
  const credentialFile=target==='hosted'?'.env.hosted-owner.local':'.env.owner.local';
  writeFileSync(credentialFile,`OWNER_EMAIL=${email}\nOWNER_PASSWORD=${password}\n`,{flag:'wx',mode:0o600});
  const owner=await payload.create({collection:'staff',overrideAccess:true,data:{email,password,role:'owner'}});
  const login=await payload.login({collection:'staff',data:{email,password}});
  if(!login.user||login.user.id!==owner.id||login.user.role!=='owner') throw new Error('Owner sign-in verification failed.');
  console.log(`Owner created and sign-in verified for ${target}. Credentials saved in ignored ${credentialFile}; values not printed.`);
} finally {
  await payload.destroy();
}
