import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_enquiries_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_enquiries_source" AS ENUM('demo', 'cms');
  CREATE TYPE "public"."enum_enquiries_verification_status" AS ENUM('unverified');
  CREATE TYPE "public"."enum_enquiries_delivery_status" AS ENUM('not-configured');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'reviewing', 'awaiting-customer', 'quoted', 'closed');
  CREATE TABLE "enquiries_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" varchar NOT NULL,
  	"model" varchar NOT NULL,
  	"name_en" varchar NOT NULL,
  	"name_ar" varchar NOT NULL,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"request_key" varchar NOT NULL,
  	"fingerprint" varchar NOT NULL,
  	"locale" "enum_enquiries_locale" NOT NULL,
  	"source" "enum_enquiries_source" NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar NOT NULL,
  	"notes" varchar,
  	"verification_status" "enum_enquiries_verification_status" DEFAULT 'unverified' NOT NULL,
  	"delivery_status" "enum_enquiries_delivery_status" DEFAULT 'not-configured' NOT NULL,
  	"status" "enum_enquiries_status" DEFAULT 'new' NOT NULL,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  ALTER TABLE "enquiries_items" ADD CONSTRAINT "enquiries_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "enquiries_items_order_idx" ON "enquiries_items" USING btree ("_order");
  CREATE INDEX "enquiries_items_parent_id_idx" ON "enquiries_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "enquiries_reference_idx" ON "enquiries" USING btree ("reference");
  CREATE UNIQUE INDEX "enquiries_request_key_idx" ON "enquiries" USING btree ("request_key");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
   ALTER TABLE "enquiries_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "enquiries_items" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  DROP TYPE "public"."enum_enquiries_locale";
  DROP TYPE "public"."enum_enquiries_source";
  DROP TYPE "public"."enum_enquiries_verification_status";
  DROP TYPE "public"."enum_enquiries_delivery_status";
  DROP TYPE "public"."enum_enquiries_status";`)
}
