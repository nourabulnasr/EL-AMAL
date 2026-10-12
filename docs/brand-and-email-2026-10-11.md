# Brand update and quotation activation

Updated: 11 October 2026. This supplements the domain launch record and handbook.

## Live setup progress — 12 October 2026

The browser connection recovered. Resend now reports **Verified** for `al-amaleg.com`. Nour supplied the dedicated **EL AMAL production quotations** key; its dashboard confirms Sending access restricted to this domain. It is saved as a production Secret in Vercel, without copying its value into project files. The sender is `enquiries@al-amaleg.com`. A generated worker secret and the mail transport settings are configured in production. Deployment `dpl_5MHjS3zSmq2aD8MK2BGnnfDe8NB4` is Ready on the custom domain, using unchanged application5135f14.

Manual Inngest sync to `https://www.al-amaleg.com/api/inngest` succeeded. The registered function runs every five minutes. Its19:40UTC maintenance execution completed without errors; after transport activation, the19:45UTC execution recorded genuine `complete` delivery health with zero failures. Automatic approval review initially rejected premature transport activation; the actual scheduler execution and empty-queue checks established the prerequisites for the subsequently approved configuration. No protection was disabled and no heartbeat was fabricated. A clearly labelled non-order RFQ was queued for the previously confirmed owner address to test real delivery. Public intake remains closed while that test is completed.

Google Search Console has verified Domain property `al-amaleg.com` under the approved Google account. The sitemap was submitted. Its initial report remains **Couldn't fetch**, but Google's own live inspection on12October at22:38Cairo time returned **Page fetch: Successful**, **Crawl allowed: Yes**, and **URL is available to Google**. Do not describe sitemap processing as successful until its report confirms that. Indexing requests for `/en`, `/ar` and `/en/products` were accepted into Google's priority crawl queue; these URLs are not yet confirmed indexed. Keep the saved DNS verification record. No additional DNS action is currently requested from Nour.

Remaining for this activation: second healthy scheduled mail run; actual confirmation and owner-notification delivery evidence; private quotation file/final-submission checks; public RFQ/quotation flags; final customer-facing verification and handover. The test does not reserve inventory. Human inbox receipt and final business acceptance are distinct from provider acceptance. Earlier checkpoints below are historical where they conflict with this section.

## Latest activation checkpoint — 12 October 2026

This section supersedes the earlier terms-required status below. Both providers now recognize the accepted terms. Inngest was provisioned on its explicitly selected Hobby (Free) plan and connected to production; `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` are present as encrypted production variables. No paid plan was selected. The current Vercel deployment is Ready: `dpl_6R7vYKquE2TDgnPpicttpFAbYV72`, `el-amal-ptbyxnxa1-nour-abulnasrs-projects.vercel.app`, serving the existing application commit `5135f14` and the purchased domain.

The Inngest resource is `account-cinnabar-bridge` (`ir_wdjJINyRVBJuQlfd`). Its automatic sync tried the Vercel branch URL and failed with "We could not reach your URL." The dashboard manual-sync form is prepared for the public endpoint `https://www.al-amaleg.com/api/inngest`; successful registration and scheduled runs are not yet confirmed. Unsigned public GET returns401, demonstrating the deployed signing gate. Do not disable deployment protection or treat provisioning as successful delivery health.

Resend's Marketplace plan list for this team offered only Pro ($20/month) and Scale ($90/month), so no resource was purchased there. Nour signed in to the direct Resend account. The domain `al-amaleg.com` was created in Ireland (`eu-west-1`), ID `fd5209c2-d14a-4efe-aee2-93ba0bb0b6e0`, with sending enabled and receiving disabled. Nour saved the exact provider-generated records in Namecheap. Public DNS resolved all three correct values; the last Resend screen still showed Pending while checking DKIM and return-path propagation. Verify provider status again before enabling mail.

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `rsend` | `rsend-euw1.forge.rmta.net` | Automatic |
| CNAME | `send` | `send.forge.rmta.net` | Automatic |
| TXT | `resend._domainkey` | The complete public DKIM value below | Automatic |

```text
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsLFn9tpHDO3E4V+/LrZZfQOj/AGVQcCTf/Qs4XBo/+3wsFqzSBebp5ScUlZU2byqJJnFShQhZBhaGmO+hklMMuDalO/cou/j0nmLW8E9DJ4DjIzR11fi/3yR/UrFTUVRSOt0fRWgJbrPMnBFP3njmoG44drGRzFLEwouxItuO2QIDAQAB
```

These are the actual account records, not the older Amazon SES MX/SPF examples in generic documentation. Namecheap's existing apex forwarding MX/SPF records were preserved. No DMARC record was observed. No Resend API key was created: the sending-access domain selector offered only All domains while verification was pending. Create a dedicated sending-only key restricted to this domain once available, with the required action-time credential approval; never use keys belonging to other projects or print the new secret.

Google Search Console supplied this TXT record for Domain property `al-amaleg.com` under `nourabulnasr@gmail.com`:

```text
Host: @
Value: google-site-verification=BldXHBNDZTi1Jzrs-wVLqedQxlggYETihFIgkUwkNr4
TTL: Automatic
```

Nour confirmed saving it and explicitly approved verifying this Google account as owner. The record is publicly visible. The browser crashed during the Verify action, so ownership success, sitemap submission and indexing requests are not yet established. Resume by checking the property state; do not ask for the same ownership approval again. Browser-control recovery repeatedly failed, and a request to reopen the browser was left pending.

