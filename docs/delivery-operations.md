# Delivery operations

The authenticated batch runner is implemented. Actual activation requires the verified sender, a suitable scheduler, the reviewed additive migration, and a controlled receipt test. Source code and configuration booleans alone do not establish email delivery.

## Signed Inngest schedule — 11 October 2026

The application now includes `/api/inngest` for the selected Inngest service. Its five-minute cron calls the shared `runConfiguredDelivery` runtime with concurrency one and two scheduler retries. The existing daily Vercel maintenance job remains. Both paths retain the same database lease and message idempotency; only the authentication and scheduling entry point differ.

The Inngest entry point requires `VERCEL_ENV=production`, the existing CMS and operations settings, and a real `INNGEST_SIGNING_KEY`. Connect the integration to production only; it supplies that key and `INNGEST_EVENT_KEY`. The SDK is explicitly in cloud mode and validates request signatures. The configured `SITE_URL` is the public sync origin. Preview/local or incomplete configurations return503; HEAD returns405. No scheduler bearer secret is sent to Inngest. Scheduler results contain only outcome and aggregate counts; customer messages, files, addresses and tokens are not returned as function results.

Provisioning, app sync and successful scheduled executions still need to be observed before setting the public launch assertion. The terms/account handoff and sender verification record are in [the current brand and email update](brand-and-email-2026-10-11.md). No paid Vercel cron upgrade was made. A `maintenance` result still cannot qualify as healthy email delivery.

## Endpoint and gates

`GET` or `POST /api/internal/delivery-operations` requires `Authorization: Bearer <CRON_SECRET>`. Use a separate cryptographically random secret of at least 32 characters. Constant-time comparison happens before readiness or database access. `HEAD` explicitly returns 405, preventing Next's automatic GET fallback from sending. Responses are no-store, no-referrer and noindex, with no addresses, token material, provider errors or customer notes.

Required scheduler settings:

- `CMS_ENABLED=true`, valid `DATABASE_URL`, and `PAYLOAD_SECRET` of 32+ characters.
- `DELIVERY_OPERATIONS_ENABLED=true` enables the authenticated scheduler endpoint.
- `CRON_SECRET` authenticates the scheduler. It is separate from `NOTIFICATION_WORKER_SECRET` used by existing one-item POST workers.
- `DELIVERY_RETENTION_ENABLED=true` enables the separately gated expired-secret, stale-rate and expired-photo cleanup. Default is off.

Sending also requires all existing `mailReadiness` conditions: `NOTIFICATION_DELIVERY_ENABLED=true`, `MAIL_PROVIDER=resend`, a real `RESEND_API_KEY`, verified plain-email `MAIL_FROM`, 32+ `NOTIFICATION_WORKER_SECRET`, and `VERIFICATION_DELIVERY_ENABLED=true`. Public intake has its additional CMS-catalogue, canonical-origin and manual readiness gates. New customer submissions also require the durable delivery row to report `complete` with a success timestamp within the last 15 minutes. Missing, stale, future or degraded health fails closed with a generic retryable response before consuming the email allowance or saving a new enquiry. An already accepted request-key retry still returns its original receipt during an outage. Do not set `ENQUIRY_WORKERS_READY=true` until the scheduler and actual receipt/confirmation path have been tested.

With scheduler enabled but no email transport, enabled maintenance runs and the response says `maintenance` with HTTP 200 and zero email attempts. It records completion/outcome but never sets or advances `lastSuccessAt`; it cannot satisfy the customer-intake health gate. Complete, maintenance and overlap outcomes return 200; degraded, disabled, stale and errors return 503. The failure response withholds exception details. The endpoint is not a public health probe; it performs authenticated work.

## Bounded work and recovery

One atomic PostgreSQL upsert acquires a random two-minute scheduler lease. Concurrent calls return `overlap`; a crashed invocation becomes recoverable after expiry. Completion checks the same unexpired lease, so a late completion cannot overwrite a replacement. No database connection or transaction stays open while waiting for a provider.

Each batch starts at most eight message attempts, alternates customer verification and staff queues, and stops starting new work after a 40-second budget measured before CMS initialization. An empty queue does not starve the other. The provider already has a 15-second abort; the route has `maxDuration=60`. The deadline limits new work, while the host's duration limit bounds a stalled invocation. PostgreSQL row claims retain their independent five-minute leases. Retries retain stable provider idempotency keys, exponential backoff and five-attempt ceilings. Staff notification retries never cross 23 hours from initial creation. A timeout can mean the provider accepted the email; never manually reset an old row to resend it.

Staff delivery still requires the enquiry's `source=cms`, `verification_status=verified`, and non-null confirmation timestamp. Demo/test confirmations do not qualify. Verification links still expire after one hour; no new verification claim starts with less than 30 seconds remaining. Accepted means accepted by the provider, not proven inbox receipt.

`expireInventoryHolds` runs through the bounded maintenance callback: at most 25 holds with a five-second start budget inside the overall deadline. Availability already excludes expired holds if scheduling is delayed. Attachment cleanup runs only with retention enabled and selects at most 50 expired rows; their stored 30-day expiry remains authoritative.

## Capacity and retention

New CMS enquiries use a transaction-scoped PostgreSQL advisory lock before queue insertion. They are refused if either customer-confirmation or CMS staff pending/processing queue has 100 records. The check uses the same Payload database transaction as the enquiry and both outboxes. Concurrent admissions cannot overbook capacity. A terminal verification generation must acquire capacity before rejoining the active queue. Existing pending generations may rotate without growing the queue. Existing request-key retries resolve their saved record before capacity checks. The original visitor/email/issuance limits remain in force. This caps active backlog, not total lifetime records, provider spending, or distributed request traffic.

