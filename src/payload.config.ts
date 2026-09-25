import {buildConfig} from 'payload';
import {postgresAdapter} from '@payloadcms/db-postgres';
import {Staff,Categories,Products,SKUs} from './cms/collections.ts';
import {Enquiries} from './cms/enquiries.ts';
import {EnquiryVerifications,RequestLimits} from './cms/verification.ts';
import {Notifications} from './cms/notifications.ts';
export default buildConfig({
 secret:process.env.PAYLOAD_SECRET||'',
 admin:{user:'staff'},
 db:postgresAdapter({pool:{connectionString:process.env.DATABASE_URL||'',max:3,connectionTimeoutMillis:15000},push:false,migrationDir:'src/migrations'}),
 collections:[Staff,Categories,Products,SKUs,Enquiries,Notifications,EnquiryVerifications,RequestLimits],
 typescript:{outputFile:'src/payload-types.ts'},
 graphQL:{disable:true},
});
