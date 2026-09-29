import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inventory_movements_kind" AS ENUM('receipt', 'adjustment', 'hold', 'release', 'expire', 'dispatch', 'reconcile');
  CREATE TABLE "delivery_operations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"lease_token" varchar,
  	"lease_expires_at" timestamp(3) with time zone,
  	"last_started_at" timestamp(3) with time zone,
  	"last_completed_at" timestamp(3) with time zone,
  	"last_success_at" timestamp(3) with time zone,
  	"last_outcome" varchar,
  	"processed" numeric DEFAULT 0,
  	"failures" numeric DEFAULT 0,
  	"verification_pending" numeric DEFAULT 0,
  	"notification_pending" numeric DEFAULT 0,
  	"oldest_pending_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inventory_reservations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"sku_id" integer NOT NULL,
  	"enquiry_id" integer NOT NULL,
  	"enquiry_line_id" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"actor_id" integer NOT NULL,
  	"reason" varchar NOT NULL,
  	"sku_snapshot" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inventory_movements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"request_key" varchar NOT NULL,
  	"fingerprint" varchar NOT NULL,
  	"kind" "enum_inventory_movements_kind" NOT NULL,
  	"sku_id" integer NOT NULL,
  	"reservation_id" integer,
  	"close_key" varchar,
  	"on_hand_delta" numeric NOT NULL,
  	"reserved_delta" numeric NOT NULL,
  	"actor_id" integer,
  	"actor_role" varchar NOT NULL,
  	"reason" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiry_attachments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"upload_id" varchar NOT NULL,
  	"enquiry_id" integer NOT NULL,
  	"reference" varchar NOT NULL,
  	"filename" varchar NOT NULL,
  	"content_type" varchar NOT NULL,
  	"byte_count" numeric NOT NULL,
  	"content_hash" varchar NOT NULL,
  	"sealed_data" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "delivery_operations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inventory_reservations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inventory_movements_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiry_attachments_id" integer;
  ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_sku_id_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."skus"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_actor_id_staff_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."staff"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_sku_id_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."skus"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_reservation_id_inventory_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."inventory_reservations"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_actor_id_staff_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."staff"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "enquiry_attachments" ADD CONSTRAINT "enquiry_attachments_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE restrict ON UPDATE no action;
  CREATE UNIQUE INDEX "delivery_operations_key_idx" ON "delivery_operations" USING btree ("key");
  CREATE INDEX "delivery_operations_updated_at_idx" ON "delivery_operations" USING btree ("updated_at");
  CREATE INDEX "delivery_operations_created_at_idx" ON "delivery_operations" USING btree ("created_at");
  CREATE UNIQUE INDEX "inventory_reservations_reference_idx" ON "inventory_reservations" USING btree ("reference");
  CREATE INDEX "inventory_reservations_sku_idx" ON "inventory_reservations" USING btree ("sku_id");
  CREATE INDEX "inventory_reservations_enquiry_idx" ON "inventory_reservations" USING btree ("enquiry_id");
  CREATE INDEX "inventory_reservations_enquiry_line_id_idx" ON "inventory_reservations" USING btree ("enquiry_line_id");
  CREATE INDEX "inventory_reservations_expires_at_idx" ON "inventory_reservations" USING btree ("expires_at");
  CREATE INDEX "inventory_reservations_actor_idx" ON "inventory_reservations" USING btree ("actor_id");
  CREATE INDEX "inventory_reservations_updated_at_idx" ON "inventory_reservations" USING btree ("updated_at");
  CREATE INDEX "inventory_reservations_created_at_idx" ON "inventory_reservations" USING btree ("created_at");
  CREATE UNIQUE INDEX "inventory_movements_request_key_idx" ON "inventory_movements" USING btree ("request_key");
  CREATE INDEX "inventory_movements_sku_idx" ON "inventory_movements" USING btree ("sku_id");
  CREATE INDEX "inventory_movements_reservation_idx" ON "inventory_movements" USING btree ("reservation_id");
  CREATE UNIQUE INDEX "inventory_movements_close_key_idx" ON "inventory_movements" USING btree ("close_key");
  CREATE INDEX "inventory_movements_actor_idx" ON "inventory_movements" USING btree ("actor_id");
  CREATE INDEX "inventory_movements_updated_at_idx" ON "inventory_movements" USING btree ("updated_at");
  CREATE INDEX "inventory_movements_created_at_idx" ON "inventory_movements" USING btree ("created_at");
  CREATE UNIQUE INDEX "enquiry_attachments_upload_id_idx" ON "enquiry_attachments" USING btree ("upload_id");
  CREATE INDEX "enquiry_attachments_enquiry_idx" ON "enquiry_attachments" USING btree ("enquiry_id");
  CREATE INDEX "enquiry_attachments_expires_at_idx" ON "enquiry_attachments" USING btree ("expires_at");
  CREATE INDEX "enquiry_attachments_updated_at_idx" ON "enquiry_attachments" USING btree ("updated_at");
  CREATE INDEX "enquiry_attachments_created_at_idx" ON "enquiry_attachments" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_delivery_operations_fk" FOREIGN KEY ("delivery_operations_id") REFERENCES "public"."delivery_operations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inventory_reservations_fk" FOREIGN KEY ("inventory_reservations_id") REFERENCES "public"."inventory_reservations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inventory_movements_fk" FOREIGN KEY ("inventory_movements_id") REFERENCES "public"."inventory_movements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiry_attachments_fk" FOREIGN KEY ("enquiry_attachments_id") REFERENCES "public"."enquiry_attachments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_delivery_operations_id_idx" ON "payload_locked_documents_rels" USING btree ("delivery_operations_id");
  CREATE INDEX "payload_locked_documents_rels_inventory_reservations_id_idx" ON "payload_locked_documents_rels" USING btree ("inventory_reservations_id");
  CREATE INDEX "payload_locked_documents_rels_inventory_movements_id_idx" ON "payload_locked_documents_rels" USING btree ("inventory_movements_id");
  CREATE INDEX "payload_locked_documents_rels_enquiry_attachments_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiry_attachments_id");`)
  await db.execute(sql`