Maintenance changes at most 100 rows per table operation and skips locked candidates:

- Expired/completed/ineligible verification jobs become cancelled, exhausted jobs failed, and their replayable encrypted envelope is erased. Live send leases are preserved.
- Staff notifications past the 23-hour window or retry ceiling become failed for operator review; no retry timestamps or creation dates are reset.
- Terminal verification jobs erase residual encrypted envelopes, preserving delivery receipts/status.
- Expired verification digests become unique non-digest tombstones. Rows, consumed timestamps, issuance limits and confirmation evidence remain intact, and later authorized issuance can replace a tombstone. Active links and live send leases are preserved.
- Rate buckets are deleted only after their window has been expired for over one day. The outer expiry check and `SKIP LOCKED` prevent deleting a concurrently renewed allowance.

Enquiries, delivery history and business records are not automatically deleted by these email retention routines. A wider personal-data retention policy requires a separate explicit business decision. Do not change sender, recipient or message templates while retryable staff jobs are pending. Reconcile accepted/ambiguous provider results before changing transport configuration or rotating `PAYLOAD_SECRET`.

## Monitoring and scheduler choice

Owner-only `/admin/collections/delivery-operations` shows last started/completed/success timestamps, outcome, attempted count, failures, current queue counts and oldest pending timestamp. Lease tokens are denied at field level and direct API writes are denied. `isDeliveryHealthFresh` considers only a completed success within 15 minutes, with no future timestamp; new customer admission checks this real row in addition to the manual `ENQUIRY_WORKERS_READY` launch assertion. The worker continues to run while admission is paused and can restore healthy evidence after recovery. Resend responses remain neutral and do not disclose queue or recipient state.

Investigate any 503, last success older than 15 minutes, growing backlog, confirmation backlog older than 10 minutes, or staff records near their 23-hour cutoff. A platform timeout may leave the previous result visible: compare timestamps and lease expiry. Pause public intake during a prolonged scheduler/provider outage, preserve the records, and reconcile provider receipts before resending. No external alert recipient or monitoring service is provisioned by this change.

Use one invocation every five minutes on an already-authorized suitable scheduler. Native Vercel cron supports this cadence on Pro/Enterprise. Hobby permits only daily jobs with up to one-hour timing variation, which is unsuitable for one-hour confirmation links. Do not add an unsupported schedule or buy a plan implicitly. [Vercel schedule limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)

The deployment owner confirmed the actual Vercel account is **Hobby** on 29 September 2026. A daily native cron at 02:00 UTC can run bounded inventory expiry and enabled photo/ephemeral retention. This maintenance schedule does not establish mail health: expired holds stop consuming availability immediately, and stored retention expiry remains authoritative even when cleanup waits for the daily invocation. A production scheduler capable of five-minute calls remains an email activation dependency. This increment does not add a paid upgrade or claim a frequent native Vercel cron is configured. Public enquiry sending stays gated until an authorized suitable scheduler and real sender verification are complete.

The deployment owner can configure Hobby-compatible daily maintenance separately:

```json
{"crons":[{"path":"/api/internal/delivery-operations","schedule":"0 2 * * *"}]}
```

Only if a future authorized project plan supports frequent delivery can this become:

```json
{"crons":[{"path":"/api/internal/delivery-operations","schedule":"*/5 * * * *"}]}
```

Vercel sends `CRON_SECRET` as a bearer header. Invocations can overlap, repeat or be missed; Vercel does not retry failed cron requests automatically. The next scheduled invocation reprocesses due work under the existing leases. [Vercel cron authentication and delivery behavior](https://vercel.com/docs/cron-jobs/manage-cron-jobs)

For customer email on the confirmed Hobby project, provision a separately authorized scheduler capable of five-minute HTTPS requests, such as the user's existing Cloudflare account if its availability is verified. Store the same secret privately there, use HTTPS POST, reject redirects, and inspect both status and saved heartbeat. Do not assume GitHub scheduled workflows provide timely delivery, or use the local laptop as production infrastructure. Parent-owned deployment configuration and hosted checks determine whether daily maintenance is actually active; source implementation alone does not prove scheduling.

## Verification

With constrained Windows memory, run serially:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=384 --v8-pool-size=1'
node --experimental-strip-types --experimental-test-isolation=none --test tests/*.test.mjs
$env:CMS_DATABASE_CHECK='development'
node --env-file=.env.local --env-file=.env.development.local --experimental-strip-types scripts/check-delivery-operations.ts
```

The integration script needs the new migration in the development database. It clones the six relevant table structures into a uniquely named disposable schema, supplies its own sequences, exercises real PostgreSQL concurrency/retention/capacity and verified-customer gating, then drops only that schema. The sole transport is a fake; no provider is contacted. `check-customer-intake.ts` now clones its own isolated schema with separate sequences and foreign keys, records fake empty-worker health only there, tests missing/stale/degraded admission and accepted retries, then drops its owned schema. Both prefer the development direct connection because Neon transaction poolers reject startup schema options. Also rerun verification-email and notification development regressions after integration to verify full transactional submission behavior.

Production activation remains a separate controlled procedure: migrate after review; confirm the actual account and sender; configure secrets; enable scheduler; observe two real healthy invocations; submit a controlled customer request and receive/confirm it; verify the staff notification in the confirmed inbox; then enable public intake. Keep provider acceptance, actual receipt and customer confirmation as separate evidence.
