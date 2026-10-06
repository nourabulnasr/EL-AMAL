# Bilingual search and sharing preparation

Current status,6 October2026: public production indexing is enabled and the live sitemap contains342 eligible URLs. The fresh complete crawl checked342 public pages/155 images with no detected issues. Google indexing and Search Console ownership/submission remain unverified. See [current release record](operations-release-2026-10-06.md) and [search launch instructions](seo-launch-2026-09-29.md). The safe defaults below describe unconfigured/development/preview behavior, not the current live production switch.

All public routes now generate a matching canonical URL, English/Arabic alternatives, page title and description, Open Graph and Twitter metadata. Product/category metadata uses the selected reviewed projection or clearly marked current demo data. Shared WebSite/Organization JSON-LD contains only the business name and site URL; it asserts no WIKA relationship, certifications, address or stock.

The default remains noindex. Enabling SITE_INDEXING_ENABLED requires both CATALOGUE_SOURCE=cms and VERCEL_ENV=production. Preview deployments and synthetic catalogues cannot become indexable by the launch flag alone. next.config headers and page robots use the same policy. Admin/API keep noindex headers after activation, and quote baskets keep noindex metadata.

Sitemap remains empty until activation. It then generates bilingual public information/catalogue/industry URLs, published products, nonempty categories and canonical pagination. RFQ, verification, quote baskets, staff, API and draft records stay excluded. No made-up last-modified dates or ratings/prices are emitted. Robots advertises the sitemap only when activation is enabled.

SITE_URL determines canonical origin, with HTTPS and credential validation; current default is the live Vercel review address. A custom-domain cutover requires updating SITE_URL and redeploying. Final indexing must follow real-content and launch acceptance.
