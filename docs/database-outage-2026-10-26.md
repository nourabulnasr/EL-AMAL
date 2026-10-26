# Database outage — 26–27 October 2026

## Confirmed cause

The production Neon project el-amal-hosted exhausted its monthly network-transfer allowance. Direct PostgreSQL connection returned SQLSTATE 53000 with the provider quota error. Public EN/AR home, catalogue and About routes returned HTTP 500. robots.txt and the configuration-only enquiry capability endpoint still returned 200; those responses do not establish database or submission health.

The authenticated Neon dashboard showed 5.5 GB network transfer, 36.59 MB storage and 79.81 CU-hours since 1 October. Billing period displayed 1 October–1 November. Production source remained 0562013950c47c33de79127a7d294aff2c8240b1. This is a provider availability incident, not evidence of data deletion.

## Recovery action

Nour verified the Neon/Vercel sign-in and selected “I’ll upgrade Launch now”. Completion of the upgrade has not yet been verified. The displayed Launch rates were $0.106/CU-hour and $0.35/GB-month; the installation plan applies to both connected databases. These are not a fixed monthly quotation or a complete billing schedule. No purchase, plan change, deletion, data migration or provider limit bypass was performed by the agent.

## Transfer reduction prepared

The catalogue previously loaded every full published product and category for every new page request. React cache only deduplicated within that request. This is avoidable transfer, although its exact share of the exhausted allowance has not been measured.

The targeted fix reads only IDs and update timestamps on each request and reuses a cached public catalogue projection when that revision is unchanged. Both membership and timestamps enter the key, so unpublishing, deletion and edits take effect on the next request. Database and release identity isolate cache entries. Cache refresh is bounded to 300 seconds. Private review/source metadata is not stored in the public projection. A failed publication check still fails closed rather than showing potentially withdrawn or invented products. This reduction cannot restore an already exhausted provider allowance.

Implementation references: installed Next.js unstable_cache documentation and https://payloadcms.com/docs/queries/select. The existing app does not opt into Cache Components; this targeted fix does not migrate the entire rendering architecture.

## Verification at this checkpoint

- Reproduction: EN/AR home, EN catalogue and About returned 500; direct DB connection returned quota denial.
- New regression failed before the fix: two requests performed four full collection reads instead of two.
- Targeted catalogue tests: 14 passed after the fix, including withdrawals, edits, projection privacy and read failures.
- Full local Node22 serial run: 252 passed, zero failed. This tree includes earlier uncommitted security work; it is not a clean release verification.
- TypeScript completed successfully with a bounded heap. Initial parallel tests and typecheck exhausted Windows memory; the successful serial rerun supersedes that attempt.
- Independent code review found no blocking issue; query-contract assertions were strengthened on its recommendation. Concurrent cold requests can still each fetch records. Hosted cache/runtime verification and release remain pending. No claim of restored production service is made.

Evidence: artifacts/2026-10-26 public responses and outage-tests.log. Avoid repeated whole-site crawls during quota recovery. After access is restored, verify DB health, a small bilingual route sample, product count, delivery-worker freshness and representative admin access.

## Hosted checkpoint — 27 October

Reviewed patch aa2699aa5925c0066b27c9700186cf95941493af is pushed to codex/hero-review-and-quotation. Vercel preview TnoxHRVxB414YWk89QB4HBsFAqnU / GitHub deployment7343864506 completed successfully at https://el-amal-bfi2s7p6a-nour-abulnasrs-projects.vercel.app. Cloud quality40403283012 passed units and TypeScript but stopped at the existing dependency-advisory gate; downstream isolated database/build/runtime checks were skipped. No gate was weakened. Production was not changed. The last direct production database check still returned quota denial.

Anonymous EN/AR preview probes redirect to Vercel SSO (302). Browser control became unavailable during this turn, so authenticated hosted runtime checks remain unverified. No preview protection was disabled.
