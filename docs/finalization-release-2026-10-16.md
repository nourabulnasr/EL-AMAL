# Staff recovery, uploads and client handover — 16 October 2026

This record covers the authorized completion work following the 165-product production release. It preserves the approved public design. Final application commit `5b76c21d2bb27c621ff99fa97b8208699b1a76a9` is deployed on https://www.al-amaleg.com, including the main recovery/upload release `165557a` and the subsequent Arabic font-display correction.

## Staff recovery

Payload's admin sends recovery forms as multipart data with a single `_payload` JSON field. The existing guard accepted JSON only, which would have rejected the real admin form even after activation. The guard now accepts that bounded form, rejects extra fields/files and oversized bodies, and forwards only the permitted reset fields. Password-policy errors are readable in the admin.

The isolated real-Payload regression covers email generation through a fake transport, 30-minute token expiry, ten-minute resend cooldown, one-time and concurrent token use, password rules, origin and database rate limits, new-session cookies and revocation of earlier sessions. It changes no real staff account and sends no real email. See [recovery verification](staff-recovery-verification-2026-10-16.md).

After Nour completed Vercel device authorization, `STAFF_RECOVERY_ENABLED=true` was added to **Production only** and activated by the production deployment. Preview remains disabled. Live multipart reset probes returned the expected readable password-policy error and rejected a foreign origin, with no-store and no-referrer headers. These deliberately invalid requests sent no email and changed no password. The actual account owner must perform their own final reset and confirm mailbox delivery.

## Quotation uploads

The extension implements three files of up to 10 MiB each using requests and private download responses of at most 1 MiB. It retains PDF, modern XLSX, JPEG and PNG support, existing file-format restrictions, the 64 MiB aggregate logical allowance, and 30-day final-file expiry. Unfinished uploads expire after one hour; successful-upload receipts support retries for 24 hours.

Only genuinely verified quotation requests can upload. The upload identity is tied to the enquiry, confirmation capability, filename, type, byte length and SHA-256. Full-file validation precedes publication to staff. Quotas include reserved unfinished files and serialize with the older upload path. Finalization refuses an unfinished file and queues one owner alert after the customer explicitly submits the saved files.

The client shows progress, can resume in the same open page, and distinguishes an already-saved file from a cancelled selection after a lost response. Staff downloads require a current owner/sales session for every part; documents require an explicit unscanned-file acknowledgment. The browser verifies the assembled length and SHA-256 before saving. No customer file is sent to a new service.

The additive migration is `20261016_160000_quotation_upload_chunks`. It widens the attachment-size constraint and adds encrypted staging and final-part tables without rewriting existing files. Existing small-file clients and stored files remain readable. The down migration refuses to discard new files or pending uploads.

Format checks and image reconstruction are **not antivirus scanning**. Automatic document scanning is not claimed. An approved private scanning service and any additional storage capacity require an operating/privacy decision before provisioning.

## Performance and accessibility

Focused corrections keep scroll-reveal text fully opaque for contrast, preload the existing responsive homepage image, restore keyboard focus after manually reopened consent settings, add the missing Similar products report filter, and correct Arabic catalogue result wording.

The [dated audit](performance-accessibility-2026-10-16.md) records eight-route Lighthouse measurements and their variability. Targeted browser checks cover mobile/narrow layouts, keyboard menu/skip navigation, product radio options, technical-section focus, form validation, combined filters and language preservation. No real enquiry, email, quotation or basket entry was created during those checks.

Actual native zoom, device-level reduced motion, screen-reader speech and physical-device behavior are not inferred from automated scores. Field Core Web Vitals and universal 90+ mobile performance are separate from the measured lab samples.

## Client operating guide and product measurements

The maintained source is [the client admin guide](client-admin-guide.md). The private local PDF includes sign-in/recovery instructions, product clicks and CTR, 30-second refresh, filters and CSV export, demand reports, enquiry statuses, private quotation downloads, catalogue editing, roles and stock workflows. It includes a dated aggregate example of all 20 products with measured activity. The three products with a selection each are not labelled best sellers; all have small samples.

