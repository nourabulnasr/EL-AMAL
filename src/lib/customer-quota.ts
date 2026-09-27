import type { Payload } from "payload";
/** Durable per-email daily allowance, with an idempotent allowance receipt per request. */
export async function reserveEmailAttempt(
  payload: Payload,
  emailKey: string,
  attemptKey: string,
  limit = 6,
) {
  if (
    !/^[a-f0-9]{64}$/.test(emailKey) ||
    !/^[a-f0-9]{64}$/.test(attemptKey) ||
    emailKey === attemptKey ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 20
  )
    throw new Error("Invalid email quota");
  const client = await payload.db.pool.connect();
  try {
    await client.query("BEGIN");
    // Establish and lock the bucket atomically, including during expired-row cleanup.
    const found = await client.query(
      `INSERT INTO request_limits (key,hits,window_ends_at,created_at,updated_at) VALUES ($1,0,now()+interval '24 hours',now(),now()) ON CONFLICT (key) DO UPDATE SET updated_at=now() RETURNING hits,window_ends_at>now() AS active`,
      [emailKey],
    );
    const repeated = await client.query(
      "SELECT id FROM request_limits WHERE key=$1 AND window_ends_at>now()",
      [attemptKey],
    );
    if (repeated.rowCount) {
      await client.query("COMMIT");
      return true;
    }
    const hits = found.rows[0].active ? Number(found.rows[0].hits) : 0;
    if (hits >= limit) {
      await client.query("ROLLBACK");
      return false;
    }
    const window = await client.query(
      `UPDATE request_limits SET hits=$2,window_ends_at=CASE WHEN window_ends_at<=now() THEN now()+interval '24 hours' ELSE window_ends_at END,updated_at=now() WHERE key=$1 RETURNING window_ends_at`,
      [emailKey, hits + 1],
    );
    await client.query(
      `INSERT INTO request_limits (key,hits,window_ends_at,created_at,updated_at) VALUES ($1,1,$2,now(),now()) ON CONFLICT (key) DO UPDATE SET window_ends_at=EXCLUDED.window_ends_at,updated_at=now()`,
      [attemptKey, window.rows[0].window_ends_at],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
