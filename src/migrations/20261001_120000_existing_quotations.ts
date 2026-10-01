import {type MigrateUpArgs,type MigrateDownArgs,sql} from '@payloadcms/db-postgres';
export async function up({db}:MigrateUpArgs):Promise<void>{
  await db.execute(sql`
    CREATE TYPE "public"."enum_enquiries_request_kind" AS ENUM('products','quotation');
    ALTER TABLE enquiries ADD COLUMN request_kind "public"."enum_enquiries_request_kind" DEFAULT 'products' NOT NULL;
    ALTER TABLE enquiries ADD COLUMN quotation_submitted_at timestamp(3) with time zone;
    ALTER TABLE enquiry_attachments DROP CONSTRAINT enquiry_attachments_photo_type;
    ALTER TABLE enquiry_attachments ADD CONSTRAINT enquiry_attachments_file_type CHECK(content_type IN ('image/jpeg','image/png','application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
  `);
}
export async function down({db}:MigrateDownArgs):Promise<void>{
  // Refuse destructive rollback while quotation records/documents exist.
  await db.execute(sql`DO $$ BEGIN
    IF EXISTS(SELECT 1 FROM enquiries WHERE request_kind='quotation') THEN
      RAISE EXCEPTION 'Preserve quotation records before reverting this migration';
    END IF;
  END $$;
  ALTER TABLE enquiry_attachments DROP CONSTRAINT enquiry_attachments_file_type;
  ALTER TABLE enquiry_attachments ADD CONSTRAINT enquiry_attachments_photo_type CHECK(content_type IN ('image/jpeg','image/png'));
  ALTER TABLE enquiries DROP COLUMN quotation_submitted_at;
  ALTER TABLE enquiries DROP COLUMN request_kind;
  DROP TYPE "public"."enum_enquiries_request_kind";`);
}
