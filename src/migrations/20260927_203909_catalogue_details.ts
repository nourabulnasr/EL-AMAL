import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "catalogue_details" jsonb;
  ALTER TABLE "_products_v" ADD COLUMN "version_catalogue_details" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "catalogue_details";
  ALTER TABLE "_products_v" DROP COLUMN "version_catalogue_details";`)
}
