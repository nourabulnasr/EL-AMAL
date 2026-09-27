import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config.ts";
import { allowRequest } from "../src/lib/request-limits.ts";
if (process.env.CMS_DATABASE_CHECK !== "development")
  throw new Error("Development database only");
const payload = await getPayload({ config }),
  pool = payload.db.pool;
const keys = Array.from({ length: 2 }, () =>
  createHash("sha256").update(randomUUID()).digest("hex"),
);
const held = await pool.connect();
let cleanup: Promise<boolean> | undefined,
  timer: ReturnType<typeof setTimeout> | undefined;
try {
  await pool.query(
    "INSERT INTO request_limits (key,hits,window_ends_at,created_at,updated_at) VALUES ($1,6,now()-interval '2 days',now(),now())",
    [keys[0]],
  );
  await held.query("BEGIN");
  await held.query(
    "UPDATE request_limits SET hits=6,window_ends_at=now()+interval '24 hours' WHERE key=$1",
    [keys[0]],
  );
  cleanup = allowRequest(payload, keys[1], 6);
  const nonBlocking = await Promise.race([
    cleanup.then(() => true),
    new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(false), 1500);
    }),
  ]);
  clearTimeout(timer);
  await held.query("COMMIT");
  await cleanup;
  const row = (
    await pool.query("SELECT hits FROM request_limits WHERE key=$1", [keys[0]])
  ).rows[0];
  assert.equal(
    Number(row?.hits),
    6,
    "Cleanup must not delete a renewed active email allowance",
  );
  assert.equal(
    nonBlocking,
    true,
    "Cleanup must skip a locked stale candidate rather than waiting",
  );
  console.log(
    "Rate-limit cleanup regression succeeded: locked renewal survives concurrent cleanup without blocking.",
  );
} finally {
  clearTimeout(timer);
  await held.query("ROLLBACK");
  held.release();
  if (cleanup) await cleanup.catch(() => {});
  await pool.query("DELETE FROM request_limits WHERE key=ANY($1::text[])", [
    keys,
  ]);
  await payload.destroy();
}
console.log("Disposable rate-limit rows removed.");
process.exit(0);
