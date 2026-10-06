# EL AMAL delivery status — 6 October 2026

**Latest update:** The client selected Precision Revealed. The approved hero and layout-stability/security follow-up are live at63acd5b. Final lab measurements: mobile95/desktop99 performance, CLS0, accessibility/best-practices/SEO100. See [the6 October hero release record](precision-release-2026-10-06.md) for exact versions, tests, performance and live status. Existing quotations remain implemented/tested on the review branch; private backup authorization and real sender/worker setup still gate production activation. Hero selection is no longer pending.

See PROGRESS.md for deployed commits, measurements and limitations. Older dated plans are historical.

Current checkpoint: [6 October security and launch record](operations-release-2026-10-06.md). The lighter-blue/scroll refinements, Next security patch and staff-ownership/dependency hardening are live at `469ab5d`. All cloud checks and scoped production verification succeeded. The client selected Precision Revealed; see the latest update above. The prepared quotation feature is on a separate branch and is not production-active.

## Overall scope estimate: about 90%

The previous weighted estimate is 88%, rounded to the nearest five points, with roughly five points of uncertainty. It remains a rough scope estimate, not a new measurement or a claim of operational readiness, quality, security or search ranking. The following baseline percentages are retained while activation/acceptance gates remain open.

| Workstream | Completion | Weight | Delivered | Remaining |
|---|---:|---:|---|---|
| Foundation and hosting | 95% | 15% | Live Next.js/Payload, owner sign-in/roles, separate Neon databases, migrations, GitHub/Vercel, isolated CMS cloud build/runtime checks | Activate recovery delivery, staff setup/training |
| Interface and motion | 90% | 20% | EN/AR/RTL, approved navy/white/orange design/entrance, responsive catalogue/search/basket/RFQ/information pages; sampled mobile/keyboard/reduced-motion/no-JavaScript checks | Final brand/business/policy content, broader assistive-technology/device review, client approval |
| Catalogue and content | 85% | 15% | All151 supplied groups,151 genuine images,560 bilingual specification rows,159 verified downloads, dated90/61 availability | Exact configurations, technical/Arabic acceptance, genuine company/WIKA/contact evidence |
| Enquiries and email | 80% | 20% | Private inbox, immutable requests, retry-safe verification/notification outboxes, abuse/queue-health controls, encrypted JPEG/PNG uploads, recovery safeguards | Owned sender, frequent scheduler, real delivery/recovery/photo acceptance, broader PDF/Excel scanning/storage |
| Inventory | 95% | 10% | Ledger, receipts/adjustments, verified exact-SKU holds, partial release/dispatch, expiry, blocked stock, audited counts/optional freshness, reconciliation, concurrency/roles and private console | Exact SKUs/counts, policy acceptance, staff walkthrough |
| SEO, security and release | 85% | 20% | Public indexing,342-page/155-asset crawl without detected technical issues, metadata/hreflang/schema/sitemap; access/encryption/reset hardening,142 tests, isolated DB regressions, daily maintenance, mobile Lighthouse home89–91/product90 with LCP2.8–2.9s, private reports/exports, encrypted backup with full isolated restore and sampled browser audits | Search Console/domain, field performance, deferred external alerts, automatic offsite backups, wider acceptance (current npm advisory audit is clear) |

## Available now

- Website: https://el-amal-sigma.vercel.app/en and /ar, including the actual catalogue.
- Administration: https://el-amal-sigma.vercel.app/admin. Stock console: /staff/inventory. Demand reports: /staff/reports, using the same staff account and role checks.
- Source: https://github.com/nourabulnasr/EL-AMAL, branch codex/el-amal-foundation, and this local workspace. Git does not back up live database records or ignored secrets.
- Neon PostgreSQL stores catalogue, operational records and bounded encrypted photos. Hosted/development databases remain separate.
- Eligible public pages are indexable; actual Google indexing and Search Console submission are not claimed.
- Native daily maintenance is registered and a protected live invocation succeeded with zero mail attempts. It does not establish email readiness.

Customer submission, confirmation mail and emailed password recovery remain off until sender/frequent-worker setup is complete. The confirmed iCloud receiving inbox is not a verified sending domain. Photo code is deployed, but normal customer access requires confirmation mail first. Production has zero exact SKU definitions; catalogue stock labels never create counted stock. A new 6 October crawl checked all342 public pages/155 images with zero detected technical issues; Google indexing itself remains unverified.

## Remaining development and operational acceptance

1. Provision the verified sender and frequent scheduler; verify customer receipt, confirmation, staff notification, retry, photos and recovery end to end. Hobby daily cron serves maintenance only.
2. Release the implemented PDF/XLSX/photo existing-quotation route after explicit approval for the previously blocked pre-migration encrypted backup destination. The review branch passed full CI. It supports three2MiB files,64MiB logical shared capacity and30-day retention; PDF/XLSX documents are unscanned and require staff acknowledgment before download. Hosted migration and real email acceptance remain pending. Malware scanning and larger-file storage are separate hardening work, not delivered features.
3. Confirm the stock policy and configure its optional freshness threshold. Partial dispatch/release, blocked stock and audited count/freshness controls are implemented. Rehearse real staff tasks when SKUs/counts arrive.
4. Protected demand reporting/CSV and an independent encrypted database backup/restore rehearsal are complete. Schedule offsite backups with independent key custody and agreed retention/recovery targets. External monitoring is explicitly deferred by Nour.
5. Finalize approved company/policy content, broader screen-reader/device/form acceptance and representative performance verification. Automated scores do not establish full accessibility or field Core Web Vitals.
6. Configure the final domain and Search Console ownership/submission when available; observe search and real-traffic performance reports.

## Nour/client inputs — collected together

- Exact SKU configurations, opening quantities and approved reservation/dispatch policy. The supplied29 catalogue pages are already published; no repeat ZIP is needed.
- Final logo/company imagery, approved company facts and technical/English/Arabic acceptance.
- Phone/WhatsApp/address/hours and genuine WIKA relationship evidence/wording.
- Owned sending domain/address and provider authorization; final public domain if replacing the Vercel URL. Configure secrets privately. Receiving inbox is already confirmed.
- Strong unique replacement for the previously requested short owner password, final staff roles and appropriate MFA setup when supported.
- Privacy/retention wording, visual approval and operational launch acceptance.

No regional top-ten award or search position can be guaranteed. Original brand imagery, useful technical selection, strong bilingual content and genuine company evidence remain the most valuable design/content improvements.
