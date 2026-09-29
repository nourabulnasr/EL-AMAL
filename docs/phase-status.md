# EL AMAL delivery status — 29 September 2026

See PROGRESS.md for deployed commits, measurements and limitations. Older dated plans are historical.

## Overall scope estimate: about 85%

Weighted estimate84%, rounded to the nearest five points, with roughly five points of uncertainty. This estimates completed scope, not quality, security, search ranking or a delivery deadline. Implemented features and operational activation are distinct.

| Workstream | Completion | Weight | Delivered | Remaining |
|---|---:|---:|---|---|
| Foundation and hosting | 95% | 15% | Live Next.js/Payload, owner sign-in/roles, separate Neon databases, migrations, GitHub/Vercel, isolated CMS cloud build/runtime checks | Activate recovery delivery, staff setup/training |
| Interface and motion | 90% | 20% | EN/AR/RTL, approved navy/white/orange design/entrance, responsive catalogue/search/basket/RFQ/information pages; sampled mobile/keyboard/reduced-motion/no-JavaScript checks | Final brand/business/policy content, broader assistive-technology/device review, client approval |
| Catalogue and content | 85% | 15% | All151 supplied groups,151 genuine images,560 bilingual specification rows,159 verified downloads, dated90/61 availability | Exact configurations, technical/Arabic acceptance, genuine company/WIKA/contact evidence |
| Enquiries and email | 80% | 20% | Private inbox, immutable requests, retry-safe verification/notification outboxes, abuse/queue-health controls, encrypted JPEG/PNG uploads, recovery safeguards | Owned sender, frequent scheduler, real delivery/recovery/photo acceptance, broader PDF/Excel scanning/storage |
| Inventory | 80% | 10% | Ledger, receipts/adjustments, verified exact-SKU holds, release/expiry/full-hold dispatch/reconciliation, concurrency/roles and private console | Exact SKUs/counts, policy acceptance, proposed partial-dispatch/blocked-stock/freshness behavior, staff walkthrough |
| SEO, security and release | 75% | 20% | Public indexing,342-page/155-asset crawl without detected technical issues, metadata/hreflang/schema/sitemap; access/encryption/reset hardening,122 tests, isolated DB regressions, daily maintenance and sampled browser audits | Search Console/domain, field performance, external alerts, complete restore rehearsal, demand reporting/exports, wider acceptance and remaining moderate development-dependency review |

## Available now

- Website: https://el-amal-sigma.vercel.app/en and /ar, including the actual catalogue.
- Administration: https://el-amal-sigma.vercel.app/admin. Stock console: /staff/inventory, using the same staff account and role checks.
- Source: https://github.com/nourabulnasr/EL-AMAL, branch codex/el-amal-foundation, and this local workspace. Git does not back up live database records or ignored secrets.
- Neon PostgreSQL stores catalogue, operational records and bounded encrypted photos. Hosted/development databases remain separate.
- Eligible public pages are indexable; actual Google indexing and Search Console submission are not claimed.
- Native daily maintenance is registered and a protected live invocation succeeded with zero mail attempts. It does not establish email readiness.

Customer submission, confirmation mail and emailed password recovery remain off until sender/frequent-worker setup is complete. The confirmed iCloud receiving inbox is not a verified sending domain. Photo code is deployed, but normal customer access requires confirmation mail first. Production has zero exact SKU definitions; catalogue stock labels never create counted stock.

## Remaining development and operational acceptance

1. Provision the verified sender and frequent scheduler; verify customer receipt, confirmation, staff notification, retry, photos and recovery end to end. Hobby daily cron serves maintenance only.
2. Resolve and implement the proposed PDF/XLSX/10MB upload requirement using real quarantine/scanning/private storage. Current support is three JPEG/PNG photos,2MiB each,8MP,30-day access and64MiB logical total capacity; it is not equivalent to the broader proposal.
3. Confirm the stock policy and implement required partial dispatch, blocked balances and stock freshness. Current dispatch consumes a complete hold. Rehearse real staff tasks when SKUs/counts arrive.
4. Complete protected demand reporting/exports, external alerts and independent database backup/restore rehearsal, including encryption keys. A successful code rollback is not database restoration.
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
