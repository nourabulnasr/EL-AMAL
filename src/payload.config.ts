import {buildConfig} from 'payload';
import {resolve} from 'node:path';
import {postgresAdapter} from '@payloadcms/db-postgres';
import {Staff,Categories,Products,SKUs} from './cms/collections.ts';
import {Enquiries} from './cms/enquiries.ts';
import {EnquiryVerifications,RequestLimits} from './cms/verification.ts';
import {Notifications} from './cms/notifications.ts';
import {VerificationEmails} from './cms/verification-emails.ts';
import {staffEmailAdapter} from './lib/staff-email.ts';
import {siteOrigin} from './lib/site-policy.mjs';
import {DeliveryOperations} from './cms/delivery-operations.ts';
import {InventoryReservations,InventoryMovements} from './cms/inventory.ts';
import {EnquiryAttachments} from './cms/attachments.ts';
import {installStaffRoleGuard} from './lib/staff-ownership.ts';
export default buildConfig({
 onInit:async(payload)=>{installStaffRoleGuard(payload);},
 secret:process.env.PAYLOAD_SECRET||'',
 serverURL:siteOrigin(),
 email:staffEmailAdapter(),
 admin:{user:'staff',importMap:{importMapFile:resolve(process.cwd(),'src/app/(payload)/admin/importMap.ts')},components:{beforeDashboard:['/src/components/inventory-admin-link#InventoryAdminLink']}},
 db:postgresAdapter({pool:{connectionString:process.env.DATABASE_URL||'',max:3,connectionTimeoutMillis:15000},push:false,migrationDir:'src/migrations'}),
 collections:[Staff,Categories,Products,SKUs,Enquiries,Notifications,EnquiryVerifications,RequestLimits,VerificationEmails,DeliveryOperations,InventoryReservations,InventoryMovements,EnquiryAttachments],
 typescript:{outputFile:'src/payload-types.ts'},
 graphQL:{disable:true},
});
