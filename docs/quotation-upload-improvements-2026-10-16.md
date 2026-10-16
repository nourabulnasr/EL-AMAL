# Quotation upload improvements — 16 October 2026

Implementation and verification record. This document describes the code prepared for the release; the parent release record supplies the final deployment and production migration confirmation.

## Customer and staff experience

The existing-quotation form accepts up to **three files, each at most 10 MiB (10,485,760 bytes)**. Supported formats remain PDF, Excel XLSX, JPEG and PNG. Customers first confirm their email, upload their files, then explicitly select **Send files for review**. A successful upload alone does not send the completed quotation to sales or reserve stock.

Uploads use at most **1 MiB per HTTP request**, comfortably within the hosting platform's request size boundary. The form shows progress, retains the selected file after a failed request, and can resume the parts already saved when the customer retries from the same page within one hour. Discarding an unfinished selection removes its staging data. If a save succeeded but its response was lost, the form refreshes the saved-file list and explicitly explains that the already saved attachment was not deleted.

Public instructions and progress/error text are available in English and Arabic. Older clients using the original endpoint continue to work with its 2 MiB transport limit. Ordinary product-enquiry photographs retain their existing 2 MiB limit.

Owner and sales staff open **Enquiry attachments → Review / download file**, which now leads to `/staff/files/<attachment ID>`. The private downloader retrieves one small part at a time, checks the final size and SHA-256 digest in the browser, then offers the file for saving. Every part request checks the current authenticated staff access. Original download links continue to work; larger files redirect to this private download page.

PDF and XLSX downloads require explicit acknowledgment that the document has **not** been automatically virus scanned. Staff should scan it with the organisation's security software before opening it, leaving macros and external content disabled. The website neither previews nor executes these documents.

## Storage and security approach

- The existing private Neon database remains the storage provider. No customer file is sent to a new provider, external scanner or public storage bucket.
- Upload initiation reserves both a file slot and its full declared byte count under the existing PostgreSQL advisory lock. Legacy and segmented uploads share the same count and quota checks.
- Each upload is bound to the confirmed enquiry, the hash of the exact upload grant, a random upload ID, filename, MIME type, declared byte count and whole-file SHA-256 digest.
- Each part has a strict expected length, index and content digest. Identical retries are idempotent; changed bytes under an existing part ID are rejected.
- Staged and completed parts use AES-256-GCM encryption with fresh random nonces and enquiry/upload/part binding. Staged bytes are never exposed to staff.
- Full-file length and digest verification precede PDF/XLSX format restrictions or photo reconstruction. Successful validation is required before an attachment appears in the staff collection. Format checks do not constitute antivirus scanning.
- Expensive cloud reads, hashing and photo reconstruction run outside the quota lock. Ciphertext is read one part at a time. Promotion rechecks the exact, still-valid session and quota under the lock, atomically inserts the completed attachment and encrypted parts, deletes staging parts and records completion. Unchanged PDF/XLSX ciphertext is copied directly inside PostgreSQL rather than being sent back over the network. Reconstructed photos use bounded encrypted-part writes. Both paths preserve the same authenticated enquiry/upload/part identity.
- The final file remains independently encrypted in small parts. A one-part download does not read and decrypt the whole large document repeatedly. Metadata requests omit the encrypted content.
- Partial uploads expire after **one hour**. Completion receipts remain for **24 hours** to make lost-response retries safe. Final files expire after **30 days**. The existing enabled retention worker removes expired rows and their related encrypted parts.
- **64 MiB logical storage quota** remains shared across completed attachments and active upload reservations. This is an operating limit, not 64 MiB for each customer. Two customers each uploading three maximum-size files use 60 MiB. Further capacity or retention changes require a business/storage decision.
- Request rate limits and actual streamed-byte checks apply independently of the declared `Content-Length`. Mutation endpoints require the configured same origin; download responses are private, not cached and excluded from search.

## Migration and deployment

Migration: `20261016_160000_quotation_upload_chunks`.

It widens the existing attachment byte-count check from 2 MiB to 10 MiB and creates `quotation_upload_sessions`, `quotation_upload_chunks` and `enquiry_attachment_parts`. Existing attachment rows and ciphertext are not rewritten. The new private tables are not CMS collections and have no public REST endpoint. Migration rollback refuses to proceed while segmented files, large attachments or upload sessions remain.

Apply the migration before activating this application version, using the project's normal environment-checked Payload migration process. Do not run development checks against production. No production writes were performed by the upload implementation subtask.

## Verification

- A new exact-10-MiB validation/encryption regression first failed against the former 2-MiB implementation, then succeeded after the size change.
- Unit coverage checks actual stream overflow despite a forged content length, grant/origin/rate boundaries, metadata restrictions, chunk indices, document acknowledgment, private response headers and large legacy-link redirection.
- The development integration script is `scripts/check-quotation-chunks.ts`. It verifies the dedicated development/CI destination before creating an empty temporary schema; fixtures never enter the shared public schema. It covers concurrent starts and parts, cross-enquiry/grant rejection, changed retries, incomplete/invalid files, whole-file hashes, file-count and global quota races, full 10-MiB completion, private part reads, lost-completion cancellation, expiry, finalization and legacy compatibility. Only synthetic documents are used and the test schema is removed afterward.
- The isolated cloud fixture intentionally uses a five-second PostgreSQL lock timeout. A simultaneous completion request can receive transient `55P03` while the first atomic insertion is still running; the test waits for both attempts and requires the identical retry to find the one completed receipt. This does not duplicate the attachment.
- The early cloud regression also exposed its 15-second statement timeout on a bulk ciphertext transfer. Reading bounded parts and promoting unchanged ciphertext inside PostgreSQL removed that transfer; the final isolated regression completed with **exit 0** and removed its owned schema.
- Final local TypeScript check completed with **exit 0**. The complete local unit suite completed **217 tests, 217 successful, zero failures**. The database run covered the final per-part storage design, including both the first and last private download part and full 10-MiB integrity.
- Evidence: `artifacts/quotation-chunks-db-2026-10-16.log`, `artifacts/important-final-types.log` and `artifacts/important-final-unit.log`. The database driver emitted a warning about its future SSL-option semantics; no database assertion or operation failed in the final run.
- No synthetic production enquiry or customer email was created for these checks. Built-route/browser and production verification remain the parent release's responsibility; this local record does not claim they have already run.

## Remaining decision

Automatic document malware scanning is not claimed or silently enabled. Sending private quotations to a scanning provider, or introducing a maintained scanner service, requires an approved destination and operating arrangement. Until then, the explicit staff warning and local scanning step remain part of the workflow. The three-file/10-MiB upload improvement is independent of that decision.
