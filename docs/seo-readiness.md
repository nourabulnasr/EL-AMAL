# Bilingual search and sharing preparation

All public routes now generate a matching canonical URL, English/Arabic alternatives, page title and description, Open Graph and Twitter metadata. Product/category metadata uses the selected reviewed projection or clearly marked current demo data. Shared WebSite/Organization JSON-LD contains only the business name and site URL; it asserts no WIKA relationship, certifications, address or stock.

The default remains noindex. Enabling SITE_INDEXING_ENABLED requires both CATALOGUE_SOURCE=cms and VERCEL_ENV=production. Preview deployments and synthetic catalogues cannot become indexable by the launch flag alone. next.config headers and page robots use the same policy. Admin/API keep noindex headers after activation, and quote baskets keep noindex metadata.

Sitemap remains empty until activation. It then generates bilingual home/catalogue/RFQ/industry URLs plus only public projected products and used categories. It never lists staff/API/quote or draft records. No made-up last-modified dates or ratings/prices are emitted. Robots advertises the sitemap only when activation is enabled.

SITE_URL determines canonical origin, with HTTPS and credential validation; current default is the live Vercel review address. A custom-domain cutover requires updating SITE_URL and redeploying. Final indexing must follow real-content and launch acceptance.
