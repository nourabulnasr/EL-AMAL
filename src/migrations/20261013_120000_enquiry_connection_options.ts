import {type MigrateUpArgs,type MigrateDownArgs,sql} from '@payloadcms/db-postgres';
export async function up({db}:MigrateUpArgs):Promise<void>{
 await db.execute(sql`ALTER TABLE enquiries_items
  ADD COLUMN option_id varchar,
  ADD COLUMN option_name_en varchar,
  ADD COLUMN option_name_ar varchar,
  ADD COLUMN option_model varchar;`);
}
export async function down({db}:MigrateDownArgs):Promise<void>{
 // Option snapshots are submitted history. Never silently discard them on rollback.
 await db.execute(sql`DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM enquiries_items WHERE option_id IS NOT NULL OR option_name_en IS NOT NULL OR option_name_ar IS NOT NULL OR option_model IS NOT NULL) THEN
   RAISE EXCEPTION 'Preserve connection option enquiry history before reverting this migration';
  END IF;
 END $$;
 ALTER TABLE enquiries_items DROP COLUMN option_id,DROP COLUMN option_name_en,DROP COLUMN option_name_ar,DROP COLUMN option_model;`);
}
