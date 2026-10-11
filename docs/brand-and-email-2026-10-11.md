# Brand update and quotation activation

Updated: 11 October 2026. This supplements the domain launch record and handbook.

## Prepared changes

The client supplied the final logo as a 756 × 181 PNG screenshot. The unchanged file is `public/brand/el-amal-logo.png`; a shared Next.js Image component displays it in the public header, footer and dismissible entrance. Explicit dimensions reserve its aspect ratio, responsive image sizes avoid oversized downloads, and the footer image loads lazily. Organization structured data now identifies this logo. No invented replacement mark was generated.

The three requested homepage text groups now have pale-blue borders and responsive padding: measurement categories, the quotation process, and industries. The quotation frame contrasts with its lighter-blue section. White text, existing orange accents, bilingual text and scroll reveals remain. The frame treatment adds no JavaScript animation dependency and preserves reduced-motion behavior.

The new server-only Inngest adapter exposes `/api/inngest`, with a five-minute schedule, one concurrent run and two scheduler retries. It calls the same bounded delivery runtime as the existing daily maintenance endpoint, preserving the database lease, per-message retries and idempotency. It runs only in Vercel production with CMS credentials, the operations flag and a signing key. Explicit cloud mode rejects unsigned execution even if a development override is present. Preview/local endpoints return 503. Only outcome/counts are returned to scheduler history; exceptions become generic errors. This is prepared code, not evidence of a registered or running cloud schedule.

## Email activation status

Nour selected Resend and clarified that email verification has **not** been completed. The public Hotmail address is a contact address, not a verified transactional sender. The previously confirmed private sales recipient remains `mohamed.sorour8@icloud.com`.

Vercel returned `integration_terms_acceptance_required` for both Resend and Inngest. After Nour reported completing the steps, retries still returned that status and the project resource inventory still listed only Neon. At Nour's request, both provider acceptance pages were queued in this chat. Do not treat the user acknowledgement alone as proof of successful provisioning; complete the actual integration checks.

Remaining activation work:

1. Finish the Resend and Inngest account/terms steps under `nour-abulnasrs-projects`; connect the free resources to production. No paid plan has been selected.
2. Add `al-amaleg.com` in Resend and obtain its exact DKIM/SPF records. Add them to Namecheap without replacing the website A/CNAME or existing mailbox records. Domain authentication uses DNS; an inbox link alone is insufficient.
3. Confirm the sender is verified, configure production-only sending settings and a strong worker secret privately, then register the signed schedule against the public production origin. Do not put keys in chat or Git.
4. Observe fresh successful delivery health and test confirmation, PDF/XLSX/photo upload, final submission and receipt in the intended inbox. A provider-accepted message is not proof of inbox receipt.
5. Enable the public RFQ and existing-quotation flags only after the prerequisites are real and verified. Until then the existing fail-closed behavior remains.

## Search Console: exact client steps

1. Sign into [Google Search Console](https://search.google.com/search-console) with the intended business Google account.
2. Add a **Domain** property named `al-amaleg.com`, without `https://` or `www`.
3. Copy Google's exact TXT verification value, beginning `google-site-verification=`.
4. In Namecheap → Domain List → Manage → Advanced DNS, add a TXT record with Host `@`, Google's exact Value and Automatic TTL. Keep the existing website and email records.
5. Return to Search Console and select Verify. Keep the TXT record after verification.
6. In Sitemaps, submit `https://www.al-amaleg.com/sitemap.xml`, then inspect representative English and Arabic URLs.

The developer can check the published TXT value and technical crawl behavior; the business must own the Google account/property. Verification and technical SEO do not guarantee immediate indexing or a particular search position. Sources: [Google ownership verification](https://support.google.com/webmasters/answer/9008080?hl=en) and [sitemap reporting](https://support.google.com/webmasters/answer/7451001?hl=en).

## Verification and remaining assets

Local TypeScript and 167 automated tests succeeded. The scheduler tests exercise disabled/preview boundaries, unsigned/expired-signature rejection, result privacy and generic failure handling. Package installation reported zero known advisories; existing locked package versions were unchanged. Twenty local HTTP/markup/image checks succeeded for both languages, all three frames, header/footer/entrance logos, Organization logo data and image optimization. The local scheduler endpoint returned 503 as intended.

Browser navigation and CDP frame reads timed out. No new visual approval, mobile screenshot review, Lighthouse measurement, Google indexing proof or live email journey is claimed. Cloud build and production release evidence will be recorded below after completion.

CEO/company material and the new product folder/chosen three are still awaiting the client. Existing products have not been replaced. The supplied logo and border examples are now received; do not ask for them again. A vector logo would be an optional later quality improvement, not a blocker for using the supplied file. Upload limits and unscanned-document disclosures remain as documented in the quotation guide.
