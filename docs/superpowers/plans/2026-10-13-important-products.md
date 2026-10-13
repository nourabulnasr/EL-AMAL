# Important products implementation plan

**Goal:** Publish the 14 new catalogue groups, update the three existing valve groups to in stock, preserve quotation connection choices and present the selected three homepage products in an animated product gallery.

**Architecture:** Keep the existing bilingual catalogue, product identities, Payload access controls and verification-first enquiry pipeline. Add optional connection choices to reviewed catalogue details and immutable enquiry snapshots. The homepage gallery uses real manufacturer images and explicit model selection, with lightweight motion and a static fallback.

**Tech stack:** Existing Next.js 16.3.8, React 19.2.8, Motion 12.43.0, Payload 3.90.2 and PostgreSQL. No new runtime dependency or external service is required.

**Specification:** `docs/important-products-review-2026-10-13.md`, with the user decisions below taking precedence over its original pending-state paragraphs.

## Confirmed decisions

- Homepage order: 232.50 / 233.50; existing IV2; model 55, high-quality process version per EN 13190.
- All 17 highlighted groups are in stock, reported by Nour on 13 October 2026. This is model-level availability, not an invented SKU quantity.
- Product gallery selected: isolated real products, distinct compositions, soft blue lighting and subtle tilt/scroll motion.
- Bottom/back choices appear after opening the product on the three Arabic-annotated pressure-gauge families. Do not invent thermometer configurations.
- Preserve deep navy, lighter blue, white type and existing orange accents; no white image rectangles in the featured gallery.
- User retains visual approval. Show the concrete preview and evidence before the final visual release if approval is still outstanding.

## Execution and review boundaries

Continue in the existing `codex/hero-review-and-quotation` development checkout; production uses a separate branch. Root owns integration, gallery and release. One worker owns the option/RFQ implementation; catalogue data preparation is independent and restricted to dated input/assets/import files. No worker may change secrets, write the production database, commit another worker's files or deploy.

Use focused meaningful tests for validation, option retention, basket compatibility and exact catalogue coverage. Do not add tests that only repeat CSS or component source. Review the integrated diff separately, then run the existing cloud SQL/build/security checks before production.

## Review focus

- A bottom and a back connection for the same family must remain separate quotation lines through confirmation, retry, email and staff review.
- Old baskets and old enquiries without options must remain readable; an old line for a now-option-bearing product must ask for selection rather than silently choose.
- The client cannot inject arbitrary option names or substitute a model through the public API; resolve every selection from trusted reviewed catalogue data.
- Existing IV1, IV2 and IV3/IV5 URLs, enquiry history and product-interest totals must survive the stock update.
- Arabic model codes must retain their order; keyboard, touch and reduced-motion users must see usable choices and all gallery content.

## Task 1 Catalogue publication batch

Files: `catalogue/2026-10-13/`, `public/images/products/`, a dedicated `scripts/import-important-products.ts`, and focused tests for the new batch if importer logic changes.

- [x] Extract exact cards and embedded original images from the locally saved WIKA portfolio for all 14 additions. Read the photographed selection and official datasheets to resolve ambiguities. Keep archived user photos and manufacturer provenance.
- [x] Prepare bilingual names, descriptions, specification labels/values, real images, taxonomy and datasheet links. Keep actual model codes intact. Add only these model families, plus targeted stock updates to the three existing valve records.
- [x] Use the following option contract in reviewed `catalogueDetails` for the three annotated families:

```ts
type CatalogueOption = {id: string; name: {en: string; ar: string}; model?: string};
// catalogueDetails.options?: CatalogueOption[]
// ids: bottom-connection, back-connection
// labels: Bottom connection / توصيل سفلي; Back connection / توصيل خلفي
// Only the 111 family maps mounting directly to model: 111.10 / 111.12.
```

- [x] Make the new importer dry-run by default, owner-authenticated on apply, explicitly target-checked and idempotent by externalId. Do not reuse the old importer's fixed 90/61 totals or overwrite unrelated live products. Update reused valves narrowly from their current record, preserving newer content.
- [x] Validate 17 affected groups, 14 additions and three identity-preserving updates; all have availability `in-stock` with report date `2026-10-13`. No duplicate model groups or conflation with contact gauges ending “with 8xx”. Confirm every local image, specification and datasheet before apply.

## Task 2 Product choices through quotations

Owned files: catalogue details parsing/types, basket and enquiry model/validation, relevant product-detail and quotation components, small basket DTO in the site layout, staff enquiry fields, necessary additive migrations/generated types, notification formatting and meaningful focused tests. Root owns homepage and gallery files; do not edit them or unrelated CSS.

