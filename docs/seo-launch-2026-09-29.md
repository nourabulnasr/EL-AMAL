# Search launch — 29 September 2026

The approved navy interface and all 151 published model groups are preserved. This release makes eligible public pages discoverable; it does not claim a Google ranking, confirmed indexing, rich-result eligibility, or client content certification.

## Production configuration

Production must use the following values for public indexing and canonical URLs:

| Variable | Production value |
|---|---|
| `SITE_INDEXING_ENABLED` | `true` |
| `CATALOGUE_SOURCE` | `cms` |
| `CMS_ENABLED` | `true` |
| `VERCEL_ENV` | `production` — supplied by Vercel |
| `SITE_URL` | `https://el-amal-sigma.vercel.app` until a real replacement domain is selected |

Keep the launch switch disabled in development and previews. The production environment is checked independently, so copying the launch switch into a Vercel preview does not make it indexable. Redeploy after changing these values: Next's configured response headers and layout metadata are also evaluated at build time. Mail delivery and enquiry-intake switches are independent of search discovery.

`GOOGLE_SITE_VERIFICATION` optionally accepts the verification token supplied by the owner's Google Search Console URL-prefix property. It emits the standard verification meta tag. It is not an API key. No token is invented or ownership claim submitted automatically.

## What changed

- The sitemap excludes RFQ, basket, verification, staff, admin and API routes. It lists both language versions of public information, industries, nonempty categories, catalogue/category pagination and published products, with real product image URLs. It does not invent modification dates.
- Each language version has its own canonical, reciprocal English/Arabic alternates and English `x-default`. Pagination has its own canonical; category pagination stays on the category route. Native anchor links expose every next page and product without JavaScript.
- Quote, RFQ, verification and filtered catalogue routes emit `noindex`; permanent HTTP exclusions cover private paths including `/staff`. Demo and preview responses retain a site-wide `noindex, nofollow`. Public forms remain crawlable so search engines can read their exclusion; authenticated staff/admin/API paths remain disallowed in robots.txt.
- Public metadata explicitly supplies Open Graph and Twitter images. The live baseline exposed missing image metadata on nested pages. `/social-image` reuses the existing approved image composition through a stable image endpoint, avoiding Next's generated file-name suffix.
- A 96px ICO favicon and SVG icon use the existing navy, orange and white A monogram. The prior `/favicon.ico` returned 404.
- Website and Organization identities are linked consistently. Product detail graphs link the factual product, page and website. Catalogue/category pages describe only their displayed records using CollectionPage, ItemList and BreadcrumbList.
- Manufacturer identity, real images and existing bilingual technical details remain intact. No offers, prices, ratings, reviews, local address, opening hours, certifications, reseller status or manufacturer relationship are inferred.

## Repeatable public audit

After the integrated production deployment and indexing switch, run:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=384 --v8-pool-size=1'
node scripts/audit-live-seo.mjs --origin=https://el-amal-sigma.vercel.app --expect-indexable=true --expected-products=151 --output=artifacts/2026-09-29/launch/seo-live-audit.json
```

This sequential, read-only crawl starts with the sitemap and both homepages, follows public canonical catalogue/category/information links, checks each page's HTTP status, canonical, language alternates, HTML language/direction, title, description, H1, robots, sharing metadata and JSON-LD, then checks discovered social/product/icon image responses. It checks unauthenticated private-route exclusions and missing-route behavior without submitting a form, creating data, sending email, using tokens or logging in.

The default cap is 1,000 public pages. Reaching the cap is a reported failure, not a successful complete audit. The expected-product option checks that all 151 model pages were reached in each language; update this explicit release count when the catalogue changes. Discovered indexable pages missing from the sitemap are also reported. `--expect-indexable=false` checks a public prelaunch deployment instead; do not use it to declare production search launch complete. Protected previews may return authentication responses and should remain protected. Do not add bypass credentials to the report.

The audit is not an HTML validator, browser accessibility test, Google Rich Results Test, external technical-PDF availability check or performance measurement. Next can stream a 200 response before a missing resource is discovered; the audit accepts an explicit `noindex` on that response, and otherwise requires 404 behavior. Its URL list is deliberately restricted to current public route families; update it when adding another public information route.

## Evidence and release gate

Scoped regression tests cover launch environment gating, private/query exclusions and actual configured header patterns, sitemap/publication isolation, image entries, reciprocal alternates, canonical navigation, collection/product schema and the audit parser. The RFQ-indexing and missing-social-image failures were reproduced before correction.

`artifacts/2026-09-29/launch/seo-predeploy-sample.json` is an eight-page sample of the previous live deployment. All eight returned 200 with noindex and the live sitemap was empty. It found missing `x-default`/favicon links and missing sharing images on nested routes; `/favicon.ico` returned 404. The report intentionally fails because it audits the old deployment and uses an eight-page cap. It is not verification of the new deployment.

Release verification completed:122 integrated unit checks, TypeScript and cloud builds succeeded; the complete live crawl covered342 public pages and155 assets, including151 products in each language, with zero detected audit issues. The audit remains scoped as described above. Final application release b1c7632 and deployment dpl_869XeFsv2NEteNwxHPisnBDCKWBs include subsequent accessibility/performance corrections; see PROGRESS.md and operations-release-2026-09-29.md. No database or content records were modified by SEO work.

## Owner follow-through

Once the stable URL passes the production audit, verify its URL-prefix property in Search Console, submit `/sitemap.xml`, and inspect representative English/Arabic home, category and product URLs. Check the Page indexing and Crawl stats reports over time. There is no direct integration or credential available in this change to complete the owner's Search Console verification.

If the domain changes, update `SITE_URL`, redirect the old public URLs to matching new URLs, redeploy and rerun the full audit before submitting the replacement sitemap. Actual business address, phone, hours, final logo and documented WIKA relationship wording remain owner-supplied evidence. Do not invent LocalBusiness or relationship claims to fill those gaps.

Product schema here identifies instruments, but Google product snippets require a genuine offer, review or aggregate rating in addition to a name. This quotation catalogue does not supply those commercial data. Ordinary search eligibility is the correct launch target; adding a fabricated zero-price Offer to satisfy a rich-result validator is incorrect.

## References reviewed

- Installed Next.js 16.3.5 documentation: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`, metadata sitemap/robots/app-icons conventions, route handlers, not-found behavior and next.config headers. Context7 Next.js references were checked as supporting guidance; the installed version governs this project.
- [Google robots meta and HTTP-header rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag): exclusion rules must be crawlable to be seen.
- [Google robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro): crawl blocking alone does not prevent URL indexing.
- [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading): crawlable anchor links and separate pagination URLs/canonicals.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): publish the intended canonical URLs, without fabricated timestamps.
- [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search): stable, crawlable, square brand imagery.
- [Google Product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet): distinguish factual Product data from eligibility for commercial rich results.
