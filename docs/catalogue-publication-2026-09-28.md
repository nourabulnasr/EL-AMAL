# Real catalogue publication

Nour explicitly instructed publication of all actual products, specifications and photographs. The previous ten-draft intake restriction is superseded. Every model on each main photographed page inherits its folder stock label, regardless of pen marks. Partial neighbouring pages are excluded.

## Content

- 29 main pages →151 entries/model groups:90 in stock,61 out of stock, reported27 September2026. All printed groups covered; these are not151 exact orderable SKUs.
- 151 original manufacturer images from the matching WIKA portfolio; no AI substitutes. Images represent the model family rather than an exact supplied configuration.
- 560 bilingual specification rows and486 translated terms checked for numeric fidelity.
- 159 official PDF downloads verified by HTTP status, PDF signature, hash and model evidence.150 entries have standalone datasheets; M12 cable uses catalogue page29.
- 47 pressure,87 temperature,17 accessories. Application filters use manufacturer evidence:33 oil/gas,90 general industry.

Source: https://microsites.wika.com/upload/BR_ProductPortfolio_en_co_6434.pdf

The matching printed catalogue supplies family ranges/options. Ordered variants, applicable certifications, suitability and current availability require quotation confirmation. Manufacturer inconsistencies: TFT35 TE76.18 resolves toTE67.18; BA PV32.22 resolves toPV32.21. Correct official PGT21 PDF has inconsistent PV21.02 headers; public title is WIKA PGT21. A-1200's missing negative sign corrected usingPE81.90. HPNV's confusing generic low-pressure option omitted in favour of its supported nominal range and datasheet.

Source photos/PDFs stay under ignored docs/source. Reproducible extraction,translations,link evidence and publication data are under catalogue/2026-09-27; working files excluded from Vercel. Public PNGs are under public/images/products.

## Implementation and checks

Validated catalogueDetails JSON, strict local image paths, bilingual rows, stock dates, explicit public projection and additive JSONB migration for products/draft versions. Owner publication permissions retained; no invented quantities,reservations or prices.

next/image on cards/detail, all technical links, family guidance and real image/manufacturer structured data.24 cards per page with preserved filters; distinct valid pagination canonical/locale URLs. Filter pages remain noindex. Arabic codes/ranges isolated directionally. Full technical tables stay server-rendered instead of basket hydration.

65 unit tests and TypeScript succeeded. Development DB tests verified permissions,draft isolation,publication and public projection. Reviewed migration applied both databases. Development import resumed safely:64 unchanged,87 created,zero duplicates. Hosted import created all151 and verified public projection/90–61 split. Backups/results:ignored artifacts/2026-09-27/catalogue-build.

Local production build succeeded after removing interrupted Webpack cache and correcting an incompatible build-command env-file flag. Windows uses SWC WASM fallback. Browser checked24 cards,no sample labels,EN/AR images/specs/stock/grouped models at390px without overflow. All151 images inspected on four contact sheets. Existing favicon.ico request returns404; no zero-diagnostic or full-site perfection claim. Independent review found pagination canonical and Arabic code isolation defects; both corrected. Final cloud/live verification is recorded in PROGRESS.md.

## Production delivery

Implementation commit `43faaf8abeed2e8681c01be2ac8d2f58414b4298` is pushed to `codex/el-amal-foundation`. Vercel production deployment `dpl_FeT8KpWkJPLkP6VAjjbtKEuRhfEH` reached Ready and serves [English](https://el-amal-sigma.vercel.app/en/products) and [Arabic](https://el-amal-sigma.vercel.app/ar/products). [GitHub Website quality run 36351279324](https://github.com/nourabulnasr/EL-AMAL/actions/runs/36351279324) succeeded on that exact commit, covering the final source after the bidi refinement.

Live checks on 28 September local time verified all 151 public entries, the 90/61 split and SHA-256 equality for all 151 published PNG images. Private source/reviewer fields are absent from anonymous responses; SKU, enquiry, notification and verification-email collections return 403 anonymously. English and Arabic grouped-model search returns one correct result for PGS23.160. The English catalogue renders 24 real cards with no sample labels. English/Arabic grouped details at 320px have real images, technical rows, stock dates and downloads without horizontal overflow. Arabic page 7 renders its final seven entries with a self-canonical. Adding DIH10 to the quote basket survives reload; the test item was removed. M12 cable links to the matching manufacturer catalogue page.

Evidence is saved under ignored `artifacts/2026-09-27/catalogue-build/`: `live-verification.json`, `live-catalogue-en.png`, `live-detail-en-320.png`, `live-detail-ar-320.png` and earlier contact sheets/build/import logs. Vercel's sampled error-level logs contain PostgreSQL SSL deprecation warnings on successful/expected-denied responses; no HTTP 5xx failure was observed in these checks. The existing favicon 404 and unused-preload warnings remain. No new Lighthouse score, field Core Web Vitals measurement, visual approval or full-site security certification is claimed.

## Operations

Hosted CMS catalogue published;production source configured cms. Public enquiry/email activation and search indexing remain disabled. Exact inventory/reservations,private attachments,scheduling,monitoring,recovery and full release acceptance remain separate scope. Visual acceptance remains Nour's.

Rebuild content: node catalogue/2026-09-27/prepare-content.mjs then node catalogue/2026-09-27/build-publication.mjs. Validate without DB: node --experimental-strip-types scripts/import-catalogue.ts. Apply only with the selected environment/owner files and explicit --apply --target development or hosted. No credentials in logs or Git.