- [x] Extend `CatalogueDetails` with optional validated `CatalogueOption[]`. Reject duplicate IDs, blank/malformed bilingual labels, unsupported values and invalid model text; project only allowed fields. Keep all legacy products valid without options.
- [x] Extend basket items with optional `optionId`; distinguish lines by product plus option. Require valid selection for products that define options. Normalize legacy stored baskets without inventing a choice.
- [x] Render a keyboard-accessible bilingual selector inside the product page. Add selected product and option to the basket. Display the chosen option in basket, quotation review, saved enquiry, notifications and admin.
- [x] Carry stable option IDs through public request parsing, normalization, fingerprints/idempotency and finalization. Resolve names and any selected model server-side. Snapshot optional `optionId`, `optionNameEn`, `optionNameAr`, `optionModel` on enquiry items; additive SQL migration preserves existing records. Never put option text into measurement `range`.
- [x] Ensure both options can be submitted as separate lines; unknown or missing required options produce a clear validation error. Keep product-level analytics keyed to the parent product.
- [x] Add tests for malformed option data; mixed valid/forged selections; both choices on one product; legacy unaffected baskets; required reselection; bilingual trusted snapshots; retry identity differing by option; notification/staff content. Run the focused tests and type checking, reporting exact commands and results.

## Task 3 Homepage product gallery

Files: `src/components/featured-product-gallery.tsx`, scoped gallery styles, a small explicit model-selection helper, `src/app/(site)/[locale]/page.tsx`, and authentic featured assets under `public/images/products/`.

- [x] Select the exact approved three families from published products without relying on current category order or new numeric IDs. Reuse IV2 identity. A missing selected record must not silently feature a different instrument.
- [x] Build an asymmetric composition with one larger pressure instrument and two distinct valve/temperature compositions. Give each a model, clear bilingual title, short factual descriptor, stock label and product-page link.
- [x] Use authentic isolated instrument images, preserving dial/connection geometry and logos. Seek higher-resolution manufacturer assets for the homepage. Inspect assets before use. If background editing is necessary, use the available image-editing tool and review fidelity; do not present invented geometry as an actual product.
- [x] Use optimized responsive Next Image with explicit dimensions and lazy loading for this below-hero section. Keep Motion lazy, spring-based, subtle and inactive on touch/reduced-motion where appropriate. Keep real crawlable content visible without JavaScript. Preserve existing home product impression/click attributes.
- [ ] Preview English and Arabic at desktop and narrow mobile widths, with keyboard and reduced motion. Save review screenshots and address layout or loading failures. Visual judgement remains Nour's.

## Task 4 Integrated verification and delivery

- [x] Review source changes for security, backwards compatibility, catalogue accuracy and scope. Correct concrete findings; do not claim absolute security or guaranteed Google ranking.
- [x] Run unit tests, TypeScript, existing SQL regression tests, production build and built-route checks using the established local/cloud workflow. Verify the new additive migration on a disposable database before the hosted database.
- [ ] Prepare only necessary non-sensitive catalogue rollback evidence; do not export a new full private production database to OneDrive without authorization for that specific backup. Apply only reviewed additive migration and targeted catalogue updates using the established authenticated process.
- [ ] Verify 165 published groups, original IDs preserved, 17 affected groups in stock, all new images/specs/datasheets, family options retained in controlled quotations, and both language routes/sitemap/structured data. Do not send unrequested real customer emails during testing.
- [ ] Update project progress and the release record with exact verification evidence, show gallery screenshots for visual review, commit/push intended files, and deploy when the applicable visual/release approval is satisfied. Preserve any remaining human input explicitly.


## Development checkpoint — 13 October 2026

All 14 additions and the three existing valve availability updates were applied to the separate development database: 165 published groups. An idempotent rerun made zero changes. The new migration and real PostgreSQL option workflow regression succeeded. Local unit suite: 192 successful tests; TypeScript exit 0. Branch-only preview environment storage was explicitly authorized by Nour.

Commit 853a34c introduced the reviewed implementation. Cloud compilation then identified a display-helper import pulling Node cryptography into the inventory client. Commit fc908f3 moves that helper to a browser-safe module; focused inventory tests and TypeScript succeeded. Full cloud build and browser evidence remain required. The genuine extracted image fallback is implemented; higher-resolution exact background removal is still awaiting the earlier user response. Checked implementation items above do not indicate visual approval or production release.


Final review application 4cd06a3 is Vercel Ready at https://el-amal-idofstov8-nour-abulnasrs-projects.vercel.app/en; cloud quality run 38346243512 succeeded in full. Browser screenshots and EN/AR mobile/desktop plus keyboard/basket evidence are saved. The complete reduced-motion/pointer matrix, final image quality and human visual approval remain open; Task 3 browser checkbox therefore stays partial. Production migration/import/deployment tasks remain unchecked.
