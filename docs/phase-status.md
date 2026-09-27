# EL AMAL delivery status — 28 September 2026

This replaces the outdated 19/24 September phase checklist. Latest implementation/deployment evidence remains in PROGRESS.md.

## Overall estimate: about 70% of the full planned scope

This is an engineering estimate of scope completed, not a measured quality score, a delivery-date forecast or a security/SEO rating. It includes real content, operational enquiries, stock and launch acceptance. Rounded to the nearest five percentage points; allow roughly five points of uncertainty as final business scope is confirmed.

| Workstream | Approximate completion | Scope weight | Delivered | Remaining |
|---|---:|---:|---|---|
| Foundation and hosting | 90% | 15% | Next.js/React, Payload admin, hosted owner login, staff roles, separate Neon development/hosted PostgreSQL, migrations, GitHub and Vercel continuous review | Operational account recovery, complete role checks and staff handover |
| Public interface and motion | 85% | 20% | EN/AR/RTL, navy/white/orange theme, responsive homepage, navigation, catalogue/detail/basket/direct RFQ, industry pages, hover/press/focus/reduced-motion behavior; approved instrument opening/loading fallback; About, Contact and Resources pages | Final brand imagery, approved company/contact content and policy pages, comprehensive usability/accessibility/device review and visual approval |
| Catalogue and business content | 85% | 15% | All 151 photographed model groups published, 151 genuine manufacturer images, 560 bilingual specification rows, verified technical downloads, dated 90/61 availability, idempotent import, model search/filters, 24-card pagination and private draft isolation | Exact offered configurations, final technical/content acceptance, genuine WIKA relationship evidence and actual company/contact information |
| Enquiries and email | 70% | 20% | Form preview/validation, staff-test saving, immutable snapshots, duplicate protection, private inbox/statuses, single-use verification, encrypted email queue, protected retry workers, verification-gated staff notification, guarded public submission/resend and durable per-visitor/per-email limits | Activation and real delivery tests, private uploads/scanning, sender configuration, scheduling, real delivery/recovery tests |
| Inventory and reservations | 10% | 10% | Private SKU structure and import validation | Stock ledger, availability, verified allocation, concurrency-safe holds, expiry/release/dispatch, reconciliation and staff screens |
| SEO, security and release acceptance | 50% | 20% | Canonical/hreflang including pagination, real product image/manufacturer schema, metadata/social image, gated sitemap/robots, server validation/access controls, security headers and dependency patches, 65 unit tests plus development DB regression and sampled live browser/API checks | Full device/accessibility/performance audits, queue-capacity/abuse monitoring, monitoring/backups/restore rehearsal, remaining dependency review, final content SEO/Search Console, privacy/retention policies and launch acceptance |

Weighted estimate: 68.25%, reported as approximately 70%. The percentage is not the average of only the visible pages. All 151 entries from the 29 supplied main pages are now published in the hosted CMS and live website. The remaining catalogue/business-content scope concerns exact commercial configurations, client acceptance and company evidence; the broad website scope still includes substantial operational work. These entries are printed model groups, not 151 counted SKUs. See docs/catalogue-publication-2026-09-28.md. Security and SEO percentages must never be described as proof of protection, ranking or certification.

## What is actually delivered and how

- Client review: https://el-amal-sigma.vercel.app/en and /ar. The site now displays all 151 real catalogue entries with actual manufacturer images and bilingual specifications. Availability is a dated model-level report, subject to quotation confirmation.
- Administration: https://el-amal-sigma.vercel.app/admin. Payload CMS controls structured records and staff access. The public catalogue reads published CMS records; private source/reviewer/SKU records remain restricted.
- Source and backups of code: local project plus https://github.com/nourabulnasr/EL-AMAL, branch codex/el-amal-foundation. The connected Vercel project builds updates. Git is not a backup of the live database.
- Database: Neon PostgreSQL provisioned through Vercel Marketplace, with distinct development and hosted databases. Credentials stay in ignored environment files/platform settings.
- Delivery evidence: PROGRESS.md records tested commits/deployments. Test runs use fake mail transports and disposable records; no genuine customer email delivery is claimed.
- Latest catalogue release: 43faaf8; Vercel production dpl_FeT8KpWkJPLkP6VAjjbtKEuRhfEH Ready and GitHub quality run 36351279324 succeeded. Live 151-image hash checks, anonymous privacy checks, EN/AR search/details/pagination and quote-basket persistence succeeded. Enquiry sending and indexing remain disabled.

## Remaining work owned by development

1. Activated customer enquiry browser/delivery tests once the sender and scheduled workers are ready; queue-capacity and abuse monitoring. Public submission/resend code and development database tests are implemented.
2. Private attachments with authorization, file-type/size validation, scanning/quarantine and retention.
3. Inventory ledger, reservation lifecycle, expiry jobs, reconciliation and staff experience using synthetic data until real stock arrives.
4. Operational account recovery, scheduling, delivery monitoring, error monitoring and backup/restore procedures; privacy-aware demand reporting/analytics and protected exports.
5. Policy pages and approved company-specific content; About/Contact/Resources structures and bilingual enquiry guidance are implemented.
6. End-to-end customer/staff/permission tests; device/RTL/keyboard/accessibility audits; measured mobile performance and regression fixes.
7. Final metadata/content audit, live-domain configuration, Search Console/indexing activation after real content and launch approval.

## Remaining inputs owned by Nour/client — collected at the end

- Catalogue publication is complete; every model on each main page inherits its source-folder stock label, as Nour confirmed. Exact offered configurations and final technical/content acceptance remain. No further catalogue ZIP is required for these 29 supplied pages.
- Final logo, approved company photographs and approved company facts/copy/translations. Product images for the supplied catalogue are delivered.
- Business phone/WhatsApp/address/hours and genuine WIKA relationship evidence/approved wording.
- Final domain and verified sending account/domain. Receiving inbox is already confirmed and need not be supplied again. Secrets are configured privately, not pasted into chat.
- Actual opening stock, exact SKU definitions and approved hold/expiry/dispatch policy.
- Strong unique owner password; MFA enrollment when available in the chosen authentication configuration; final staff roles.
- Review of privacy/retention/business wording, visual approval and final launch acceptance.

## Quality direction beyond functional completion

Use the Capitolium reference for deliberate entrance, strong typography and coherent art direction, with EL AMAL's instrument vocabulary. Original product photography/approved 3D assets, a genuinely helpful technical selection journey, carefully edited Arabic/English content and real evidence of company capability will improve the site more than stacking unrelated effects.

Target Core Web Vitals: LCP<=2.5s, INP<=200ms and CLS<=0.1 at the75th percentile, mobile and desktop. These are targets, not current measured results. Sources: https://web.dev/articles/vitals and https://developers.google.com/search/docs/essentials. Reference reviewed: https://www.collabcapitolium.fr/.

A top-ten regional award or Google position cannot be guaranteed. A finished, distinctive and demonstrably usable website can be submitted for independent design evaluation; ranking depends on the evaluator/competition and, for search, the query and market.
