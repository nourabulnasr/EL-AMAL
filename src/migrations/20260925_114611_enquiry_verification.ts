import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_enquiries_verification_status" ADD VALUE 'test-verified';
  ALTER TYPE "public"."enum_enquiries_verification_status" ADD VALUE 'verified';
  CREATE TABLE "enquiry_verifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enquiry_id" integer NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"consumed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "request_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"hits" numeric NOT NULL,
  	"window_ends_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "enquiries" ADD COLUMN "verified_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiry_verifications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "request_limits_id" integer;
  ALTER TABLE "enquiry_verifications" ADD CONSTRAINT "enquiry_verifications_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "enquiry_verifications_enquiry_idx" ON "enquiry_verifications" USING btree ("enquiry_id");
  CREATE UNIQUE INDEX "enquiry_verifications_token_hash_idx" ON "enquiry_verifications" USING btree ("token_hash");
  CREATE INDEX "enquiry_verifications_updated_at_idx" ON "enquiry_verifications" USING btree ("updated_at");
  CREATE INDEX "enquiry_verifications_created_at_idx" ON "enquiry_verifications" USING btree ("created_at");
  CREATE UNIQUE INDEX "request_limits_key_idx" ON "request_limits" USING btree ("key");
  CREATE INDEX "request_limits_window_ends_at_idx" ON "request_limits" USING btree ("window_ends_at");
  CREATE INDEX "request_limits_updated_at_idx" ON "request_limits" USING btree ("updated_at");
  CREATE INDEX "request_limits_created_at_idx" ON "request_limits" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiry_verifications_fk" FOREIGN KEY ("enquiry_verifications_id") REFERENCES "public"."enquiry_verifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_request_limits_fk" FOREIGN KEY ("request_limits_id") REFERENCES "public"."request_limits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_enquiry_verifications_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiry_verifications_id");
  CREATE INDEX "payload_locked_documents_rels_request_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("request_limits_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM enquiries WHERE verification_status::text <> 'unverified') THEN
      RAISE EXCEPTION 'Cannot roll back confirmed enquiries without an explicit data migration plan';
    END IF;
  END $$;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiry_verifications_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_request_limits_fk";
  ALTER TABLE "enquiry_verifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "request_limits" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "enquiry_verifications" CASCADE;
  DROP TABLE "request_limits" CASCADE;

  

  
  ALTER TABLE "enquiries" ALTER COLUMN "verification_status" SET DATA TYPE text;
  ALTER TABLE "enquiries" ALTER COLUMN "verification_status" SET DEFAULT 'unverified'::text;
  DROP TYPE "public"."enum_enquiries_verification_status";
  CREATE TYPE "public"."enum_enquiries_verification_status" AS ENUM('unverified');
  ALTER TABLE "enquiries" ALTER COLUMN "verification_status" SET DEFAULT 'unverified'::"public"."enum_enquiries_verification_status";
  ALTER TABLE "enquiries" ALTER COLUMN "verification_status" SET DATA TYPE "public"."enum_enquiries_verification_status" USING "verification_status"::"public"."enum_enquiries_verification_status";
  DROP INDEX "payload_locked_documents_rels_enquiry_verifications_id_idx";
  DROP INDEX "payload_locked_documents_rels_request_limits_id_idx";
  ALTER TABLE "enquiries" DROP COLUMN "verified_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiry_verifications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "request_limits_id";`)
}
