import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_notifications_source" AS ENUM('demo', 'cms');
  CREATE TYPE "public"."enum_notifications_status" AS ENUM('disabled', 'pending', 'processing', 'sent', 'failed');
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"enquiry_id" integer NOT NULL,
  	"delivery_key" varchar NOT NULL,
  	"recipient" varchar NOT NULL,
  	"source" "enum_notifications_source" NOT NULL,
  	"status" "enum_notifications_status" NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"next_attempt_at" timestamp(3) with time zone,
  	"lease_token" varchar,
  	"lease_expires_at" timestamp(3) with time zone,
  	"sent_at" timestamp(3) with time zone,
  	"provider_message_id" varchar,
  	"last_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notifications_id" integer;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "notifications_enquiry_idx" ON "notifications" USING btree ("enquiry_id");
  CREATE UNIQUE INDEX "notifications_delivery_key_idx" ON "notifications" USING btree ("delivery_key");
  CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");
  CREATE INDEX "notifications_next_attempt_at_idx" ON "notifications" USING btree ("next_attempt_at");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notifications_fk";
   ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notifications" CASCADE;
  
  DROP INDEX "payload_locked_documents_rels_notifications_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notifications_id";
  DROP TYPE "public"."enum_notifications_source";
  DROP TYPE "public"."enum_notifications_status";`)
}
