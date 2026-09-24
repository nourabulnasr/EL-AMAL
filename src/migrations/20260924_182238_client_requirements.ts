import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_applications" AS ENUM('oil-gas', 'general-industry');
  CREATE TYPE "public"."enum_products_instrument_type" AS ENUM('pressure-gauge', 'pressure-transmitter', 'pressure-switch', 'temperature-instrument', 'accessory');
  CREATE TYPE "public"."enum__products_v_version_applications" AS ENUM('oil-gas', 'general-industry');
  CREATE TYPE "public"."enum__products_v_version_instrument_type" AS ENUM('pressure-gauge', 'pressure-transmitter', 'pressure-switch', 'temperature-instrument', 'accessory');
  CREATE TABLE "products_applications" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_applications",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_applications" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_applications",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "instrument_type" "enum_products_instrument_type";
  ALTER TABLE "products" ADD COLUMN "datasheet_url" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_instrument_type" "enum__products_v_version_instrument_type";
  ALTER TABLE "_products_v" ADD COLUMN "version_datasheet_url" varchar;
  ALTER TABLE "enquiries_items" ADD COLUMN "range" varchar;
  ALTER TABLE "products_applications" ADD CONSTRAINT "products_applications_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_applications" ADD CONSTRAINT "_products_v_version_applications_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_applications_order_idx" ON "products_applications" USING btree ("order");
  CREATE INDEX "products_applications_parent_idx" ON "products_applications" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_applications_order_idx" ON "_products_v_version_applications" USING btree ("order");
  CREATE INDEX "_products_v_version_applications_parent_idx" ON "_products_v_version_applications" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_applications" CASCADE;
  DROP TABLE "_products_v_version_applications" CASCADE;
  ALTER TABLE "products" DROP COLUMN "instrument_type";
  ALTER TABLE "products" DROP COLUMN "datasheet_url";
  ALTER TABLE "_products_v" DROP COLUMN "version_instrument_type";
  ALTER TABLE "_products_v" DROP COLUMN "version_datasheet_url";
  ALTER TABLE "enquiries_items" DROP COLUMN "range";
  DROP TYPE "public"."enum_products_applications";
  DROP TYPE "public"."enum_products_instrument_type";
  DROP TYPE "public"."enum__products_v_version_applications";
  DROP TYPE "public"."enum__products_v_version_instrument_type";`)
}