The guide's PDF and live aggregate snapshot stay outside Git. They contain no customer contacts, passwords or credentials. The generator and general instructions are maintained in the repository.

## Release and verification record

- Production catalogue preflight: 165 published groups; three existing attachments totalling 134,210 bytes. No customer file content was read or exported.
- Recovery setting saved successfully to Production and active in the tested deployment.
- Independent upload review identified the lost-completion-response cancellation case; implementation and regression coverage were corrected.
- [Cloud quality run 38945065340](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38945065340) succeeded: 217 unit tests, TypeScript, dependency advisory checks, migrations, real-database regressions, production build and built-route checks.
- Dedicated development migration succeeded first. Production migration succeeded on 16 October at 21:16 Cairo, batch 13; all three new tables were confirmed. The first local loader attempt exhausted memory before applying any migration. Read-only verification confirmed no partial schema; an unchanged retry succeeded. Existing file count/bytes and all 165 published groups were preserved.
- Production branch `codex/el-amal-foundation` advanced without force to the tested commit. Vercel deployment `8T3un5YUAYvkxWHKBTKM2Tn4Yo4o` / GitHub deployment `7126325401` reported success. Immutable deployment: https://el-amal-ns6kty05e-nour-abulnasrs-projects.vercel.app.
- Live checks: admin login/recovery and both RFQ pages returned 200; the Arabic and English 10 MiB limits are present. Invalid customer upload capabilities returned 403, and an anonymous request for a nonexistent private attachment returned 404. Both public submission capabilities remained enabled and the five-minute worker had a recent successful run.
- Authenticated production product-interest and verified-demand reports returned 200, with no-store, usable CSV and the Similar products context; anonymous report access remained denied. The short-lived verification session was logged out. No artificial product clicks were generated.
- Post-release browser inspection confirmed Arabic RFQ wording. Earlier focused keyboard/layout checks and the exact preview checks are recorded in the audit. A later browser transport failure prevented rechecking consent focus on production; the fix is implemented, but that final interaction is not counted as observed.
- Final client PDF has nine pages and 14 links. Every page was rendered and inspected, the enquiry-status table was kept together, and extracted content/header/footer/link checks succeeded. Output: `output/pdf/EL_AMAL_Client_Admin_Guide.pdf` (private local artifact).
- Post-release performance results, including local audit-tool failures excluded from acceptance, are maintained in [the dated audit](performance-accessibility-2026-10-16.md).
- The first independent eight-route audit completed as [run 38947327009](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38947327009): accessibility 100 everywhere, SEO 100 on indexable pages, performance 72–99. Arabic font-related movement reproduced, so the same Noto font now uses optional display to prevent late swaps on slow first loads. Quick/cached loads retain Noto; English pages do not preload the Arabic face.
- The bounded font follow-up `5b76c21` passed [full quality run 38948924842](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38948924842) and deployed successfully as `B37EJfsDLKKAZ9ePQBCQPkM2pisU` / `7126833657`, https://el-amal-dgv3iwogz-nour-abulnasrs-projects.vercel.app. Live CSS confirmed optional font display; the recovery/quotation access probes still succeeded. A fresh independent audit was dispatched after this final deployment.
- Final audit [38949697053](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38949697053) completed all eight routes: CLS 0, accessibility 100, best practices 100 and SEO 100 on indexable pages. Performance remained variable (54–89 in this run; the 54 sample carries an explicit slow-runner-CPU warning). The dated audit preserves both independent matrices and the remaining measurement/device limitations. Arabic home/product and English home audit screenshots were inspected. No consistent 90+ or field-CWV claim is made.

The current owner/client action register is [final client inputs](final-client-inputs.md). Domain/DNS and sender setup are already complete. Checkly remains deferred at Nour's request.
