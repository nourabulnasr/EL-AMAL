# Enquiry verification and request limits

This increment implements and tests token confirmation. It does not send verification emails or enable anonymous enquiry submission.

## Implemented flow

An owner/sales user saves a sample enquiry and chooses Create test confirmation link. The protected issuer accepts only existing unverified demo-source records. It generates32 random bytes, returns a one-hour token once to that authenticated staff request, and stores only its SHA-256 digest. Issuing another unused link replaces the earlier one. Confirmed requests cannot get a fresh link.

/en/verify and /ar/verify read the token from the URL fragment, which is not sent in HTTP URLs. The fragment remains available for switching language until the confirm button is pressed, then is removed from the address bar. Tokens are not written to localStorage or sessionStorage. The unused link may remain in browser history until it is consumed or expires. No GET request consumes a token, so merely opening a link or scanning it does not confirm anything. Pages are noindex and use no-referrer metadata.

The confirmation POST atomically consumes an unexpired, unused digest and updates the associated enquiry. Concurrent requests cannot both succeed. Invalid, expired and used links return the same unavailable response. Test records become test-verified; real-source records can become verified only through the trusted issuance service and possession of its token. The HTTP staff issuer never issues real-source tokens. Successful confirmation does not reserve stock or send email, and does not requeue demo notifications.

The private enquiry-verifications and request-limits collections deny every direct REST operation, including owner access. Token fields are never exposed through the enquiry collection. Verified status/timestamp remain immutable through staff/admin updates. Rollback refuses to erase existing confirmed states without an explicit data plan; generated foreign-key drop ordering was corrected. No down migration was run.

## Request limits

Verification issuance and confirmation have separate PostgreSQL-backed fixed windows:10 attempts per minute per pseudonymous client bucket. Concurrent requests update the same row atomically; workers do not depend on per-process memory. Bucket identifiers are HMACs under a purpose-specific prefix; no raw IP or token is stored. Only when VERCEL=1 is the Vercel-overwritten x-forwarded-for header trusted. Invalid/multi-address headers and non-Vercel environments share a fallback bucket. Hosting behind another proxy requires reviewing this assumption. Stale buckets older than a day are removed opportunistically in bounded batches.

Requests require matching Origin and application/json; streamed bodies are limited to4KB. Missing CMS or database failures fail closed. Responses are no-store and429 includes Retry-After. These limits protect the verification endpoints only; they are not a completed public enquiry anti-spam workflow.

## Still to connect

Customer verification email generation, durable delivery/retry/resend workflow and activation with the sender provider; anonymous submission limits including email-based controls; verified-enquiry notification/stock policy; retention/monitoring. Do not return customer tokens in public submission responses. Sender information remains on the deferred end checklist.

Tests cover token rotation/expiry/replay, concurrent single-use, distinct demo/customer states, source-restricted issuance, private collection access and concurrent limit/reset behavior. All development test records are removed and no external mail is sent. Browser/deployment evidence is in PROGRESS.md.

Reference for proxy trust: https://vercel.com/docs/headers/request-headers
