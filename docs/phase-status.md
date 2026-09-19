# Implementation phase status — 19 September 2026

Current position: phase 2 is underway, with phase 1 operational follow-ups. The live site is a client review deployment, not an operational launch.

## 1. Foundation — core built
Built: Next.js, Payload, separate development/hosted PostgreSQL databases, migrations, staff/category/product/private-SKU collections, role and publication rules, hosted owner login, protected admin and automatic Vercel deployment.
Remaining: full non-owner HTTP permission matrix, operational email/password recovery, backup/restore rehearsal, admin browser walkthrough and owner acceptance.

## 2. Catalogue — current phase
Built: English/Arabic homepage, catalogue/category/product routes, model search, filters, language switching/RTL, local persistent quote basket, sample records, import validation and initial browser/unit checks.
Remaining: connect public pages to reviewed CMS records (currently fixtures), ten reviewed bilingual pilot products then full catalogue/SKUs, supplied logo and authorised images, publishing-flow tests, full accessibility/performance checks and visual approval.

## 3. Enquiries / RFQ — backend pending
Built: local basket only; it does not submit or reserve anything.
Remaining: validated persistent submissions, immutable product/SKU snapshots, email verification tokens, private attachment validation/scanning, notification outbox/retries, staff enquiry workflow and end-to-end tests.

## 4. Stock — schema groundwork only
Built: private SKU schema and import input validation.
Remaining: inventory ledger/balances, verified exact-SKU allocation, expiry/release/dispatch, scheduled jobs, freshness policy, role enforcement, concurrency/idempotency/reconciliation tests and business approval of proposed verification/hold/staleness timings. On-hand stock decreases at dispatch.

## 5. Complete website — pending
Remaining: full reviewed catalogue rollout, industry pages, About/Contact/Resources/policies, final brand assets/content/translations, production metadata/schema/hreflang/sitemap/social previews, analytics/reporting and agreed motion. Demo labels/noindex stay until launch-ready.

## 6. Release acceptance — pending
Available: continuous client review hosting and automatic deployments.
Remaining: full T01–T14 acceptance, end-to-end enquiry/stock tests, security/role audit, mobile/RTL/accessibility and measured performance, final production data/mail, restore/rollback rehearsal, staff training/handover and owner/client approval.

## Hosted admin access
URL: https://el-amal-sigma.vercel.app/admin
Hosted credentials: ignored .env.hosted-owner.local. Development credentials: .env.owner.local (different password). Copy only values after the equals sign. Never commit or share credential files.
Latest live verification: hosted login200 with owner role and cookie-authenticated admin200; test session logged out. This verifies server authentication, not the owner's browser walkthrough.
