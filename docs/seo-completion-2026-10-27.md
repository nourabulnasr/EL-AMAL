# EL AMAL SEO completion record — 27 October 2026

## What this release adds

- Four substantive bilingual industry pages: petroleum and gas, pharmaceuticals, food and beverage, and general industry.
- A bilingual Measurement Solutions hub.
- Three bilingual commercial-intent guides for pressure instruments in Egypt, temperature instruments in Egypt, and EL AMAL as the official WIKA distributor in Egypt.
- Visible, useful FAQs on every new industry and solution page. FAQ structured data mirrors the visible answers exactly.
- Sitewide links from the footer and homepage industry section so the new pages are not orphaned.
- A localized `SearchAction` pointing to the real catalogue search.
- Organization structured data with the confirmed sales email, telephone, Egypt service area, and English/Arabic availability.
- Sitemap discovery for every new English and Arabic URL. Expected public sitemap size after release: 384 URLs (372 existing URLs plus 12 new bilingual URLs).
- Title normalization that prevents `| EL AMAL | EL AMAL` when a page title already includes the brand.

## SEO approach and why

The new pages are not keyword-swapped doorway pages. Each page answers a distinct procurement or engineering intent, includes unique bilingual copy, explains what information is required, links to the relevant catalogue view, and states that final configuration requires review. This supports users first while giving search engines clear topic, entity, language and internal-link signals.

No price, rating, review, address, opening hours, hazardous-area approval, hygienic approval or product offer was invented. Product schema remains quote-oriented rather than presenting false ecommerce offers.

## Technical coverage already present

- One canonical URL per indexable page.
- Reciprocal English/Arabic hreflang and `x-default`.
- Production-only indexing; preview, demo, form, token, admin, staff, API and faceted-search exclusions.
- Dynamic sitemap with pagination, category, product, image and alternate-language entries.
- `robots.txt` with sitemap discovery and private-route exclusions.
- Page-specific titles and descriptions, Open Graph and Twitter cards.
- WebSite, Organization, WebPage/CollectionPage, BreadcrumbList, ItemList, Product and FAQPage structured data where the visible page supports it.
- Server-rendered bilingual catalogue and product details.
- HTTPS and security headers.

## Verification completed locally

- Targeted SEO and indexing-policy tests: 14 passed, zero failed.
- Full unit-test command on local Node 24: 261 of 262 passed. The single failure is an unrelated staff-recovery test whose request stream emits an asynchronous `ERR_INVALID_STATE` after the test ends; the application targets Node 22 and the cloud Node 22 suite is the release authority.
- TypeScript: exit code 0 with `NODE_OPTIONS=--max-old-space-size=4096`.
- `git diff --check`: no content errors; only Windows line-ending notices on unrelated existing edits.
- Next webpack compilation completed. The integrated Next type-check child then hit this computer session's low native memory ceiling; standalone TypeScript had already completed successfully.

## Release gates

1. Push the isolated SEO commit and let Vercel build it in its normal cloud environment.
2. Review the new English and Arabic pages visually on the preview.
3. Publish the tested commit to the production domain.
4. Run the full live SEO crawler. Expected sitemap: 384 public URLs with zero covered issues.
5. Validate representative Organization, Product, CollectionPage and FAQPage JSON-LD with Google's Rich Results Test and Schema.org validator.
6. Resubmit `https://www.al-amaleg.com/sitemap.xml` in the verified Search Console property and request indexing for the seven new English pages and seven Arabic equivalents.

## What no developer can guarantee

Technical SEO can be completed; a number-one ranking cannot be guaranteed. Google decides crawl, indexing and ranking. Search Console can request processing but cannot force it. Competitive rankings also depend on domain history, external links, real company information, customer evidence, and ongoing useful content.

## Human/external actions after release

- Complete the company address and opening hours when the client approves them; then add/verify the Google Business Profile.
- Obtain authoritative links, especially from WIKA/distributor references, industry directories, partners and real customer/project mentions.
- Supply genuine case studies, certifications and reviews before publishing any corresponding claims or schema.
- Monitor Search Console indexing and query data for 4–8 weeks, then improve pages from real impressions and click-through data.
- Review field Core Web Vitals after enough real-user traffic exists; laboratory scores alone are not field evidence.
