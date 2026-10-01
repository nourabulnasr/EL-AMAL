# Public customer enquiry intake

## Existing quotation files — 1 October 2026

The RFQ page now includes “Already have a quotation?” in English and Arabic. The basket links to the same section. A customer can provide name, email, company and optional notes without re-entering model lines. This is an explicit `quotation` request with zero product rows; an ordinary `products` request still requires valid product lines. It never creates counted stock or a reservation.

The customer confirms their email before uploading. The confirmation page accepts up to three PDF, modern Excel `.xlsx`, JPEG or PNG files, each at most 2 MiB. Uploads are saved individually; the customer must select **Send files for review** to finish. Only finalization creates the staff notification, once, using an idempotent transaction. Uploading a file alone does not claim that the team has been notified. The interface distinguishes a queued notification from successful delivery.

Files share the existing encrypted PostgreSQL attachment storage, a 64 MiB service quota and 30-day expiry. No public asset URL or email attachment is created. Owner and sales staff find files through the private enquiry attachment collection. JPEG/PNG images are decoded and reconstructed. PDFs and spreadsheets receive bounded format checks but are **not antivirus scanned**. Staff must acknowledge this before downloading documents; responses force attachment download, disable caching and prevent inline rendering. Staff should scan documents with their organization's security tools before opening them.

PDF checks reject advertised active features and encryption, but do not prove that an arbitrary PDF is harmless. XLSX checks bound archive entry count, expansion and paths, and reject encrypted, macro-enabled, embedded or external-link packages. Legacy `.xls`, `.xlsm`, password-protected files and unsupported formats are rejected. Validating a format is not malware clearance. Larger files and automatic malware scanning remain separate infrastructure work.

The page can recover its upload session after a reload in the same tab. If confirmation succeeded but its response was lost, the same original email proof can recover a quotation upload grant only until that proof's original expiry. Ordinary product confirmations retain their single-use behavior. No email-address lookup or unrestricted public resend is introduced. Upload grants do not authorize reading contact details or downloading stored file contents.

Activation additionally requires `ENQUIRY_QUOTATIONS_ENABLED=true` alongside all normal customer intake, genuine email, CMS and worker-health gates below. Production sending remains inactive until those external dependencies are configured and tested. A visible form or deployed upload endpoint does not mean email delivery is active. The new migration is additive, defaults existing enquiries to `products`, and refuses a destructive rollback while quotation records exist.

For staff: open **Enquiries** in `/admin`, inspect the request kind and quotation submission time, then open its private attachment records. A document request has no automatic product-demand rows or stock allocation. Sales reviews the supplied file before agreeing specifications, availability or price. Do not edit the customer's immutable snapshot to invent product lines.

The original implementation notes below describe the product-line enquiry path. Current release evidence and whether the database migration has been deployed are recorded in `PROGRESS.md`.

29 September update: transactional active-queue capacity and the protected bounded scheduler are implemented. See [delivery operations](delivery-operations.md) for gates, retention, scheduler/account prerequisites and validation. Actual activation and inbox receipt remain separately verified deployment steps; the historical status below describes the original increment.

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
- New requests require a real `delivery_operations` heartbeat with a complete outcome and success within 15 minutes. Missing, stale, future or degraded evidence returns a generic retryable response before the email allowance and persistence. Already accepted request-key retries return their original result during an outage; neutral resend behavior is unchanged.
- No-store/no-referrer JSON, generic errors, no contact details/tokens in responses or logs. Anonymous CMS access remains denied.

These limits bound abuse; they do not prove spam prevention, DDoS immunity or protection against a distributed attacker. Site-wide queue capacity/operational alerting still needs launch validation.

## Activation

All customerSettings checks must succeed: CMS_ENABLED, DATABASE_URL, PAYLOAD_SECRET(32+), CATALOGUE_SOURCE=cms, PUBLIC_ENQUIRIES_ENABLED=true, ENQUIRY_WORKERS_READY=true, VERIFICATION_DELIVERY_ENABLED=true and the complete mailReadiness configuration. SITE_URL must be the exact HTTPS canonical origin without a path/trailing slash. No fallback origin is used for mail links.

ENQUIRY_WORKERS_READY remains a manual launch assertion. It is now supplemented by the database heartbeat check on every new customer submission. Configure and test the protected scheduled batch, both email queues, retry/expiry behavior and actual delivery first; set this flag last. Do not enable intake using demo data or unverified sender details. npm run readiness reports booleans only, no secrets or network calls; actual intake also requires fresh durable worker health. Production activation still requires the separate deployment procedure.

## Verification

Unit tests cover signed receipt tampering/expiry, purpose-separated keys, missing configuration, disabled intake, origin/content-type/body/validation limits, daily-quota responses and neutral resend behavior. scripts/check-customer-intake.ts exercises the development PostgreSQL database: concurrent quotas and identical retries, expiry reset, duplicate normalized requests, conflicts, single queue entry, resend contention/old-link invalidation, confirmed requests, daily limit denial, and saved-snapshot recovery after catalogue removal. Exact disposable rows are removed. No email transport is invoked.

Run only against the development database with CMS_DATABASE_CHECK=development. Customer-intake regressions must exercise a fresh scheduler heartbeat in an isolated fixture; do not overwrite a real operations health row to make a test succeed. Existing verification/outbox/notification regressions use fake transports. Real delivery and activated browser submission remain separate launch checks.
