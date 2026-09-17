import {buildConfig} from 'payload';
import {postgresAdapter} from '@payloadcms/db-postgres';
import {Staff,Categories,Products,SKUs} from './cms/collections';
export default buildConfig({
 secret:process.env.PAYLOAD_SECRET||'',
 admin:{user:'staff'},
 db:postgresAdapter({pool:{connectionString:process.env.DATABASE_URL||''},push:false}),
 collections:[Staff,Categories,Products,SKUs],
 typescript:{outputFile:'src/payload-types.ts'},
 graphQL:{disable:true},
});
