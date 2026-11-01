// Local review only: load the existing development environment without applying
// its legacy NODE_OPTIONS --env-file flags to the child Node process.
import {loadEnvFile} from 'node:process';
import {spawn} from 'node:child_process';
loadEnvFile('.env.local');loadEnvFile('.env.development.local');
delete process.env.NODE_OPTIONS;
const mode=process.argv[2]??'dev';
if(mode==='database')process.env.CMS_DATABASE_CHECK='development';
const args=mode==='dev'?['node_modules/next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1','--port','3014']:mode==='build'?['node_modules/next/dist/bin/next','build','--webpack']:['--experimental-strip-types','scripts/check-connection-options.ts'];
const child=spawn(process.execPath,args,{stdio:'inherit',env:process.env});
child.on('exit',code=>process.exit(code??1));