A fresh live technical audit completed on11 October:342 pages,342 sitemap URLs,155 assets,151 product pages in each language,zero issues found by the audit. It checks titles/descriptions, canonical and language alternates, structured-data presence, public indexability, private-route exclusions and image responses. Evidence: `artifacts/2026-10-11/email-launch-seo-audit.json`. This is not proof of Google indexing, ranking, rich-result eligibility, visual accessibility or field Core Web Vitals.

Public intake remains disabled. Remaining work is provider verification and a domain-restricted sending key, production mail settings, successful Inngest sync/two healthy scheduled executions, controlled confirmation/upload/final-submission and inbox-receipt tests, then public activation. No customer email has been sent in this setup session.

### Manual dashboard handoff requested by Nour

Browser control repeatedly failed and Nour requested the remaining manual steps. Existing DNS and ownership approvals remain valid.

1. In [Resend domain settings](https://resend.com/domains/fd5209c2-d14a-4efe-aee2-93ba0bb0b6e0), confirm **Verified**. If Pending remains, use the available verification/recheck control and allow DNS propagation; preserve the exact saved records.
2. In [Resend API keys](https://resend.com/api-keys), create **EL AMAL production quotations** with **Sending access**, restricted to **al-amaleg.com**. If the domain is not selectable, finish its verification first. Do not choose Full access or reuse another project's key.
3. In [the Vercel EL AMAL project](https://vercel.com/nour-abulnasrs-projects/el-amal), open Settings → Environment Variables. Save the key as `RESEND_API_KEY`, Production only, Sensitive. Also add `MAIL_PROVIDER=resend` and `MAIL_FROM=enquiries@al-amaleg.com`, Production only. This is the transactional sender, not a newly created mailbox. Do not paste the key into chat, Git, or a shared document. Leave the public-intake launch flags to the release checks.
4. Open [Inngest manual sync](https://app.inngest.com/env/production/apps/sync-new), choose Production and Sync manually, enter `https://www.al-amaleg.com/api/inngest`, then Sync app. Confirm app `el-amal-delivery` and function `process-quotation-delivery`. If it reports an error, supply the error text without revealing keys. Do not turn off Vercel deployment protection.
5. In [Google Search Console](https://search.google.com/search-console), use `nourabulnasr@gmail.com`, select or add Domain property `al-amaleg.com`, and Verify. Its TXT value is already correct in public DNS. Submit `https://www.al-amaleg.com/sitemap.xml` in Sitemaps and inspect/request indexing for the English and Arabic homepages.
6. Report the non-secret outcomes: Resend Verified; production key saved; Inngest app synced; Search Console verified and sitemap submitted. The developer then completes production secrets/flags, deployment, scheduler health and a controlled real-email/file-submission test before public intake is opened. Provider acceptance and inbox receipt remain distinct checks.

Google's published guidance does not guarantee crawling, indexing or top rankings. Technical setup is a prerequisite; useful accurate content, company information, relevant mentions and ongoing performance/indexing review remain necessary. [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

### What happens after a customer sends an existing quotation

1. The customer chooses the existing-quotation route and supplies contact details instead of rebuilding product lines.
2. The website emails a confirmation link. Confirmation is required before file upload.
3. The customer uploads up to three PDF, XLSX, JPEG or PNG files, each up to2MiB, then selects **Send files for review**. Uploading alone does not notify sales.
4. Final submission atomically marks the enquiry submitted and queues the owner notification. The confirmed recipient is `mohamed.sorour8@icloud.com` unless explicitly changed in production settings.
5. The worker sends a reference-only email; it does not email attachments or customer contact details. The owner signs in at `https://www.al-amaleg.com/admin/collections/enquiries` to review details and securely download the files.
6. Files are encrypted in private storage and expire after30 days. Only owner/sales staff can download them. PDF/XLSX downloads carry an explicit unscanned-document warning; format validation is not antivirus scanning.

Ordinary RFQs use the same reference-only notification after customer email verification. Sender verification, mail transport and worker health are prerequisites for both routes; code already deployed does not mean they are publicly activated.

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

## Release result

Application `5135f1483ee5c4d419f493e070062fee962681f2` is now live on `https://www.al-amaleg.com` through Vercel deployment `dpl_67xMmyu3ZZpDSE4NAxgSF22GP6cs` (`el-amal-9im32fabh-nour-abulnasrs-projects.vercel.app`). The production branch is `codex/el-amal-foundation`; the work and handover remain on `codex/hero-review-and-quotation`.

Both complete cloud runs succeeded: [review branch](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38101069918) and [production branch](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38101250517). They covered167 automated tests, TypeScript, the dependency advisory gate, disposable PostgreSQL migrations/regressions, production build and built-route checks. No production migration was needed or performed for this increment.

Thirty-two live HTTP/markup/image checks succeeded after Vercel reported Ready: both language homepages, all three frames, the three logo placements, original and optimized image delivery, Organization data, primary canonical and language alternates, public indexability, robots/sitemap, and inactive/noindex scheduler GET and HEAD behavior. Evidence: `artifacts/2026-10-11/brand-live-checks.json` (ignored local artifact). This was a targeted release check, not a new full342-page SEO crawl or Google indexing confirmation.

Provider activation remains pending. The new scheduler is deployed but inactive, and public customer RFQ/existing-quotation submission stays disabled. No real email was sent. Browser visual/mobile checks still need a working browser connection and client acceptance. The temporary local preview used for HTTP checks has been stopped.
