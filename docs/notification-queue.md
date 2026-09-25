# Notification queue

This increment prepares staff enquiry notifications. It does not configure a sender, send email, expose a worker endpoint, or schedule delivery. Recipient defaults to the inbox confirmed by Nour and can be set with ENQUIRY_NOTIFICATION_TO; this is not a sender credential.

New enquiries and one unique notification record are created in the same PostgreSQL transaction. Queue failure rolls back the enquiry. Existing request-key deduplication also deduplicates queue records. Existing enquiries are not automatically backfilled.

Sample catalogue requests are permanently marked disabled by the submission service. The worker selects only source=cms records. Owner/sales can inspect the queue; all direct API creation, editing and deletion is denied. Delivery details are maintained only by trusted server code.

The injectable worker has no default transport. Without a transport it performs no work. With a transport, an atomic PostgreSQL claim uses SKIP LOCKED and a random five-minute lease. A stable delivery key must be passed to a provider that supports idempotent sends, including timeout retries. Successful sends store a provider receipt; failures retain a generic error and retry after exponential delays. Five attempts is the limit. Expired claims are recoverable; late worker results cannot overwrite a newer lease. Provider-side idempotency is required to prevent duplicate mail after a send succeeds but recording its receipt fails.

Message content includes the enquiry reference only, not customer notes, addresses or attachments. Public form remains staff-only demo testing. No claim of verified customer email is made. Customer verification tokens/links, sender adapter/configuration, scheduling, delivery-timeout handling, operational monitoring and public abuse controls remain separate work before activation.

Validation: development tests use a fake transport with no network sends, including atomic rollback, demo suppression, delayed retries, simultaneous workers, stale lease results and retry exhaustion. Test data is removed. See PROGRESS.md for deployment evidence.

## 25 September — sender and protected worker implemented

Resend HTTPS adapter is implemented without an added SDK dependency. It passes the stable Idempotency-Key header, uses a 15-second abort timeout, rejects redirects and invalid receipts, and suppresses provider response/error details. No provider account, verified sender or API key has been provisioned. Delivery remains explicitly disabled unless every required setting is present.

POST /api/internal/notifications requires a separate random 32+ character bearer secret, compared using constant-time bytes. Each authorised request claims at most one eligible notification. Missing/wrong authentication returns401 before database access; disabled configuration returns503. There is no GET send action and no scheduler is enabled yet. Response data contains only the result, never recipients or provider tokens.

Retries stop after five attempts or23 hours from queue creation, whichever comes first. This conservative limit stays within Resend's documented24-hour idempotency retention. Expired rows require operator reconciliation with the provider, not resetting attempts/creation dates. A provider receipt means accepted for sending, not proof of inbox delivery. Sample records remain permanently disabled.

Required settings at activation: NOTIFICATION_DELIVERY_ENABLED=true, MAIL_PROVIDER=resend, MAIL_FROM as a verified-domain plain email address, RESEND_API_KEY, NOTIFICATION_WORKER_SECRET. Keep secrets in Vercel environment settings, not chat or Git. Do not change sender/template/recipient while retryable work is pending; reconcile it before changing the transport. Schedule only after a controlled sender smoke test, and run often enough to respect the retry window. A once-daily job is unsuitable.

Read-only configuration check: npm run readiness (uses current process environment; supply ignored env files with node --env-file as needed). It reveals booleans only and makes no network requests. It does not prove domain ownership or actual receipt.

Sources: https://resend.com/docs/api-reference/emails/send-email and https://resend.com/docs/dashboard/emails/idempotency-keys . Real delivery, verification emails, public abuse controls and scheduling remain to be connected before operational intake.
