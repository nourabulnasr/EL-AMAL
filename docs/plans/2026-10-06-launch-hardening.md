# Independent launch hardening — 6 October 2026

Scope: protect the last staff owner, verify the current public technical SEO, and reconcile the launch documentation. Preserve the existing hero and keep the quotation database release separate.

1. Reproduce last-owner demotion in the existing isolated PostgreSQL admin regression. Cover a valid transfer, simultaneous demotions, rollback, missing transactions and bulk edits. Synthetic accounts only.
2. Add a transaction-scoped role-change guard. Serialize role changes with a non-blocking PostgreSQL advisory lock; read fresh owner state within that transaction; reject loss of the final owner. Staff edits are individual operations, avoiding bulk concurrency inside one transaction. No schema change.
3. Run focused regressions, existing unit checks, the dependency advisory gate and a fresh public SEO crawl. Use cloud CI for the full isolated database/build/runtime suite.
4. Obtain an independent final code review, address actionable findings, release only the verified production-compatible changes, then bring the same fix into the pending quotation branch.
5. Update PROGRESS.md, launch/status runbooks and memory with exact evidence and remaining dependencies.

External gates remain unchanged: client hero choice and business facts; sender and frequent delivery-worker authorization; domain/Search Console ownership; strong staff credentials and launch acceptance; explicit approval for the previously blocked private database backup export. Monitoring remains deferred. No customer email, real staff role change, production data export or hosted schema migration is part of this release.

## Verification ledger

- Production baseline: 96969af. Work branch: codex/launch-hardening-2026-10-06.
- Task 1: complete. The isolated regression reproduced loss of the final owner, bulk removal and simultaneous demotions against the production baseline. Fixtures were removed; no real accounts changed.
- Task 2: complete. After guarding transaction-scoped role changes and rejecting bulk staff edits, all 19 isolated admin checks succeeded, including transfer, contention, rollback and ordinary edits. Initial bulk detection was corrected after observing that Payload includes `id: undefined` in bulk arguments.
- Task 3: in progress. All 142 unit tests succeeded. Fresh public crawl: 342 pages, 342 sitemap entries, 155 images, no detected issues. An online npm audit found the newly reviewed braces advisory through Sass/Chokidar; scoped Sass 1.79.6 override removes that chain and installation reports zero known vulnerabilities. Full build/CI remains required.
- Dependency scope addition: keep the existing Payload/Next versions and override only the CMS Sass dependency. Sass 1.79.6 retains the existing compiler API and uses Chokidar 4 without braces. Official advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm.
- Pending: full CI, independent final review, production release and final documentation.
