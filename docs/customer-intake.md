# Public customer enquiry intake

Implemented 27 September 2026. Production remains disabled pending reviewed CMS catalogue mode, a verified email sender, and running/tested workers. This is implemented application code, not a claim that customer emails currently work.

## Customer journey

English and Arabic basket and direct-model RFQ forms retain review before submission. Once the server readiness gate opens, the customer can submit, see a random enquiry reference, and request a replacement confirmation. Saving atomically creates an enquiry snapshot, customer verification digest/encrypted queue and staff notification. Staff notification delivery waits for customer email verification. No inventory is reserved or order placed. Failed transport does not remove the saved enquiry.

POST /api/customer-enquiries returns202 with a signed resend receipt and explicit emailSent:false and stockReserved:false. The receipt is a resend-only capability, not email verification; possessing it cannot confirm an address, inspect contact details or choose another recipient. It expires after24 hours and stays in React memory, never a URL or persistent browser storage. Refreshing/closing the tab loses this resend control. Keep the received confirmation email; its separate single-use link expires in one hour. A general email-address lookup/resend endpoint is intentionally absent.

POST /api/customer-enquiries/resend accepts that receipt. Missing, invalid, expired, already-confirmed, email-quota-limited and cooling-down requests receive the same202 accepted response. Only the existing stored recipient can receive a replacement; the old confirmation link becomes invalid. A delivery provider response is never represented as proof of inbox receipt.

## Guards and limits

- Exact configured HTTPS request origin and Origin header, JSON only, no GET mutation.
- Bounded32KB submission /4KB resend bodies and server validation; caller-supplied statuses, descriptions and recipients are not trusted.
- Six requests per minute per pseudonymous visitor/scope in PostgreSQL. Vercel-overwritten client IP is trusted only in Vercel; other hosts share a fallback bucket.
- Six new request/resend allowances per normalized email per fixed24-hour window. Email and attempt keys are purpose-separated HMACs; no raw contact/IP data in rate buckets.
- Atomic email-bucket upserts lock concurrent allowance checks. Cleanup skips locked expired rows and rechecks their expiry before deleting; scripts/check-request-limit-cleanup.ts covers renewal contention. Same request key does not consume another allowance. An allowance may be consumed before a failed database write or for an ineligible resend; this conservative limit counts attempts, not sent messages.
- Same-minute resend retries share an allowance; the separate outbox enforces a one-minute cooldown and three confirmation generations per enquiry per24 hours.
- Duplicate request retries resolve the saved snapshot, including after a product is removed from the catalogue. Changed contents with an existing request key conflict. Request keys and receipts are private random values.
- No-store/no-referrer JSON, generic errors, no contact details/tokens in responses or logs. Anonymous CMS access remains denied.

These limits bound abuse; they do not prove spam prevention, DDoS immunity or protection against a distributed attacker. Site-wide queue capacity/operational alerting still needs launch validation.

## Activation

All customerSettings checks must succeed: CMS_ENABLED, DATABASE_URL, PAYLOAD_SECRET(32+), CATALOGUE_SOURCE=cms, PUBLIC_ENQUIRIES_ENABLED=true, ENQUIRY_WORKERS_READY=true, VERIFICATION_DELIVERY_ENABLED=true and the complete mailReadiness configuration. SITE_URL must be the exact HTTPS canonical origin without a path/trailing slash. No fallback origin is used for mail links.

ENQUIRY_WORKERS_READY is a manual operational assertion, not health detection. Configure and test both protected POST workers, retry/expiry behavior and actual delivery first; set this flag last. Do not enable intake using demo data or unverified sender details. npm run readiness reports booleans only, no secrets or network calls. Production flags remain off in this release.

## Verification

Unit tests cover signed receipt tampering/expiry, purpose-separated keys, missing configuration, disabled intake, origin/content-type/body/validation limits, daily-quota responses and neutral resend behavior. scripts/check-customer-intake.ts exercises the development PostgreSQL database: concurrent quotas and identical retries, expiry reset, duplicate normalized requests, conflicts, single queue entry, resend contention/old-link invalidation, confirmed requests, daily limit denial, and saved-snapshot recovery after catalogue removal. Exact disposable rows are removed. No email transport is invoked.

Run only against the development database with CMS_DATABASE_CHECK=development. Existing verification/outbox/notification regressions use fake transports. Real delivery and activated browser submission remain separate launch checks.
