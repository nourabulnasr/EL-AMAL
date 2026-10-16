# EL AMAL production release and completion status

Updated 16 October 2026, Cairo time. Nour approved the reviewed design and explicitly requested publication. The product release is live at **https://www.al-amaleg.com** in English and Arabic. This record covers the release, verified behaviour, search status and work still needed for final handover.

## Published product changes

The production catalogue contains **165 published product groups**. The targeted import added 14 groups and changed only availability and its reported date on existing IV1, IV2 and IV3/IV5 groups. Existing product addresses and identities were preserved. The 17 affected groups show in stock as reported by Nour on 13 October; these are catalogue availability statements, not invented warehouse quantities.

The homepage features **232.50/233.50, IV2 and model 55 per EN 13190**, linking respectively to production products `cms-156`, `cms-138` and `cms-165`. The approved genuine product images, gallery styling and motion are deployed. The supplied imagery still limits how sharp enlarged photographs can look; higher-resolution originals would improve them.

Each product detail page offers up to three relevant suggestions in the same instrument category. Selections vary by viewed product and rotate daily. Current and duplicate products are excluded. Smaller catalogue and detail photographs make room for the technical summary, and the specification shortcut focuses the full technical section. Phone layouts put the title and key specifications before the photograph.

The separate company-industry filter works with existing instrument categories, types and search terms. Its overlapping totals are **62 petroleum and gas, 13 pharmaceuticals, 24 food and beverage, and 164 general industry**. Manufacturer applications underpin the classification; utility applications carry scope notes rather than implying sanitary product-contact approval. See [industry classification evidence](product-industries-evidence-2026-10-15.md).

Bottom/back connection choices on the three annotated families remain separate basket lines and persist across language changes. Trusted bilingual option labels are saved with submitted enquiries and used by the existing staff allocation and notification flow.

## Release and verification

The additive `20261013_120000_enquiry_connection_options` migration ran in production as batch 12. It added four nullable fields without removing existing data. A fresh snapshot of public catalogue fields and migration state was saved; no new full private customer database export was made. The earlier encrypted backup is historical evidence, not a fresh restore exercise.

Application `4ad15ffd0a7e0cc3538636b0f330b88d4ab0d777` was built with production settings through the existing production branch, `codex/el-amal-foundation`. Vercel deployment `dpl_PMjwegBo1Pxd8EpHpc1p7pzRgvcX` completed successfully. Code was deployed before the import so the new product images and option handling were available when the products appeared. The isolated development preview was not used as the production database.

The importer reported **14 created, 3 stock updates, 151 to 165 published groups**. An immediate rerun reported **0 created, 0 updated, 17 unchanged**. Production valve IDs 135, 138 and 139 were preserved. The source batch digest is `c64ae248fc59fa38cd6d855ded1f381af9cd6f238767ad9a8c6a5f9a69bd46cb`.

The production-branch [quality workflow](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38894267185) succeeded, including 206 unit tests, TypeScript, the dependency advisory gate, disposable PostgreSQL migrations, database regressions, the production build and built-server checks.

Read-only live checks verified:

- All 34 affected English/Arabic product pages against the publication manifest, including 160 displayed specification occurrences, 12 connection-option controls, stock dates, photographs, alt text and datasheets.
- Both homepage selections, all eight industry totals, and combined pharmaceutical/pressure-switch filtering returning PSD-4.
- 64 same-category recommendation target checks, with 17 different selection sets.
- English desktop and Arabic phone layouts without observed horizontal overflow, working filter submission and query-preserving language switching, the specification shortcut and suggestion navigation.
- Two temporary bottom/back basket lines remained distinct when switching from Arabic to English. Only those temporary lines were removed afterward; no customer enquiry or email was submitted during these checks.
- Public RFQ and existing-quotation capabilities were both enabled. A read-only health check at 14:43 Cairo found a successful delivery-worker run at 14:40, within the required freshness window. Owner notifications remain addressed to **alamal4trade@hotmail.com**.

