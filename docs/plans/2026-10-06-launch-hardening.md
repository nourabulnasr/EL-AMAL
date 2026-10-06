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
- Final review: independent reviewer found auth snapshot writes bypassing collection hooks and parallel individual updates sharing a transaction. Added real login/reset overlap and shared-transaction tests: 3 failures reproduced, then all 22 admin checks succeeded after the fixes. Role intent is now captured before Payload hydrates omitted values. A scoped adapter guard strips stale roles from staff writes and performs explicit role changes with an atomic predicate/update inside the active transaction. No dependency source patch or schema migration.
- Final: fixed auth snapshot overwrite and shared-transaction demotion — overlapping login/reset and shared-transaction checks RED→GREEN, admin suite 22/22.
- Final: Ruling: real credentials, sender setup, hosted migration and visual acceptance remain external gates; no approval or success is inferred from this code review. Cost if ignored: an operationally incomplete launch.
- Final: Ruling: cloud build compatibility requires successful CI and deployed runtime verification, beyond source review. Cost if ignored: a build-only or runtime-incompatible release.
- Final: Ruling: privileged SQL/adapter deletion is outside application staff controls. Production SQL access remains restricted; this safeguard is not a database-wide invariant. Cost if violated: a privileged operator can still remove all owners.
- Task 3: complete.142 units, TypeScript,22 isolated admin regressions and full cloud CI37393004564 succeeded on469ab5d. Production-branch CI37393307744 also succeeded, including all-severity audit and actual CMS build/runtime checks.
- Task 4: complete.469ab5d is live at the stable alias via el-amal-f8nhpc4fl-nour-abulnasrs-projects.vercel.app.10 scoped HTTP checks succeeded; browser login layout and no observed errors confirmed. Quotation branch synchronized as975fc3b;152 combined units/TypeScript and full cloud run37393952454 succeeded. Quotation remains review-only with no hosted migration.
- Task 5: current release/admin/SEO/launch runbooks updated. No hosted migration, private-data export, customer mail or real staff change occurred.