ALTER TABLE inventory_reservations ADD CONSTRAINT inventory_reservations_whole_quantity
  CHECK (quantity=trunc(quantity) AND quantity BETWEEN 1 AND 999999);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_whole_deltas
  CHECK (on_hand_delta=trunc(on_hand_delta) AND reserved_delta=trunc(reserved_delta)
    AND abs(on_hand_delta)<=999999 AND abs(reserved_delta)<=999999);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_actor
  CHECK ((actor_role='system' AND actor_id IS NULL AND kind='expire')
    OR (actor_role IN ('owner','sales','warehouse') AND actor_id IS NOT NULL AND kind<>'expire'));
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_event_shape CHECK (
  (kind='receipt' AND on_hand_delta>0 AND reserved_delta=0 AND reservation_id IS NULL AND close_key IS NULL)
  OR (kind='adjustment' AND on_hand_delta<>0 AND reserved_delta=0 AND reservation_id IS NULL AND close_key IS NULL)
  OR (kind='hold' AND on_hand_delta=0 AND reserved_delta>0 AND reservation_id IS NOT NULL AND close_key IS NULL)
  OR (kind IN ('release','expire') AND on_hand_delta=0 AND reserved_delta<0 AND reservation_id IS NOT NULL AND close_key IS NOT NULL)
  OR (kind='dispatch' AND on_hand_delta=reserved_delta AND reserved_delta<0 AND reservation_id IS NOT NULL AND close_key IS NOT NULL)
  OR (kind='reconcile' AND on_hand_delta=0 AND reserved_delta=0 AND reservation_id IS NULL AND close_key IS NULL));
CREATE UNIQUE INDEX inventory_one_terminal_event ON inventory_movements (reservation_id) WHERE close_key IS NOT NULL;
CREATE UNIQUE INDEX inventory_one_initial_hold ON inventory_movements (reservation_id) WHERE kind='hold';
CREATE INDEX inventory_enquiry_line ON inventory_reservations (enquiry_id,enquiry_line_id);
CREATE INDEX inventory_sku_expiry ON inventory_reservations (sku_id,expires_at);

ALTER TABLE enquiry_attachments ADD CONSTRAINT enquiry_attachments_size CHECK (byte_count=trunc(byte_count) AND byte_count BETWEEN 1 AND 2097152);
ALTER TABLE enquiry_attachments ADD CONSTRAINT enquiry_attachments_photo_type CHECK (content_type IN ('image/jpeg','image/png'));
`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "delivery_operations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inventory_reservations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inventory_movements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiry_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_delivery_operations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inventory_reservations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inventory_movements_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiry_attachments_fk";
  
  DROP INDEX "payload_locked_documents_rels_delivery_operations_id_idx";
  DROP INDEX "payload_locked_documents_rels_inventory_reservations_id_idx";
  DROP INDEX "payload_locked_documents_rels_inventory_movements_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiry_attachments_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "delivery_operations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inventory_reservations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inventory_movements_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiry_attachments_id";
  DROP TABLE "delivery_operations" CASCADE;
  DROP TABLE "inventory_reservations" CASCADE;
  DROP TABLE "inventory_movements" CASCADE;
  DROP TABLE "enquiry_attachments" CASCADE;
  DROP TYPE "public"."enum_inventory_movements_kind";`)
}
