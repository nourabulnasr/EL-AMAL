# Implementation phase status — 19 September 2026

## 24 September update — work independent of catalogue

Phase1 security upgrade is live and verified. Phase3 now has a tested persistence service and protected owner/sales enquiry collection: server-resolved immutable item snapshots, request-key deduplication including simultaneous retries, status/internal notes, and denied public creation/read. The public form remains preview-only. No real enquiry submission, outgoing email, verification, attachment upload or stock reservation is active. See PROGRESS.md for deployment status of the inbox increment.

Work that can continue before catalogue intake: enquiry HTTP/form integration and abuse controls; email outbox/verification mechanics (delivery needs sender setup); private uploads/scanning integration; stock ledger and reservation logic using isolated synthetic SKUs; remaining content-page structures; accessibility/performance/role/restore tests. Final business wording/assets, sender configuration, stock timing policies, real catalogue/SKUs and operational opening stock remain separate inputs. Do not label any entire phase complete because its foundation exists.

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

## UI/UX across the phases
- Phase 1: information architecture and approved design direction (Precision in steel); basic admin foundation.
- Phase 2: main public UI/UX — typography, colour, navigation, bilingual/RTL layouts, responsive homepage/catalogue/product detail, search/filter states, basket interactions and accessibility. Initial interface exists; authentic assets, full interaction states, usability/performance verification and Nour's visual approval remain.
- Phase 3: enquiry form, validation, attachment, verification, confirmation and staff enquiry experience.
- Phase 4: stock status, reservation/expiry/dispatch feedback and staff inventory workflows.
- Phase 5: remaining content page design, visual consistency, final assets, copy and agreed motion polish.
- Phase 6: full mobile/desktop/RTL, keyboard/accessibility and end-to-end usability acceptance. UI/UX is continuous, not deferred until phase5.

Browser login follow-up: used the existing hosted credentials through the live form in the user's in-app browser. Navigation reached /admin with Dashboard visible. No credential change was needed. Earlier failure was not reproduced and its cause is unconfirmed.

Catalogue integration checkpoint: shared CMS-to-public adapter is implemented, with explicit demo/cms source selection and separate baskets. Public review remains in demo mode while actual products are deferred. Unit tests20, TypeScript and development database publish/draft isolation/unpublish checks succeeded. Full CMS-mode browser verification remains pending: local Next processes exited during compilation; local production build compiled but could not spawn its TypeScript worker. Cloud build and live demo browser checks are being verified separately. Do not mark phase2 complete or imply catalogue activation.
Cloud build for01bbf9e succeeded and stable client alias updated. Deployed demo search/detail/basket/refresh/Arabic switch verified in browser; temporary basket item removed. Next: finish CMS-mode rendering verification before activation, continue role-permission and enquiry groundwork while real catalogue intake is deferred.

UI/UX implementation20 September: hero spring/scroll motion, navigation glass treatment, catalogue category tabs/filter chips/empty states, product guidance and bilingual enquiry-form preview implemented. Actual submission, uploads, email verification and stock remain pending. Visual approval remains Nour's; browser verification recorded in PROGRESS.md.
