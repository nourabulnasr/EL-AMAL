# Foundation verification — 17 September 2026

## Automated evidence

- npm test: 10 tests, 10 succeeded, zero failures. Covers normalized/Arabic search, exact-match order, category intersection, corrupt basket data, quantity limits, import validation and publication prerequisites.
- npm run typecheck: exit 0. CMS source explicitly excluded pending dependency installation.
- npm run build: exit 0 with webpack and one build worker. Earlier multiworker build exhausted local memory; experimental.cpus=1 resolved the build limitation.
- Production HTTP: /en, /ar, /en/products, /en/products/demo-p1, /ar/categories/pressure, /admin, /robots.txt and /sitemap.xml returned 200. Missing product and /fr returned 404. All carried noindex, nofollow.

## Browser evidence

Tested against production server on port 3004 in Codex browser:

- Model search for demo p1 returned DEMO-P1.
- Language switch preserved search query; Arabic product route rendered RTL.
- Added demo product to basket, changed quantity to 3, switched to English and refreshed: quantity persisted.
- Mobile Arabic menu expanded with catalogue and section links.
- Unmatched search showed empty state; Clear filters restored all ten fixtures.
- Arabic homepage and English catalogue had no document horizontal overflow at 320px; Arabic homepage and quote basket inspected at 390px. Desktop homepage inspected at 1366px without document overflow.
- Screenshot saved locally to artifacts/2026-09-17/home-desktop.png. Screenshots are not tracked in Git.

## Assessment and limits

My assessment: the dark editorial direction, typographic hierarchy, translated navigation and mobile reading layout are represented. The instrument drawing and identity are provisional; every sample product uses illustrative artwork. Nour has not approved the final visual details.

No Lighthouse, full accessibility suite, live email delivery, uploads, database concurrency, CMS API role tests or end-to-end acceptance of the full proposal has been performed. No-JavaScript fallback markup exists, but no separate JavaScript-disabled browser session was tested. Reduced-motion styles are implemented, not benchmarked. The unavailable Impeccable suite was not run. Unit access-rule tests do not establish operational CMS security.

CMS installation remains blocked by registry connection reset for @payloadcms/drizzle. Integrate and typecheck the prepared schema after installation; then test real role boundaries and database migrations. Public enquiries and stock holds remain unimplemented. Keep noindex until reviewed real content, domain metadata, schema, hreflang, social metadata and deployment checks are complete.
