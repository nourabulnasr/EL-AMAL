# Email and quotation activation — 13 October 2026

This record supersedes older email-setup instructions. The receiving address was corrected by Nour on 13 October: **alamal4trade@hotmail.com**, matching the website footer. The earlier iCloud address is no longer the owner's notification destination.

## Addresses and responsibilities

| Purpose | Address / destination |
| --- | --- |
| Owner alerts for ordinary RFQs and submitted quotation files | alamal4trade@hotmail.com |
| Transactional sender | enquiries@al-amaleg.com, through verified Resend domain al-amaleg.com |
| Customer confirmation | The email address entered by that customer |
| Enquiry details | https://www.al-amaleg.com/admin/collections/enquiries |
| Private files | https://www.al-amaleg.com/admin/collections/enquiry-attachments |

The sender address does not itself create a mailbox. Resend credentials are stored as a sensitive Production variable in Vercel, never in source control. The source defaults and example environment now also use Hotmail, and the explicit production recipient setting takes precedence.

## What the customer and owner do

1. A customer submits contact details with either selected products, a model/quantity/range, or an existing-quotation request. This saves an enquiry; it does not reserve stock or place an order.
2. A confirmation email is queued to the customer's entered address. The scheduled worker normally runs every five minutes. The customer opens the link and presses Confirm on the website.
3. For an ordinary RFQ, verification makes the owner's alert eligible for delivery.
4. For an existing quotation, the verified customer can upload up to three PDF, XLSX, JPEG or PNG files, each at most 2 MiB, then choose **Send files for review**. Uploading alone is not final submission. Legacy XLS, macro-enabled workbooks and unsupported formats are rejected.
5. The owner receives a reference-only alert at Hotmail, signs in to the admin, and reviews the enquiry and its private files. Customer details and file contents are not attached to email. Owner and sales roles can download files; anonymous visitors cannot.
6. Staff follow up through the business's normal quotation process and record the enquiry's status. Use the **Notification queue** for actual transport status, rather than the legacy enquiry delivery-status field.

Files are encrypted in private database storage, expire after 30 days and share a 64 MiB logical quota. PDF/XLSX format validation is not antivirus scanning: staff see an explicit warning and must acknowledge it before downloading. These limits remain different from the original proposal's 10 MB allowance.

## Evidence gathered

- Resend domain verified; dedicated domain-restricted sending key configured in Production.
- Inngest public-domain application sync completed; real five-minute worker runs recorded complete with zero failures and fresh timestamps. Automatic branch-URL sync remains unreliable; the working application uses https://www.al-amaleg.com/api/inngest.
- English and Arabic customer confirmation emails were accepted by the receiving mail server. The controlled test links were exercised through the real website.
- The ordinary test RFQ notification was delivered to **alamal4trade@hotmail.com** at 01:05 Cairo time on 13 October. Resend message ID: `01a13225-cc95-75e7-99b9-e856536165f5`.
- One earlier quotation notification went to the historical iCloud test destination before Nour corrected the owner inbox. It cannot be recalled and was not represented as a Hotmail test.
- The Arabic file journey successfully saved a PDF, XLSX and PNG and explicitly finalized them into one staff notification. The two requests are labelled launch tests, not orders.
- Nine live private-file checks succeeded: real owner authentication, anonymous denial, document warnings, cross-origin rejection, authenticated download integrity, forced downloads and private caching. PDF/XLSX hashes matched the uploaded fixtures; the reconstructed PNG retained the expected dimensions.
- The native browser download-event observation timed out. Separate real authenticated HTTP downloads succeeded; these are distinct results.
- Twenty-nine focused enquiry/file/security unit checks succeeded after the recipient correction. Local TypeScript ran out of native laptop memory; the cloud TypeScript result succeeded. Final cloud workflow and deployment evidence are recorded below once complete.

Provider **Delivered** means the receiving mail server accepted a message. The client has not yet confirmed Inbox versus Spam placement. No guarantee of delivery to every future mailbox is implied.

## Google status

The **al-amaleg.com** domain property is verified in Search Console for **nourabulnasr@gmail.com**. The sitemap was submitted and indexing requests for `/en`, `/ar` and `/en/products` were accepted into Google's queue.

Search Console's sitemap report still showed **Couldn't fetch**, although Google's own live URL test reported successful fetching, allowed crawling and allowed indexing for the sitemap. Direct HTTPS fetching also returned 200. This report remains an unresolved Google-processing follow-up; submission is not a processed sitemap or an indexed page. No extra DNS record is currently needed, and ranking is not guaranteed.

## Remaining human input and operating decisions

- Confirm whether the Hotmail test arrived in Inbox or Spam and accept the sales workflow.
- Replace the old short admin password securely and assign named staff accounts/roles; no password was changed during this activation.
- Supply CEO/company facts and photos, the additional product folder and the three chosen homepage products.
- Supply any still-missing verified business contact facts and evidence for distributor/partner claims.
- Accept privacy/retention and upload limits; define exact SKUs/counts before making warehouse stock commitments.
- Agree backup ownership, schedule and recovery responsibility. External Checkly monitoring remains deferred at Nour's request.

Staff recovery email activation and a genuine owner-completed password-reset journey remain separate, unfinished work. The technical scope does not include an independent penetration-test certification, automatic malware scanning or guaranteed search ranking.

## Release status

Application `d1a783e45652c6195abc8b404082f64601d0df91` is live on the production branch `codex/el-amal-foundation`, Ready deployment `dpl_W9ZDbP8RGHHv3ihrQ6zgUJmKHuSE` / `el-amal-4qpyl97ie-nour-abulnasrs-projects.vercel.app`, serving https://www.al-amaleg.com.

Both full cloud runs [38314977814](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38314977814) and [38315260531](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38315260531) succeeded: unit/permission checks, TypeScript, dependency advisory gate, disposable PostgreSQL migrations/regressions, production build and built-route checks. No production schema change was needed for this release.

Eight final live API checks succeeded. Both intake capabilities return true; cross-origin and malformed submissions are rejected; retrying each of the two existing controlled requests returns its original reference without adding another enquiry, confirmation or notification. The worker remained complete with zero failures at 01:15 Cairo time. English and Arabic public quotation forms, their contact fields and the active site-status message were verified in the browser.

Evidence: `artifacts/2026-10-13/public-intake-checks.json`, the two `quotation-intake-live-*.jpg` screenshots, and `artifacts/2026-10-12/live-quotation-files-checks.json`. The Hotmail delivery screenshot is `artifacts/2026-10-12/hotmail-notification-delivered.jpg`; its folder date reflects the start of the session, while the delivery occurred after midnight Cairo time.

**RFQs and existing-quotation uploads are now publicly enabled.** This does not close staff recovery, remaining client content, Inbox/Spam acceptance, Google sitemap processing or broader launch limitations described above. The older compiled handbook PDF remains a dated edition; this live addendum and the editable readiness chapter carry the current status.
