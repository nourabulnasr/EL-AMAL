# EL AMAL domain launch and final client requests

Updated: 11 October 2026. This record supplements the handbook and earlier release records.

## Domain connection

The primary address is **https://www.al-amaleg.com**. The Namecheap domain stays on BasicDNS. Both authoritative nameservers return these saved records:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 216.198.79.1 |
| CNAME | www | ed40385597a0ade6.vercel-dns-017.com |

The bare domain redirects to www with HTTP 308. Both support HTTPS. Existing email MX/TXT records were not modified. The linked Vercel project is `el-amal` under `nour-abulnasrs-projects`; Production `SITE_URL` is now `https://www.al-amaleg.com`. Environment edits take effect on the next deployment.

The website uses one central origin for canonical URLs, English/Arabic alternates, Open Graph URLs, structured-data identifiers and sitemap links. Conditional production redirects move `/`, `/en/...` and `/ar/...` from `el-amal-sigma.vercel.app` to the primary domain, preserving paths and query strings. API/cron, staff and admin paths are excluded from those code redirects to avoid disrupting internal operations. Staff should use the new domain's `/admin` and `/staff` URLs and sign in again there. Previews remain non-indexable.

## Website changes prepared

- Header: Products, About us, Request a quote and Contact, in both languages. About us opens a dedicated page. Industry pages remain reachable and retain their SEO value.
- About: factual copy based on the current instrumentation catalogue and applications. No invented founding date, CEO name, certification or distributor status. The CEO section awaits real approved material.
- Public contact: `alamal4trade@hotmail.com` is a styled mail link in the footer and Contact page, and appears in Organization structured data. This does not change the private notification recipient or configure a verified email sender.
- Category icons: server-rendered pressure gauge, thermometer and valve drawings replace the old symbols. No icon dependency or WebGL runtime was added.
- Motion: CSS scroll-linked text reveals, an instrument needle hover/focus response and contact-link treatment. Text remains real HTML; unsupported browsers show static text, and reduced-motion users receive static content.
- Existing selected products, product photos, catalogue specifications and stock labels remain intact until the client provides the new products and chosen three.

## Verification at preparation checkpoint

164 automated unit tests succeeded. TypeScript succeeded after increasing the test process heap limit; the initial deliberately small heap was insufficient. DNS was checked against both authoritative nameservers. HTTPS bare-domain redirect and www homepage were checked directly. Browser review, cloud production build, deployment and the new-domain full SEO crawl remain pending until recorded below. This is not a claim of visual approval or a perfect-security certification.

## Items needed from Nour or the client

1. The original logo, preferably SVG plus any brand usage guidance.
2. New product images, exact model references, specifications/datasheets and stock status; identify the three homepage models. Photographic cutouts with restrained depth/motion are the lightest realistic treatment. True 3D needs suitable 3D assets or separate modelling work.
3. Approved company story, CEO name/title/biography/photo and permission to use the photo.
4. Examples identifying the text and intended border treatment.
5. Confirmed business phone, WhatsApp number, physical address, opening hours and any WIKA authorization evidence to publish.
6. Access/ownership verification for Google Search Console for `al-amaleg.com`, then sitemap submission. A domain and technical SEO do not guarantee first position; useful content, accurate business information, reputation and crawl time also matter.
7. A verified transactional sender on the new domain and acceptance/configuration of the frequent delivery worker. Public RFQ and existing-quotation uploads remain disabled until the email-confirmation/delivery workflow is healthy and tested end to end.
8. Strong admin credentials, approved privacy/retention wording, exact opening stock quantities where required, and final business/visual acceptance.

## Remaining engineering and operating limits

- Finish release verification and the full new-domain technical SEO crawl.
- Complete and test email and upload activation once provider/domain prerequisites are met. The Hotmail contact address alone cannot authenticate transactional sending on the custom domain.
- Existing upload limits remain three files of 2 MiB each; larger uploads require a different upload path. Uploaded documents are not malware scanned. Admin MFA remains a separate improvement.
- Monitoring was explicitly deferred by Nour. Full restore rehearsal/offsite backup arrangements still need their own approved destination; the encrypted 8 October backup was locally authenticated, not a newly completed remote restore exercise.
- Keep dependencies updated and review real field performance after launch. No website can promise zero vulnerabilities or a particular search/design ranking.

## Release result

Pending at this checkpoint; replace this line with exact deployment and verification evidence after completion.
