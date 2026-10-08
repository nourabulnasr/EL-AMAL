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

## Live application release

Production now runs `470462660d4d225fc94bfa85fda23c4290e40b1d` on `codex/el-amal-foundation`. Vercel deployment `dpl_C228AsHvRM5BH16vH1kwRnkfH15T` is Ready and assigned to the stable client domain. The build took about 63 seconds.

- Public website: https://el-amal-sigma.vercel.app/en
- Private product-interest report: https://el-amal-sigma.vercel.app/staff/products
- Deployment: https://el-amal-mmzjc9mbn-nour-abulnasrs-projects.vercel.app
- Fresh production CI: https://github.com/nourabulnasr/EL-AMAL/actions/runs/37713816147

The CLI device sign-in expired while waiting. The already authenticated Vercel browser session was sufficient to verify the correct project and set `PRODUCT_ANALYTICS_ENABLED=true` for Production only. The existing Git production connection built the tested source. No preview environment or paid service was enabled. Nour subsequently confirmed authorizing the CLI device link; renewed CLI credentials were not needed or confirmed for this release.

## Live verification

All 28 checks in `artifacts/analytics-live-verification.json` succeeded. They cover seven EN/AR public/login routes; anonymous denial of the report, SKU and attachment APIs; privacy-signal and cross-origin exclusions; no measurement without consent; existing owner authentication; staff exclusion; secure signed session creation; actual event persistence; duplicate suppression; report aggregation; private response caching; CSV download; consent withdrawal; and deletion of only the controlled test session's two measurement rows.

An initial diagnostic script omitted the same-origin metadata that Payload requires for cookie authentication. Its report request correctly received403; adding `Origin` reproduced the browser's allowed request. No application permission guard was weakened. Both test runs removed their own synthetic rows. No test measurements remain in the report, and no historical customer activity was invented.

Browser verification used the actual production application: owner login, successful automatic and manual report refresh, an empty report after test cleanup, and Arabic mobile consent settings/decline. At390px the Arabic page's content width was375px; no horizontal overflow was measured. No captured browser error entries appeared for the report or catalogue. Screenshots: `artifacts/product-interest-live-report.jpg`, `artifacts/product-interest-live-detail.jpg`, `artifacts/product-analytics-live-ar-mobile.jpg` and `artifacts/product-analytics-production-setting.jpg`.

The existing protected daily maintenance endpoint returned200 with outcome `maintenance`, zero processed messages, zero accepted messages and zero failures. This confirms maintenance execution including analytics expiry cleanup; it is not a frequent email worker or a claim of actual expired-record deletion when none were due. The configured Vercel cron remains daily at02:00UTC.

Fresh production CI succeeded on the exact released commit, including unit/permission checks, TypeScript, the dependency advisory gate, disposable database migrations/regressions, the production build and built-server route checks.

## Remaining boundaries

The quotation code and schema are now deployed, but the real customer submission/upload journey remains unavailable until the verified sender and frequent healthy delivery worker are configured and tested. The review notice continues to say that enquiry submission and stock reservations are unavailable. Quotation documents remain limited to the documented2MiB per-file bound and are unscanned.

Measurements start now for consenting visitors. The report covers product interest, not sales or unique people. Owner/sales staff can open it from the admin dashboard or staff navigation. The separate demand report also refreshes every30seconds while visible.

Domain/Search Console access, actual company/contact/WIKA facts, stronger individual staff credentials, final privacy/content acceptance, and exact SKU/opening-stock inputs where stock commitments are required remain owner/client dependencies. Broader proposal and operational limitations remain in the handbook checklist; this release does not claim full-launch completion. Monitoring stays deferred at Nour's request.