Live review also found old basket copy incorrectly describing enabled quotations as a preview. The follow-up correction uses the existing capability flag for English/Arabic guidance and links to the separate file enquiry form. The disabled preview still describes its limitations correctly. Four rendered language/capability combinations, 15 focused regressions and TypeScript succeeded. Final application `f91ae67db11c89b58f27e22e21ddd6516c272ccb` is live: GitHub production deployment `7118092607` completed at `https://el-amal-7345cxoax-nour-abulnasrs-projects.vercel.app`. Both full quality workflows [38895567341](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38895567341) and [38895566183](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38895566183) succeeded.

The final production browser check confirmed the corrected active basket instructions and file-enquiry link in English and Arabic. A single temporary bottom-connection line persisted across the language change and was removed afterward, restoring the empty basket. The active English existing-quotation form displayed its contact/review journey and actual file limits. No enquiry, attachment or email was submitted during this final check. Temporary viewport overrides were reset after responsive review.

Evidence is saved under `artifacts/2026-10-16/release/`, including `catalogue-http-verification.json`, `seo-live-audit.json`, `intake-health.json`, product screenshots and Google confirmations. These are scoped release checks, not an independent penetration test, a complete assistive-technology audit or a new field Core Web Vitals measurement.

## SEO and actual Google indexing

The live technical SEO crawl checked **372 eligible public pages and sitemap URLs**, including **165 products in each language**, plus **169 image assets**, with **zero detected issues in its covered checks**. Public pages returned 200. Metadata, canonical URLs, reciprocal language alternatives, document language/direction, structured data, sharing metadata and images were checked. Fourteen private/form/search/missing-page checks also behaved as expected.

The verified Google Search Console domain property now shows the sitemap as **Success**. Google last read the prior sitemap on 15 October and reported 342 discovered URLs. On 16 October the refreshed sitemap was resubmitted and Google confirmed **Sitemap submitted successfully**. The website's current sitemap contains 372 URLs; Google's previous discovery count is not a current indexing count.

Search Console's Page indexing report inspected on 16 October, labelled 12 October, showed **3 indexed pages and 6 not indexed pages**. The latter comprised three redirects, the intentionally excluded `/ar/rfq`, and two crawled-but-not-indexed examples: `/en/about` and `/en/industries/oil-gas`. The new English and Arabic `cms-156` pages were discovered but not indexed. Google accepted a separate indexing request for each and confirmed both were added to its priority crawl queue.

Public product and information pages are eligible for indexing. Admin/staff/API, baskets, RFQs, verification routes and duplicate filter combinations intentionally remain excluded. Google controls indexing and ranking; a successful sitemap submission or technical audit does not mean all pages are already indexed. [Google explains the distinction](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl). No further domain or ownership DNS record is currently required.

## What remains before final handover

The public catalogue and enquiry website is operational. Final handover still needs the following:

1. **Business content:** approved company/CEO facts and photograph; confirmed phone, WhatsApp, address and opening hours. Evidence is needed only if a WIKA distributor or partner claim is to be published.
2. **Account and sales acceptance:** a strong unique owner password, named staff access where needed, owner confirmation of Hotmail Inbox/Spam receipt, and completion of the real staff password-recovery acceptance journey after recovery activation.
3. **Operating decisions:** acceptance or correction of privacy/retention wording, backup ownership/location/retention and recovery responsibility. Exact stock counts and reservation rules are needed only for warehouse commitments, not to display the approved model-level availability.
4. **Remaining engineering verification:** activate and verify staff recovery, complete the agreed backup/restore arrangements, broaden accessibility/device/reduced-motion checks, obtain current representative performance measurements and resolve reproducible issues. The dated handbook should be refreshed against these release addenda.
5. **File scope:** uploads currently accept three files of up to 2 MiB each, with format validation, private access and 30-day expiry. The original 10 MB allowance and automatic malware scanning are not delivered. They require an agreed extension to the current upload/storage approach.
6. **Search growth:** follow Google's processing and indexing reports after this submission; add approved company information and useful original technical content over time. Search visibility is ongoing work, not an instant deployment switch.

External Checkly monitoring remains deferred at Nour's instruction. Additional assurance such as MFA or independent penetration testing is separate work, not a feature claimed by this release. The detailed ownership/action register is [final client inputs](final-client-inputs.md).
