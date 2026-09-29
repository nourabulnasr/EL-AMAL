// Add after Payload's generated CREATE TABLE statements in the additive migration.
// Payload's generic number fields do not add whole-number or event-shape constraints.
export const inventoryIntegritySQL=`
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
`;
