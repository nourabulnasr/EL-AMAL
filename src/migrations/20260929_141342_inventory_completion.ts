import {type MigrateUpArgs, type MigrateDownArgs, sql} from '@payloadcms/db-postgres';

export async function up({db}:MigrateUpArgs):Promise<void>{
  await db.execute(sql`
-- Integrate into the next additive Payload migration. Do not execute against live data from this file.
ALTER TYPE enum_inventory_movements_kind ADD VALUE IF NOT EXISTS 'block';
ALTER TYPE enum_inventory_movements_kind ADD VALUE IF NOT EXISTS 'unblock';
ALTER TYPE enum_inventory_movements_kind ADD VALUE IF NOT EXISTS 'confirm';
ALTER TABLE inventory_movements ADD COLUMN blocked_delta numeric DEFAULT 0 NOT NULL;
ALTER TABLE inventory_movements ADD COLUMN confirmed_quantity numeric;
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_whole_blocked
  CHECK (blocked_delta=trunc(blocked_delta) AND abs(blocked_delta)<=999999);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_whole_confirmation
  CHECK (confirmed_quantity IS NULL OR (confirmed_quantity=trunc(confirmed_quantity) AND confirmed_quantity BETWEEN 0 AND 999999999));
ALTER TABLE inventory_movements DROP CONSTRAINT inventory_movements_event_shape;
-- Text comparisons allow the new enum values in the same migration transaction.
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_event_shape CHECK (
  ((kind::text='receipt' AND on_hand_delta>0 AND reserved_delta=0 AND reservation_id IS NULL AND close_key IS NULL)
    OR (kind::text='adjustment' AND on_hand_delta<>0 AND reserved_delta=0 AND reservation_id IS NULL AND close_key IS NULL)
    OR (kind::text='hold' AND on_hand_delta=0 AND reserved_delta>0 AND reservation_id IS NOT NULL AND close_key IS NULL)
    OR (kind::text='release' AND on_hand_delta=0 AND reserved_delta<0 AND reservation_id IS NOT NULL)
    OR (kind::text='expire' AND on_hand_delta=0 AND reserved_delta<0 AND reservation_id IS NOT NULL AND close_key IS NOT NULL)
    OR (kind::text='dispatch' AND on_hand_delta=reserved_delta AND reserved_delta<0 AND reservation_id IS NOT NULL)
    OR (kind::text='reconcile' AND on_hand_delta=0 AND reserved_delta=0 AND reservation_id IS NULL AND close_key IS NULL))
    AND blocked_delta=0 AND confirmed_quantity IS NULL
  OR (kind::text IN ('block','unblock') AND on_hand_delta=0 AND reserved_delta=0 AND reservation_id IS NULL AND close_key IS NULL
    AND confirmed_quantity IS NULL AND ((kind::text='block' AND blocked_delta>0) OR (kind::text='unblock' AND blocked_delta<0)))
  OR (kind::text='confirm' AND on_hand_delta=0 AND reserved_delta=0 AND blocked_delta=0 AND reservation_id IS NULL AND close_key IS NULL AND confirmed_quantity IS NOT NULL)
);
-- Keep inventory_one_terminal_event and inventory_one_initial_hold intact.

  `);
}

// Stock history cannot safely discard blocked/partial events. Roll forward instead.
export async function down(_args:MigrateDownArgs):Promise<void>{
  throw new Error('Inventory completion is forward-only; preserve audit history and roll forward.');
}
