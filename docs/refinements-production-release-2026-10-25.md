# EL AMAL production release — verified 25 October 2026

The requested refinements are live at https://www.al-amaleg.com/en and https://www.al-amaleg.com/ar. This record supersedes the review-only status in the 24 October checkpoint. Publication took place on 24 October; the final production crawl and service check completed early on 25 October, Cairo time.

## Published application

- Commit: 0562013950c47c33de79127a7d294aff2c8240b1.
- Production branch: codex/el-amal-foundation.
- Vercel production deployment: HKB13UaGVTmdug6c8FD8gimA66y7, Ready/success.
- GitHub deployment: 7302915531.
- Deployment URL: https://el-amal-mzimz6yai-nour-abulnasrs-projects.vercel.app.
- Nour explicitly requested publication after the remaining dependency findings were disclosed. This is permission to publish, not a claim that those findings are resolved.
- The reviewed source was fast-forwarded to the production branch and built with production settings. The isolated preview database/environment was not promoted. No database migration, environment change, customer-record mutation or test email was part of this release.

## What customers now see

1. English and Arabic homepage wording: “In a world full of choices, choose EL-AMAL.” The existing progressive scroll reveal retains server-rendered text and reduced-motion support.
2. Home and About share a framed WIKA distributor statement, alongside manufacturer/application information. Arabic follows the mirrored reading order. The owner's confirmed distributor relationship is published without inventing exclusivity.
3. Pressure and Temperature start with the requested former page-three product cohorts. Pressure prioritises 11 model groups; Temperature prioritises 24. Filters and exact-model search ranking remain applicable, with all other products retained.
4. Product pages place the expandable complementary Suggestions control beside the quotation controls. It exposes three relevant accessories/components with compact photographs and configuration guidance, in both languages. It uses native keyboard-operable details rather than an interrupting timed popup.
5. Next.js 16.4.3 and the DOMPurify package override 3.4.17 are included. A scheduler request guard limits actual request bytes to 64 KiB, rejects unsigned POSTs before body reading and rejects compressed bodies. The SDK still verifies signatures; customer file limits are unchanged.

The existing 165 published product groups, industry filters, product search, interactive illustrative homepage models, staff reports and quotation-upload journey remain available.

## Evidence after publication

| Check | Result and scope |
| --- | --- |
| Vercel | Exact source commit built and reached production Ready/success. |
| Bilingual release responses | All 12 targeted public routes returned HTTP 200 with no covered issues: Home, About, Pressure, Temperature, gauge cms-156 and valve cms-138 in both languages. Assertions cover the slogan reveal wrappers, WIKA section, priority cohorts, search and Suggestions placement. |
| Full public technical SEO crawl | Completed 25 October at 02:36 Cairo: 372 public pages, 372 sitemap entries and 169 image assets, zero issues in covered response/metadata/canonical/language/schema/link/robots/route-guard checks. Both languages have 165 product pages. |
| Public quotation capability | HTTP 200; ordinary RFQ and existing-quotation submission capabilities both enabled. This is a capability check, not a new customer submission. |
| Database aggregate | Read-only count: 165 total product groups, all 165 published. No customer records exported. |
| Delivery worker | Read-only health check at 02:33 Cairo found a completed run at 02:30 Cairo, after deployment; freshness check succeeded. No new test email was sent. |
| Live browser | English gauge Suggestions opened by click and collapsed with Return. Switching to Arabic retained the product, catalogue search and translated Suggestions; opening displayed a shut-off valve, snubber and syphons with Arabic links. Production screenshot saved. |

Local evidence: artifacts/2026-10-24/production/bilingual-release.json; artifacts/2026-10-25/production/seo-live-audit.json; artifacts/2026-10-25/production/intake-health.json; artifacts/2026-10-25/production/suggestions-ar-live.png.

Prior preview checks also covered Arabic 390/320px overflow, About mobile stacking, category cohort equality and complementary navigation. Those are dated preview evidence, not a newly repeated exhaustive production device audit.

## Security and verification still open

**Publication is complete; the security audit is not green.** No dependency gate or security check was disabled and no advisory exception was added.

- Zod/Inngest advisory GHSA-mrhx-c7xc-m3w5 remains unresolved. The installed SDK imports zod/v3. Forcing a v4 package version does not demonstrate repair of that imported parser. The 64 KiB request guard reduces exposure but does not close the advisory.
- Payload's Monaco editor sanitiser needs actual browser-runtime remediation and verification. Updating an npm DOMPurify override does not prove that vendored or CDN-loaded copies were replaced.
- Exact-source GitHub Actions run 40121520330 completed unit/permission and TypeScript steps, then failed the dependency advisory gate. Later database integration, build and runtime-regression steps were skipped. Vercel independently built successfully; this does not make the full CI run successful. Those skipped checks remain engineering work.
- Eight focused scheduler tests, including a valid signed dispatch to a fake callback, succeeded before publication. The live worker health adds production evidence without testing real customer mail again.
- Closed-panel analytics impression visibility, fresh final-release performance/accessibility measurements, native zoom/screen-reader/physical-device checks and field Core Web Vitals are not all verified. Historical performance scores must not be presented as fresh measurements.

## Remaining client and operating decisions

See [the maintained action register](final-client-inputs.md) for the complete list. It retains company/CEO content, address/hours and WhatsApp confirmation, genuine owner recovery/mailbox acceptance, staff roles, privacy/retention approval, attachment capacity/scanning decisions and backup responsibility. External Checkly monitoring remains deferred by Nour. The already confirmed domain, logo, telephone, owner email, WIKA relationship and supplied products do not need to be supplied again.

SEO checks establish technical eligibility, not Google's decision to index every URL or rank first. Private/admin/basket/verification and duplicate filter routes remain deliberately excluded. No zero-vulnerability, universal performance score or guaranteed ranking is claimed.

Admin instructions remain in [the client admin guide](client-admin-guide.md). This documentation update is saved on the review branch; it does not change the published application commit above.
