# Customer verification email delivery

The server now supports a durable customer confirmation email outbox. Real sending remains disabled, anonymous intake is not enabled, and no scheduler is installed. Tests use a fake transport only. The public website remains a client review preview.

## Implemented

- Trusted `submitEnquiry` callers can supply validated verification settings (Payload secret, exact HTTPS site origin and plain verified sender address). For CMS-source enquiries, the enquiry, staff notification, verification digest and customer email are committed in one transaction. Queue failure rolls everything back. A repeated request key does not create another message. Existing callers without settings retain their previous behavior; the future public intake **must** supply settings and check readiness before accepting a request.
- Demo-source enquiries never enqueue customer emails, even when settings are supplied. The staff-only test link remains separate.
- The email snapshots its sender, recipient, bilingual body and confirmation link. AES-256-GCM encrypts this envelope using a purpose-specific HKDF key derived from PAYLOAD_SECRET, a random nonce and the delivery key as authenticated associated data. The raw token is not returned from submission/resend or exposed through staff APIs. The verification table retains only its SHA-256 digest.
- Owner/sales can read delivery status in `/admin/collections/verification-emails`. Direct create/update/delete operations are denied. Encrypted content, delivery key and lease token have field-level read denial. Other roles and anonymous visitors cannot read the queue.
- The protected POST `/api/internal/verification-emails` handles at most one eligible item. It uses the existing constant-time bearer-secret authorization. Both NOTIFICATION_DELIVERY_ENABLED and VERIFICATION_DELIVERY_ENABLED must be true, with CMS, sender/provider/key and a sufficiently long Payload secret configured. GET cannot send.
- The worker uses atomic claims, five-minute leases, a five-attempt ceiling and exponential backoff. Retries reuse the same message and provider idempotency key. The one-hour token lifetime keeps retries within the provider's 24-hour deduplication window; no new claim starts with fewer than 30 seconds left. Expired or already-confirmed pending records are cancelled. Sent/terminal messages erase the replayable envelope. Provider acceptance is not proof of inbox delivery.
- The trusted resend service serializes on the verification record, refuses confirmed enquiries and live send leases, applies a one-minute cooldown and a maximum of three generations per 24-hour window. A replacement atomically changes the digest and encrypted email, invalidating the earlier link. It returns an outcome only, never a token. The older standalone issuer refuses records managed by this outbox. No public resend endpoint exists yet.

## Operational limits and remaining work

Connect guarded anonymous intake and a non-enumerating resend endpoint/UI, add email-based abuse limits and decide verified-enquiry staff notification/stock policy. The existing staff notification queue is not yet gated on verification. Do not enable it assuming otherwise.

Configure the verified sender/API key, confirm the final HTTPS origin, run an authorized end-to-end receipt test, then add scheduling, monitoring and provider reconciliation. Do not infer activation from the presence of this code. A message already in flight when confirmation/resend occurs cannot be recalled; an old link may arrive but cannot confirm after rotation. A provider timeout may mean accepted, so the next retry uses the same key. The worker deliberately stores only generic error text.

Rotating PAYLOAD_SECRET makes pending envelopes unreadable. Drain/cancel pending messages and issue replacements under a documented key-rotation procedure. Do not blindly rotate secrets and expect pending delivery to continue. Database backups remain sensitive; encryption does not protect a compromised application holding the secret.

Retention of terminal metadata, scheduling and alerting are still pending. Worker cleanup runs only when the enabled worker is called. Reissuing a failed message is a new generation subject to limits, not a reset of the old retry key.

## Verification

`tests/verification-message.test.mjs` covers encryption round-trip, nonce randomness, wrong key, wrong delivery, tampering, malformed envelopes, strict origin/sender settings and bilingual links. The sender adapter test verifies preserved sender snapshots.

`scripts/check-verification-emails.ts`, development database only, exercises transaction rollback, duplicate requests, demo exclusion, private fields, stable retry payloads, parallel claims, resend contention, old-token invalidation, confirmation suppression, cooldown/window limits, expiry, leases, stale completion, terminal attempts and corrupted envelopes. It deletes its own disposable records and never calls an external email service.

Migration `20260925_121725_verification_email_outbox` is additive. Its down migration removes the external relationship before the table; rollback would discard queue records and requires a data plan. No down migration is part of routine deployment.
