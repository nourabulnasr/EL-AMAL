# Staff password recovery verification — 16 October 2026

This record covers the recovery implementation and isolated verification. Production activation and deployment are recorded separately in the release record. No real staff password was changed and no real reset email was sent during these checks.

## What was corrected

Payload 3.90.2's built-in Forgot Password and Reset Password screens submit multipart form data containing a single `_payload` JSON field. The previous recovery wrapper accepted JSON only, so the actual admin form would receive HTTP 400 even with the delivery flag enabled.

The wrapper now accepts that exact admin format as well as JSON. It reads at most 8 KiB from the body stream before multipart parsing, rejects files, duplicate fields and malformed input, validates the email or reset token/password, and forwards only the permitted reset fields to Payload with the correct JSON content type. The original same-origin, readiness and database rate-limit checks remain in place. Password-policy errors include the `message` field that the built-in reset form displays.

The change does not add an alternative login method, relax the password policy, change current credentials or require a database migration.

## Verification evidence

- A regression using the real admin form format failed first with HTTP 400, then succeeded after the fix.
- All 14 focused staff-security/recovery/email unit tests succeeded.
- The full current unit suite succeeded: 214 tests, 0 failures.
- TypeScript completed successfully.
- `scripts/check-staff-recovery.ts` succeeded against real Payload operations and its REST reset handler in an empty, separately named development PostgreSQL schema. The test installed a fake Resend transport before recovery calls, created only synthetic staff accounts, and removed the owned schema afterward.

The integration check verified the neutral response for known/unknown addresses, canonical reset-link destination, 30-minute token expiry, ten-minute per-account email cooldown, password policy, new authenticated session cookie, revocation of the old session, rejection of expired/reused tokens, exactly one success from two simultaneous uses of one token, provider-failure retry behavior, origin restrictions and database-backed request limits. It also confirmed that an injected role field could not change the staff role.

The PostgreSQL driver emitted its existing forward-looking SSL-mode compatibility warning. It did not prevent these checks. This test result is not a claim that the website has no possible vulnerability.

## Production activation

The readiness gate requires all of the following server-side values:

| Setting | Required value |
| --- | --- |
| `STAFF_RECOVERY_ENABLED` | `true` in Production only |
| `MAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | Existing valid server-side Resend key; never include it in this document |
| `MAIL_FROM` | Verified plain sender address, currently `enquiries@al-amaleg.com` |
| `SITE_URL` | Exact canonical HTTPS origin, currently `https://www.al-amaleg.com`, without a trailing slash |

Set the missing production flag and deploy the corrected application. Keep recovery disabled on isolated previews. Staff recovery sends through the existing Resend adapter directly; it does not wait for the customer-enquiry Inngest queue.

## What the account owner does

Open `https://www.al-amaleg.com/admin/login`, choose Forgot password and enter the email belonging to the staff account. This can differ from the Hotmail address receiving customer enquiries. Open the reset message in that account's mailbox, use the link within 30 minutes and personally enter a unique 15–128-character passphrase. The owner must not send the password or reset link to support.

A successful reset invalidates previous sessions and normally signs the person into a new session. If necessary, sign in with the new password. The resend countdown is ten minutes. A neutral response protects account privacy and does not prove inbox delivery; the owner still needs to confirm receipt and complete the real reset personally.
