import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_verification_emails_status" AS ENUM('pending', 'processing', 'sent', 'failed', 'cancelled');
  CREATE TABLE "verification_emails" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"enquiry_id" integer NOT NULL,
  	"delivery_key" varchar NOT NULL,
  	"sealed_message" varchar,
  	"status" "enum_verification_emails_status" NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"next_attempt_at" timestamp(3) with time zone,
  	"lease_token" varchar,
  	"lease_expires_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"sent_at" timestamp(3) with time zone,
  	"provider_message_id" varchar,
  	"last_error" varchar,
  	"issue_count" numeric NOT NULL,
  	"issuance_window_ends_at" timestamp(3) with time zone NOT NULL,
  	"last_issued_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "verification_emails_id" integer;
  ALTER TABLE "verification_emails" ADD CONSTRAINT "verification_emails_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "verification_emails_enquiry_idx" ON "verification_emails" USING btree ("enquiry_id");
  CREATE UNIQUE INDEX "verification_emails_delivery_key_idx" ON "verification_emails" USING btree ("delivery_key");
  CREATE INDEX "verification_emails_status_idx" ON "verification_emails" USING btree ("status");
  CREATE INDEX "verification_emails_next_attempt_at_idx" ON "verification_emails" USING btree ("next_attempt_at");
  CREATE INDEX "verification_emails_updated_at_idx" ON "verification_emails" USING btree ("updated_at");
  CREATE INDEX "verification_emails_created_at_idx" ON "verification_emails" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_emails_fk" FOREIGN KEY ("verification_emails_id") REFERENCES "public"."verification_emails"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_verification_emails_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_emails_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_verification_emails_fk";
  
  DROP INDEX "payload_locked_documents_rels_verification_emails_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "verification_emails_id";
  DROP TABLE "verification_emails";
  DROP TYPE "public"."enum_verification_emails_status";`)
}
