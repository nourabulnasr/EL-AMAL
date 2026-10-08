# EL AMAL delivery status - 8 October 2026

8 October release: per-product measured CTR, product views/basket/datasheet actions, owner/sales reports and CSV are live. Both product-interest and saved-demand reports refresh every30seconds while visible, with pause, last-success time and stale-error handling. Application4704626 passed the fresh complete production workflow37713816147 and28 live checks. Nour authorized the encrypted backup and release; local backup verification and both production migrations are complete. The separate cloud restore rehearsal remains unperformed. [Feature and admin guide](product-interest.md); [release evidence](analytics-release-2026-10-08.md).

Current detailed reference: [updated handbook](handbook/EL-AMAL-Website-Handbook.pdf), [browser version](handbook/EL-AMAL-Website-Handbook.html), and [subcategory readiness/checklist](handbook/current-readiness.md).

**Live for catalogue browsing and review; not yet a fully operational customer quotation service.** We are in completion and release acceptance. The original six increments and later six workstreams organize one project, not twelve phases. The old approximate 90% was a scope estimate, not a readiness score; use the acceptance checklist instead of silently raising it.

| Workstream | Delivered | Outstanding |
| --- | --- | --- |
| Foundation and hosting | Next.js/Payload, separate Neon databases, Vercel/GitHub, owner login/roles, isolated migration/build/runtime checks | Sender/recovery activation, final accounts, recovery operations |
| Interface and motion | Selected Precision Revealed in EN/AR; navy, pale blue, white/orange; intro; restrained desktop motion, static mobile, focus fixes | Final brand/business content, wider device/assistive-technology checks, client implementation acceptance |
| Catalogue and content | All 151 supplied groups, genuine photos, bilingual specifications/downloads; search/type/application/category routes | Technical/Arabic/rights acceptance, contacts/WIKA evidence; exact SKU/count data is separate |
| Enquiries and quotations | Basket/direct RFQ, private snapshots/queues, email proof/retries; PDF/XLSX/photo quotation code and schema deployed | Public sending/intake inactive; verified sender, frequent worker and actual end-to-end acceptance |
| Inventory and reports | Exact-SKU ledger, partial holds/releases/dispatch, blocked/count controls, role guards, private demand and product-interest reports/CSV with30-second refresh | Real SKUs/counts/policy before stock commitments; staff walkthrough |
| SEO, security and operations | Technical indexability, 342-page/155-asset crawl, metadata/hreflang/schema/sitemap; owner/access fixes, dependency patches, daily maintenance, earlier encrypted restore | Domain/Search Console, stronger credential, backup schedule, broader acceptance; external monitoring deferred |

Production: `4704626`, branch `codex/el-amal-foundation`, stable https://el-amal-sigma.vercel.app. Continuation/documentation branch: `codex/hero-review-and-quotation`. Fresh production CI succeeded with162 unit checks plus database/build/runtime verification. Quotation and analytics migrations are hosted; customer intake is still disabled pending its operational dependencies.

Current English-homepage lab result: mobile 95 / desktop 99, accessibility/best-practices/basic SEO 100, LCP 2.4s / 0.7s, CLS 0. This does not establish field Core Web Vitals, whole-site accessibility, Google indexing or ranking. See [release evidence](precision-release-2026-10-06.md).

The handbook assigns each remaining action to Nour/client or engineering and distinguishes activation from optional enhancements. Already supplied: catalogue pages and stock interpretation, recipient, PDF/Excel/photo choice, colors and hero selection. Do not ask for these again. No passwords or API keys in chat. Checkly stays deferred.
