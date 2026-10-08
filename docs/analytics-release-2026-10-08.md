# Product analytics and quotation release — 8 October 2026

Nour explicitly authorized the full encrypted production database backup to the previously named OneDrive destination and the subsequent release. That authorization supersedes the pending-backup gate in earlier records; do not ask for it again.

## Recovery copy

The approved file is `artifacts/backups/el-amal-2026-10-06-pre-quotation.enc`; the filename was retained to match the authorized destination, although the backup was created on 8 October. Its separately encrypted manifest is also present. The archive is 204,931 bytes and covers all 24 public application tables and 573 rows. The existing encryption key remains outside OneDrive.

Local verification authenticated both AES-GCM envelopes, matched the manifest's archive SHA-256 digest and checked the PostgreSQL custom archive using `pg_restore --list` (330 archive entries). Decrypted bytes stayed in memory; no plaintext file was written. Evidence: the adjacent `.local-verification.json` file.

A proposed restore rehearsal into a separate development Neon database was rejected by automatic approval review because authorization covered the encrypted laptop destination, not an additional transfer of decrypted private records. It did not execute. This release therefore has a verified readable/authenticated backup, not a newly completed full restore rehearsal. The earlier 29 September rehearsal remains dated historical evidence.

## Production database

The normal Payload migration runner successfully applied both reviewed additive migrations in batch 11:

- `20261001_120000_existing_quotations`
- `20261007_120000_product_interest`

An independent follow-up database read confirmed both migration records, the quotation request-kind column, the product-interest table and all 151 product records. Existing public application code is compatible with these additive changes. No existing enquiries, accounts or catalogue records were rewritten.

## Application release

Vercel authentication renewal is currently pending. The prepared application remains commit `470462660d4d225fc94bfa85fda23c4290e40b1d`, with complete successful CI recorded in `docs/product-interest.md`. Production deployment and analytics activation have not yet occurred in this checkpoint.

After authentication: verify the linked project, set production-only analytics configuration, release the tested code, check live public/private routes and the actual staff report. Keep email/RFQ intake disabled until the verified sender and frequent healthy delivery worker are configured and tested. Monitoring remains deferred by Nour.
