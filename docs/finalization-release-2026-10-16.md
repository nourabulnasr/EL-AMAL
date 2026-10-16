# Staff recovery, uploads and client handover — 16 October 2026

This record covers the authorized completion work following the 165-product production release. It preserves the approved public design. The final deployment and live verification are recorded below when completed; preparation is not a production-release claim.

## Staff recovery

Payload's admin sends recovery forms as multipart data with a single `_payload` JSON field. The existing guard accepted JSON only, which would have rejected the real admin form even after activation. The guard now accepts that bounded form, rejects extra fields/files and oversized bodies, and forwards only the permitted reset fields. Password-policy errors are readable in the admin.

The isolated real-Payload regression covers email generation through a fake transport, 30-minute token expiry, ten-minute resend cooldown, one-time and concurrent token use, password rules, origin and database rate limits, new-session cookies and revocation of earlier sessions. It changes no real staff account and sends no real email. See [recovery verification](staff-recovery-verification-2026-10-16.md).

After Nour completed Vercel device authorization, `STAFF_RECOVERY_ENABLED=true` was added to **Production only**. Preview remains disabled. This setting takes effect with the next production deployment. The actual account owner must perform their own final reset and confirm mailbox delivery.

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
- Recovery setting saved successfully to Production; application deployment pending at this preparation checkpoint.
- Independent upload review identified the lost-completion-response cancellation case; implementation and regression coverage were corrected.
- Final integrated cloud checks, migration, deployment, post-release HTTP/UI checks and PDF rendering are pending at this checkpoint.

The current owner/client action register is [final client inputs](final-client-inputs.md). Domain/DNS and sender setup are already complete. Checkly remains deferred at Nour's request.
