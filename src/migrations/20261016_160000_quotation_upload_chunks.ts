import {type MigrateUpArgs,type MigrateDownArgs,sql} from '@payloadcms/db-postgres';

export async function up({db}:MigrateUpArgs):Promise<void>{
 await db.execute(sql`
  ALTER TABLE enquiry_attachments DROP CONSTRAINT enquiry_attachments_size;
  ALTER TABLE enquiry_attachments ADD CONSTRAINT enquiry_attachments_size CHECK(byte_count=trunc(byte_count) AND byte_count BETWEEN 1 AND 10485760);
  CREATE TABLE quotation_upload_sessions (
   upload_id varchar PRIMARY KEY,
   enquiry_id integer NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
   reference varchar NOT NULL,
   grant_hash varchar NOT NULL CHECK(grant_hash ~ '^[a-f0-9]{64}$'),
   filename varchar NOT NULL,
   content_type varchar NOT NULL CHECK(content_type IN ('image/jpeg','image/png','application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
   byte_count integer NOT NULL CHECK(byte_count BETWEEN 1 AND 10485760),
   content_hash varchar NOT NULL CHECK(content_hash ~ '^[a-f0-9]{64}$'),
   completed_at timestamptz,
   expires_at timestamptz NOT NULL DEFAULT now()+interval '1 hour',
   created_at timestamptz NOT NULL DEFAULT now(),
   CHECK(upload_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
  );
  CREATE INDEX quotation_upload_sessions_enquiry ON quotation_upload_sessions(enquiry_id);
  CREATE INDEX quotation_upload_sessions_expiry ON quotation_upload_sessions(expires_at);
  CREATE TABLE quotation_upload_chunks (
   upload_id varchar NOT NULL REFERENCES quotation_upload_sessions(upload_id) ON DELETE CASCADE,
   chunk_index integer NOT NULL CHECK(chunk_index BETWEEN 0 AND 9),
   byte_count integer NOT NULL CHECK(byte_count BETWEEN 1 AND 1048576),
   content_hash varchar NOT NULL CHECK(content_hash ~ '^[a-f0-9]{64}$'),
   sealed_data varchar NOT NULL,
   PRIMARY KEY(upload_id,chunk_index)
  );
  CREATE TABLE enquiry_attachment_parts (
   attachment_id integer NOT NULL REFERENCES enquiry_attachments(id) ON DELETE CASCADE,
   part_index integer NOT NULL CHECK(part_index BETWEEN 0 AND 9),
   byte_count integer NOT NULL CHECK(byte_count BETWEEN 1 AND 1048576),
   sealed_data varchar NOT NULL,
   PRIMARY KEY(attachment_id,part_index)
  );
 `);
}
export async function down({db}:MigrateDownArgs):Promise<void>{
 await db.execute(sql`DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM enquiry_attachment_parts) OR EXISTS(SELECT 1 FROM enquiry_attachments WHERE byte_count>2097152) OR EXISTS(SELECT 1 FROM quotation_upload_sessions) THEN
   RAISE EXCEPTION 'Preserve larger files and pending uploads before reverting';
  END IF;
 END $$;
 DROP TABLE quotation_upload_chunks;
 DROP TABLE quotation_upload_sessions;
 DROP TABLE enquiry_attachment_parts;
 ALTER TABLE enquiry_attachments DROP CONSTRAINT enquiry_attachments_size;
 ALTER TABLE enquiry_attachments ADD CONSTRAINT enquiry_attachments_size CHECK(byte_count=trunc(byte_count) AND byte_count BETWEEN 1 AND 2097152);`);
}
