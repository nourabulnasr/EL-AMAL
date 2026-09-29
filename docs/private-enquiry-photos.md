# Private enquiry photos

Customers can attach technical photos immediately after confirming their enquiry email. The feature must be explicitly enabled with `ENQUIRY_PHOTOS_ENABLED=true`; the CMS, database, strong `PAYLOAD_SECRET`, and exact HTTPS `SITE_URL` must also be configured. Confirm production migrations and retention scheduling before activation. This feature does not require a public bucket or a new storage provider.

## Accepted files and processing

- Up to three JPEG or PNG photos per genuinely verified CMS enquiry.
- Each upload is limited to 2 MiB (2,097,152 bytes), even if its declared content length is incorrect. The interface abbreviates this as 2 MB.
- Input decoding is limited to 8,000,000 pixels. Declared MIME type and file signature must agree. The image decoder must successfully reconstruct the pixels.
- The server applies embedded orientation, resizes within 2400 × 2400 pixels without enlargement, and writes a fresh JPEG or PNG. Reconstructed output must also fit within 2 MiB.
- Metadata and appended content are discarded during reconstruction. This is image reconstruction, not document antivirus scanning or a guarantee that sensitive information visible in the picture is removed.
- PDF, XLSX, SVG, videos, and arbitrary documents are **not enabled**. A customer can attach a photo of a technical drawing or model label. A separate vetted document workflow is required before accepting document files.

The confirmation response issues a signed, enquiry-specific upload capability valid for 24 hours. It is held in the confirmation page's memory and sent in the Authorization header, not placed in a public download URL. The current interface offers upload on that confirmation page; it does not provide a later customer attachment portal. Reloading the page loses the in-memory capability and the original email confirmation token cannot be reused.

## Storage, authorization, and retries

The server stores reconstructed bytes in the private Neon/PostgreSQL `enquiry_attachments` table. AES-256-GCM encryption uses a fresh 12-byte nonce per file. The authentication data binds each encrypted file to its enquiry reference and upload UUID. Upload capabilities and encryption keys are derived separately from `PAYLOAD_SECRET` using distinct purpose labels.

A transaction and a database advisory lock serialize admission across replicas. A repeated UUID with the same enquiry, reconstructed-content hash, sanitized name and MIME type returns the original result without a duplicate. Changed content or another enquiry cannot reuse the UUID. The browser retains its UUID when retrying a failed upload of the same selected file.

The shared quota is **64 MiB of reconstructed file bytes**, checked inside the same transaction as the per-enquiry count and insert. It is a logical attachment quota, not a promise that the PostgreSQL table occupies only 64 MiB: base64 encryption envelopes use approximately one-third more space, plus row/index overhead. Other database tables are outside this quota. Admission stops when the quota is full; it does not delete active photos or silently increase capacity.

Anonymous users, warehouse staff, and catalogue editors cannot read attachment records or download photos. Only authenticated owner and sales staff may download through `/api/staff/enquiry-attachments/:id`. The CMS exposes useful metadata to those roles but never returns `sealedData` or `contentHash` through normal read access. Direct public/CMS create, update, and delete operations are denied; the upload service owns creation. No file is written to `public/` or attached to notification emails.

Downloads use a generated safe filename, `Content-Disposition: attachment`, `nosniff`, a restrictive content security policy, and private/no-store caching. Invalid IDs, unauthorized requests, expired files, and unreadable envelopes return a generic not-found response.

## Retention

Every saved photo expires 30 days after creation. The download service denies it immediately at expiry even if cleanup has not yet run. Physical deletion is performed by the authenticated delivery operations worker only when both the worker and its separately controlled retention setting are active. It removes at most 50 expired photos per call and skips rows locked by another transaction.

Configure and verify the scheduler described in [delivery operations](./delivery-operations.md). If retention is disabled or the worker is unavailable, expired encrypted rows remain in Neon and still count toward the logical quota. Alert on failed/stale worker runs and pause photo intake if the quota cannot be maintained. Database backups may retain older encrypted copies under the backup provider's retention policy; 30 days describes live application availability and scheduled primary-database cleanup, not automatic erasure from every backup.

## Encryption-key rotation and recovery

`PAYLOAD_SECRET` is also used by authentication and other signed/encrypted workflows. Replacing it invalidates outstanding photo-upload capabilities and makes old photo ciphertext unreadable with the new key. The current envelope has no key ID and no dual-key reader. **Do not rotate it while assuming existing photos will remain readable.**

Before a planned rotation:

1. Pause new uploads and relevant delivery/recovery workers, and take an encrypted database backup. Keep the old key in approved private secret storage, separate from the backup.
2. Inventory live photos and other encrypted outboxes. Choose either to retain the old key until those records expire under the intended retention policy, or implement and review a migration that decrypts with the old key and re-encrypts with the new key while preserving each file's enquiry/UUID authentication data.
3. Verify migrated bytes and authentication failures in an isolated restore before changing the production secret. Coordinate all encrypted workflows and app instances; mixed-key instances can create unreadable records.
4. Switch the production secret and application together, confirm authorized downloads, denied unauthorized downloads, mail behavior and staff sign-in, then resume intake/workers. Old grants are expected to fail. Revoke old staff sessions as part of the authentication rotation.
5. Retain any old key only as required to recover still-retained backups. Remove it through the secret-management process after the corresponding recovery need ends.

No automated re-encryption or key-rotation tool is included in this release. A lost old key cannot be reconstructed from the database. Never write keys, upload grants, reset links, contact details or decrypted photos to Git, operational reports or application logs.

## Verification

Run focused tests serially on this memory-constrained host:

```powershell
node --max-old-space-size=384 --v8-pool-size=1 --experimental-strip-types tests/enquiry-attachments.test.mjs
node --max-old-space-size=384 --v8-pool-size=1 --experimental-strip-types tests/attachment-http.test.mjs
node --max-old-space-size=384 --v8-pool-size=1 --experimental-strip-types tests/staff-security.test.mjs
node --max-old-space-size=384 --v8-pool-size=1 --experimental-strip-types tests/staff-email.test.mjs
node --max-old-space-size=384 --v8-pool-size=1 --experimental-strip-types tests/staff-recovery.test.mjs
```

After the additive development migration, run the database regression separately from builds and other database regressions:

```powershell
$env:CMS_DATABASE_CHECK='development'
node --max-old-space-size=384 --v8-pool-size=1 --env-file=.env.local --env-file=.env.development.local --experimental-strip-types scripts/check-staff-and-photos.ts
```

The script requires the known development database URLs from `.env.local`, with `.env.development.local` supplying its development secret overrides. It checks that the active URLs match those local values, the pooled/unpooled hosts represent the same database, and `.env.hosted.local` identifies a different production database. It uses the unpooled Neon URL, clones only table structure into a random isolated schema, resets cloned serial defaults, restores foreign keys against that schema, and confines fixture writes to it. It uses synthetic staff/customer records and a fake email transport; no real recipient or provider is contacted. It exercises concurrent upload retries/count enforcement, quota/retention, read permissions, encrypted tamper rejection, and real Payload password reset/session behavior. Cleanup removes only its owned schema. Failure reports suppress credential, token, email-body and database diagnostic values. A failed run is a release finding, not an invitation to disable its security assertion.

Integration and live checks must additionally confirm that upload grants appear only after genuine customer confirmation, the real sender works, authenticated download cookies work in the browser, private routes are noindex, and the scheduled worker physically removes expired test photos. Provider acceptance alone does not establish inbox receipt.
