# Real catalogue publication implementation plan

> For agentic workers: use subagent-driven-development for the isolated catalogue application task and independent review. The primary agent handles source extraction, content, import and deployment.

Goal: publish every product/model group on the supplied main catalogue pages, with actual manufacturer product images, factual specifications, bilingual content, datasheets and the user's confirmed availability.

Architecture: retain the current Next.js/Payload/Neon application and approved navy layout. Add a validated catalogue-details JSON field to Products and an explicit public projection. Store product image assets in public/images/products; keep source PDFs/photos and extraction evidence locally under ignored docs/source. Import idempotently into existing CMS by external ID and switch the public catalogue to CMS only after all records and assets are verified.

Authority: user explicitly instructed publication of all real supplied products, specifications and photos. Previous draft-only intake is superseded. No renewed approval needed for this implementation/publication scope. Exact SKU quantities, sending activation and business relationship claims remain outside this change.

## Global constraints

- Main-page folder labels apply to every model, irrespective of pen marks; exclude partial neighbouring pages.
- Preserve the 151 printed cards/groups, including all model identifiers. Do not invent stocked configurations, certification applicability, quantities, prices or ratings.
- Use genuine manufacturer images corresponding to the supplied products, never AI substitutes.
- Preserve approved #010736/#091540, white and orange design; English/Arabic/RTL and reduced motion.
- Keep source/reviewer/private SKU data out of public projections.
- Keep public enquiry sending and search indexing at their existing disabled settings.
- No new paid services or unrelated packages. Read installed Next.js docs before component changes.

## Public data interface

Product.details is optional for old/demo records:

    {manufacturer: 'WIKA',
     image: {src: string, width: number, height: number, alt: {en: string, ar: string}, sourceUrl: string},
     specifications: [{label: {en: string, ar: string}, value: {en: string, ar: string}}],
     availability: 'in-stock' | 'out-of-stock' | 'check',
     availabilityReportedAt: string,
     datasheets: [{title: string, url: string}]}

Only local /images/products/ raster paths are renderable. Reject unsafe/invalid details on CMS writes and omit malformed details on public projection. Do not fetch arbitrary CMS-supplied URLs on the server.

## Review focus

- Unpublished/private fields never reach cards or structured data.
- Invalid image paths and partial/malformed bilingual rows cannot break rendering.
- Stock is a dated model indication, not an inventory reservation or quantity.
- Grouped models remain searchable and datasheets correspond to each group.
- A catalogue of 151 entries is usable on mobile without loading all images eagerly.

## Tasks

- [x] 1. Source extraction: locate matching official catalogue pages; extract original product images and per-card specifications with source evidence, preserve all 151 groups and folder classification, prepare factual English/Arabic content and datasheet URLs.
- [x] 2. Catalogue application: extend Products/details schema and public DTO validation, image/specification/availability rendering, product metadata/schema and catalogue pagination; add focused data/access tests and additive migration. Full task brief in artifacts/2026-09-27/catalogue-build/application-brief.md.
- [x] 3. Independent application review: inspect full diff and test evidence; resolve issues before integration/publication.
- [x] 4. Idempotent import: validate full source-to-product coverage, assets, specifications and translations; import categories/products by stable external IDs through owner-authorized CMS operations. First development validation, then hosted import. No stock ledger writes.
- [x] 5. Verify EN/AR search, group matching, detail images/specifications, basket and CMS publication/private isolation; run unit/types/build checks and production migration; deploy with catalogue source cms and existing send/indexing gates.
- [x] 6. Verify live product count and routes/images, update progress and final-client inputs, commit/push and report actual delivery/remaining exceptions.

Completed release: 43faaf8, Vercel dpl_FeT8KpWkJPLkP6VAjjbtKEuRhfEH. Final evidence and content exceptions: docs/catalogue-publication-2026-09-28.md. User visual/technical acceptance and other site workstreams remain separate.
