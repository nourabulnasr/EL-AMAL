## Current delivery and the path to full launch

**8 October 2026 release addendum:** product-interest reporting and30-second report refresh are now live at `/staff/products`. The explicitly approved encrypted backup was locally verified, both quotation/analytics production migrations applied, and application4704626 deployed. Quotation code is deployed but customer submission still depends on the sender and frequent delivery worker. See [current release evidence](../analytics-release-2026-10-08.md) for28 live checks and recovery limitations. This supersedes older backup/migration/analytics status statements in this6October baseline; the PDF remains the6October edition with this linked addendum.

Status date: 6 October 2026. This is the current decision guide for the entire handbook. The detailed chapters that follow have also been corrected for the new hero, quotation implementation and resolved permission findings. Dated test results remain dated; updating a document does not rerun a production test or activate a service.

### The direct answer

The real catalogue, bilingual public website, selected Precision Revealed hero, hosted administration, inventory tools and private demand reports are delivered. Customer enquiry submission, confirmation messages, sales notifications, emailed password recovery and the normal customer attachment journey are not operational yet. The existing-quotation extension is implemented and cloud-tested on the review branch, but its production database migration and activation are outstanding.

**The website is live for review and catalogue browsing. It is not yet 100% ready for the intended customer quotation service.** The launch checklist below defines what must change before that claim is justified. A high design or Lighthouse score cannot compensate for a customer being unable to submit their request.

The old approximate 90% figure was a weighted scope estimate, not a measured readiness score. It is preserved as historical context in project records; this revision does not invent a new percentage. Use the actual capabilities, dependencies and acceptance evidence below to judge completion.

### How to read each status

| Status | What it means |
| --- | --- |
| Live | Released on the stable production website, with the scoped evidence recorded here. It does not mean every real-world scenario has been tested. |
| Built, inactive | Implementation and automated tests exist, but a configuration, migration or operational dependency prevents normal customer use. |
| Waiting for input | A business fact, account authorization, policy or acceptance must come from Nour or the client before the developer can finish it accurately. |
| Engineering remains | Work can be completed by the developer, immediately or after the stated dependency. It is not reassigned to the client merely because it is unfinished. |
| Deferred or additional scope | Explicitly postponed or beyond the present delivered limits. It is not silently counted as complete or made a surprise launch requirement. |

### Release identity and evidence

Production application: `63acd5b3630296e92a7ae8c0955e2a31686bffab`, on `codex/el-amal-foundation`. Stable public URL: https://el-amal-sigma.vercel.app/en, with Arabic at `/ar`. The corresponding deployment is `el-amal-3m6pheeed-nour-abulnasrs-projects.vercel.app`.

Combined hero, security and quotation application: `c2e62620e890274b29868f7fd9424be14a92f7e3`, on `codex/hero-review-and-quotation`. This is the continuation branch, not a claim that all its features are in production. Documentation commits follow that application commit.

The final production workflow [37486441262](https://github.com/nourabulnasr/EL-AMAL/actions/runs/37486441262) succeeded with 142 unit tests, TypeScript, the advisory gate, disposable database regressions, production build and built-server checks. The combined quotation workflow [37486837237](https://github.com/nourabulnasr/EL-AMAL/actions/runs/37486837237) succeeded with 152 unit tests and the additional quotation lifecycle checks. Local TypeScript exhausted native memory on the merged branch; the complete cloud TypeScript/build check subsequently succeeded. Production verification covered 11 scoped route/header checks, not every possible customer action.

### Interface, visual identity and motion

| Subcategory | Delivered, how and why | Remaining and owner |
| --- | --- | --- |
| Selected hero | Live English/Arabic Precision Revealed replaces the search-and-gauge hero. An asymmetric headline and instrument sculpture lead to catalogue and RFQ actions. Catalogue search remains on Products. | Concept choice is complete. Nour/client still reviews the implemented presentation as part of final acceptance. |
| Artwork | The approved concept image is a 70,360-byte WebP instead of a 1,680,432-byte PNG. It is explicitly described as a concept illustration, not an actual product diagram. | Real company identity assets are separate client inputs. Do not substitute this illustration for manufacturer product evidence. |
| Color and typography | Requested navy backgrounds, lighter steel/pale blue, white text and existing orange accents; Newsreader, Manrope and Noto Sans Arabic create display/body/language hierarchy. | Final logo and approved business imagery from client; developer integrates them. |
| Hero movement | Small event-driven pointer depth, desktop scroll compression where supported, working pause control and static mobile fallback. No new WebGL or video engine. | Broader actual-device and OS reduced-motion testing remains engineering work. |
| Smaller interactions | Button lift/sheen/arrow response, link underlines, section settling, progress and product-image crop reveals. Keyboard focus disables the crop to preserve its full outline. | Address specific usability findings; adding more libraries is not a launch requirement. |
| Loading | Branded dismissible entrance plus a separate genuine route-loading status. The fallback now reserves 100svh to prevent a streamed footer jump. | Keep checking route changes; the decorative entrance is not a network-progress estimate. |
| Mobile and access | Bilingual/RTL layout, landmarks, real controls, focus states and motion safeguards. Latest 390px EN/AR hero checks found no horizontal overflow. | Developer completes representative keyboard, screen-reader, zoom and device checks; client reviews target devices. |

Source: `src/components/precision-hero.tsx`, `precision-depth.tsx`, `precision-hero.css`, `src/app/(site)/[locale]/refinement.css`, `styles.css` and `loading.tsx`.

### Catalogue, technical content and contact paths

| Subcategory | Delivered, how and why | Remaining and owner |
| --- | --- | --- |
| Actual supplied catalogue | All 29 photographed main pages became 151 published model groups, with 151 actual manufacturer images, 560 bilingual specification rows and 159 verified download links at publication. | No new catalogue batch is needed. Client technical, Arabic and rights acceptance remains; developer corrects findings. |
| Availability labels | 90 in-stock / 61 out-of-stock model labels follow the supplied folders and the instruction that every model on a main page shares its folder status. They carry a source date. | Client supplies changes. These labels never establish counted warehouse stock. |
| Discovery | Model search, category, type/application filters, native pagination, category routes, related content and zero-result guidance. | Maintain accurate classification as products change; no fictional filters or models needed. |
| Product details | Genuine photographs, bilingual descriptions, specifications, manufacturer datasheets and model enquiry actions. Publication requires source/review/rights evidence. | Staff can edit reviewed content; new image files still need developer deployment because no general Media library is implemented. |
| Industries and information | Oil and gas and general industry pages, About, Contact and Resources. | Client provides genuine company facts, address/hours and approved claims. Extra industries from the original broader proposal need explicit scope reconciliation. |
| Phone and WhatsApp | Conditional contact components and links are implemented. Missing business numbers are not invented. | Client supplies verified numbers including country code; developer configures and tests tap/call/message destinations. |
| WIKA relationship | Evidence-gated bilingual relationship component exists. Manufacturer product identity is separate from distributor authorization. | Client supplies the genuine certificate/listing and approved wording; developer publishes only supported claims. |

### SEO and search visibility

The technical SEO work is live. These are specific implementation choices, not promises of Google positions:

1. **Readable server output:** real product names, descriptions and tables are delivered as HTML. Visitors and crawlers do not depend on a decorative animation to access the content.
2. **Linked site structure:** categories, native pagination, product links and breadcrumbs expose the complete catalogue instead of hiding later products behind a search box.
3. **Page-specific metadata:** localized titles, descriptions and canonicals identify each real page and valid pagination page. This limits generic or conflicting page identities.
4. **English/Arabic alternatives:** reciprocal hreflang, English x-default, language and direction settings connect equivalent pages while preserving each language's URL.
5. **Structured data:** factual organization/website, page, breadcrumb, collection/list and real-product graphs describe visible content. There are no invented ratings, zero prices or distributor claims.
6. **Controlled indexing:** published production content is eligible; previews, admin, APIs and utility quotation pages are excluded. Filter-query duplicates are noindex/follow, while useful category and pagination URLs remain discoverable.
7. **Dynamic sitemap and robots:** eligible bilingual records and image URLs are included; drafts, private records and arbitrary filter combinations are excluded. A robots rule is not a privacy or access-control mechanism.
8. **Sharing and brand assets:** Open Graph, Twitter images and favicon routes resolve consistently across nested URLs.
9. **Full discovery audit:** the latest saved 6 October crawl covered 342 public pages, 342 sitemap entries and 155 image/assets, with zero issues detected by its implemented checks. After the final hero release, scoped live metadata checks also succeeded.

**Still needed from Nour/client:** confirm the final public domain and give authorized Search Console ownership/access. Supply real contact/company facts and approve the technical content. A custom domain is valuable for identity but is not a prerequisite for Google indexing the existing Vercel URL.

**Still needed from engineering:** connect the chosen domain if applicable; coordinate canonical/sitemap/redirect changes; verify ownership and submit the sitemap when access is available; inspect representative URLs and resolve actual indexing diagnostics. Search Console inclusion and search impressions are not currently verified. Real traffic and indexing take observation time; neither an automated SEO score nor a sitemap submission guarantees ranking for “elamal” or “el amal industry”.

### Customer enquiries, existing quotations and email

| Subcategory | Delivered implementation | Present operating state |
| --- | --- | --- |
| Quote basket | Models/quantities persist locally; review step, contact validation and bilingual feedback. | Preparation works. Real public submission remains disabled. |
| Direct RFQ | Model, quantity and requested range without finding a catalogue item first. | Form preparation exists; same inactive mail/intake dependencies. |
| Enquiry recording | Immutable customer snapshot, random reference, repeat-request protection and transactional queues. | Tested with isolated data; no claim of a completed real customer submission. |
| Email confirmation | Expiring proof link, bounded resend and neutral responses, recipient limits and durable jobs. | Needs a verified sender and genuinely running frequent worker. |
| Staff notifications | Wait for real customer confirmation; retries, leases and idempotency reduce duplicate handling. | Confirmed recipient is mohamed.sorour8@icloud.com. Receiving address is not sender-domain verification. |
| Existing quotation | PDF, modern Excel XLSX, JPEG and PNG; contact details and optional notes instead of re-entering model lines. | Built and tested on the review branch; hosted migration not applied and public feature not active. |
| Staff recovery email | Neutral recovery, bounded request, expiry and concurrent-token controls. | Built but disabled until real sender/recovery settings and delivery checks succeed. |
| Scheduling | Native daily 02:00 UTC maintenance; protected frequent-worker integration prepared. Intake checks a recent successful mail heartbeat. | Daily housekeeping does not maintain the 15-minute intake heartbeat. Frequent scheduler terms/access/provisioning remains pending. |

#### Exact existing-quotation limits and customer steps after activation

The customer opens `/en/rfq#existing-quotation` or its Arabic equivalent, enters contact details, requests confirmation and follows the email link. The confirmation screen accepts at most three files, each at most 2 MiB. Uploads occur individually. The customer explicitly chooses **Send files for review** after uploading; uploading alone does not announce a successful staff notification. A completed document request has zero product lines and does not reserve stock or inflate product-demand reports.

JPEG/PNG images are decoded and reconstructed. PDF/XLSX documents receive bounded format checks and AES-256-GCM encrypted private storage. Unsupported legacy XLS, macro-enabled XLSM, password-protected formats and files outside the accepted limits are rejected. The shared logical attachment quota is 64 MiB; files expire after 30 days. Database overhead is additional to that logical quota.

**PDF/XLSX files are not antivirus scanned.** Encryption protects stored bytes; it does not make a file safe to open. Staff must acknowledge this before a forced authenticated download and use their organization's scanning tools. Files are not placed in public assets or attached to notification emails. Larger uploads, automatic malware scanning and external object storage are additional infrastructure work, not delivered capabilities.

#### Administrator steps after quotation activation

1. Sign in as owner or sales at `/admin` and open **Enquiries** at `/admin/collections/enquiries`.
2. Open the request by reference. Check the request kind, email verification and quotation submission time. Do not treat a saved, unfinished upload session as a completed customer submission.
3. Open **Enquiry attachments** at `/admin/collections/enquiry-attachments` and match the enquiry/reference. Check file type and expiry. The current production label is still **Enquiry photos** until the quotation release changes it.
4. Use the download action. For PDF/XLSX, read and acknowledge the unscanned-document notice. Scan locally before opening; keep active/embedded content disabled. Access is restricted to owner/sales.
5. Record permitted workflow status/internal notes. Do not rewrite the immutable customer snapshot to invent models or quantities. Review the document and agree the exact requirement with the customer through the approved sales process.
6. Check **Notification queue** for delivery status. “Queued” is not proof of inbox receipt. Investigate failed/expired deliveries with the owner rather than editing queue internals.

### Security and data protection

| Subcategory | Implemented approach and reason | Remaining boundary |
| --- | --- | --- |
| Permissions | Four job-based roles, private collection checks, field-level protection and action-specific inventory access. Private API probes returned 403 anonymously. | Final individual accounts/roles and periodic access review need the owner. |
| Owner continuity | Owner-only unlock; role changes preserve at least one owner with transaction/lock protection. Login/reset snapshot writes cannot overwrite the current role. | Privileged direct SQL remains outside application protections. Database credentials must be restricted. |
| Credentials and account lifecycle | New/changed passwords require 15-128 characters, reject a small set of obvious choices; five failed attempts lock for ten minutes; production cookie controls. | Previously chosen short password needs replacement. Application MFA and a normal staff-disable/offboarding switch are not implemented; departing staff need an authorized technical revocation procedure. |
| Recovery | Neutral responses, bounded bodies/rates, expiring tokens and serialized reset use. | Real emailed recovery has not been activated or tested in an inbox. |
| Input and abuse | Server validation, same-origin mutation checks, bounded request bodies, pseudonymous rate keys, email limits, queue capacity and worker-health gating. | These reduce abuse; they do not prove immunity to spam or distributed attacks. |
| Private files | Encrypted records, expiring grants, no public read, no-store/nosniff and forced staff downloads. | PDF/XLSX need cautious staff handling; automatic malware scanning is absent. |
| Browser headers | HTTPS/HSTS, framing/object/base/form restrictions, MIME sniffing protection and private referrer policies. | Current CSP is baseline hardening, not a full nonce-based script policy or proof against all XSS. |
| Dependencies | Pinned lockfile and all-severity CI advisory gate; Next 16.3.8, Sharp 0.35.5, source-map-js 1.2.2 and scoped Sass 1.79.6 correction in current release. | Zero known findings at the checked release is time-specific. Maintenance and new advisory checks continue. |
| Verification | Unit tests, disposable PostgreSQL concurrency/access regressions, runtime probes and fresh code review. | No independent penetration-test certification or claim of perfect security. |

**Safe ownership transfer:** at `/admin/collections/staff`, the current owner first promotes the successor to owner and confirms the successor can sign in. Only then change the former owner's role. Bulk staff updates are rejected. A reset does not promote an account. Keep provider-account MFA distinct from the unimplemented application MFA feature.

### Inventory, reporting and staff administration

The private stock console at `/staff/inventory` includes receipts, justified adjustments, verified exact-SKU holds, partial/full release and dispatch, expiry, blocked units, count reviews, optional freshness rules and reconciliation. Unique operation keys prevent an identical retry from moving stock twice; a new operation key remains a new instruction. Posted movements are corrected by additional recorded events, not erased history.

The latest recorded production check found zero exact SKU definitions. This means configuration and opening stock were not supplied; it does not claim the warehouse is empty. The client must define actual ranges/connections/materials and opening quantities before stock promises can be made. The developer imports and validates the data, then rehearses receipt, hold, release, dispatch and reconciliation with staff. This is required for activating stock commitments, not for reading the public catalogue.

Owner/sales reports at `/staff/reports` include demand summaries, date/cohort filtering and CSV export with private access. Dates follow the application's Cairo reporting boundaries. These are saved-enquiry reports, not visitor analytics, revenue or paid-order reports. Document-only quotations are excluded from product demand and automatic stock allocation. Real useful reporting depends on activated intake and actual customer activity.

Catalogue editors manage drafts; owners review and publish. Sales handles enquiries and holds; warehouse handles receipts/adjustments/dispatch/counts; the owner oversees configuration and accounts. The detailed role matrix and screen-by-screen instructions later in this handbook remain the operator reference. No general customer account system or public checkout is included.

### Hosting, recovery and operational resilience

Next.js/Payload are deployed together on Vercel; Neon PostgreSQL stores durable data. GitHub stores code and migrations. Separate development databases keep mutation tests away from production. A Git push does not back up live enquiries, account records, stock history, ignored originals or private environment settings.

A previous encrypted backup was restored into an isolated database: 24 tables and 572 rows with matching fingerprints and constraints. That proves the recorded snapshot could be restored. It does not prove a current pre-quotation backup exists, nor establish an automatic offsite schedule. The pending full encrypted production backup destination is `artifacts/backups/el-amal-2026-10-06-pre-quotation.enc`, relative to this project. It includes private staff/enquiry data; the key stays separately outside the synced project. Automatic approval review rejected the export without specific destination authorization. No export workaround or production quotation migration was performed.

Nour/client must authorize the destination and agree backup ownership, retention and recovery targets. Engineering then takes/verifies the fresh backup, applies the additive quotation migration, verifies the migrated application and sets up an authorized recurring backup location with separate key custody. A rollback must respect database compatibility; switching a deployment alone does not undo a schema change.

External Checkly monitoring remains explicitly deferred by Nour. This handbook does not reactivate it. Internal delivery health and daily maintenance exist, but neither equals independent external outage alerting. Until alerting is authorized, agree who checks operational health manually.

### Performance evidence and its limits

The [final 6 October PageSpeed report](https://pagespeed.web.dev/analysis/https-el-amal-sigma-vercel-app-en/nm5hsmeqea?form_factor=mobile) measured the actual English production homepage after the hero/layout correction:

| Lab measure | Mobile | Desktop |
| --- | --- | --- |
| Performance | 95/100 | 99/100 |
| Accessibility | 100/100 | 100/100 |
| Best practices | 100/100 | 100/100 |
| Basic SEO checks | 100/100 | 100/100 |
| Largest Contentful Paint | 2.4 seconds | 0.7 seconds |
| Total Blocking Time | 60 ms | 70 ms |
| Cumulative Layout Shift | 0 | 0 |

The earlier hero sample had mobile CLS 0.261; reserving the route-loading space removed that shift in the final sample. No legitimate resources were blocked to obtain the result. The hero adds no new runtime library; responsive image priority, reduced hydrated data and optimized font use limit cost elsewhere.

These are individual homepage lab samples, not a whole-site guarantee. Product measurements from September are historical, not remeasured October product scores. There is no recorded real-user field dataset or field INP. Engineering still owes representative EN/AR catalogue/detail/form checks and broader device/accessibility acceptance. Observe real traffic after launch without calling TBT an INP measurement.

### What Nour or the client must provide

These inputs are collected together; passwords, API keys and database credentials belong in secure settings, never in this document or chat.

| Required action | Why it is needed | What engineering does next |
| --- | --- | --- |
| Explicitly authorize the named encrypted database-backup destination | The export includes private records and was previously blocked for missing destination consent. | Capture/verify the current backup, apply the quotation migration and verify release compatibility. |
| Confirm an owned sending domain/address and authorize the sending service | The known iCloud recipient cannot verify a sending domain. | Configure sender/DNS privately; test actual confirmation, sales and recovery delivery. |
| Authorize the frequent scheduler/account terms | Customer intake requires genuine recent worker health. | Provision/authenticate the worker, verify repeated healthy runs and outage behavior. |
| Provide business phone, WhatsApp, address/hours and final company facts | Contact links and business assertions must be real. | Populate EN/AR content, test links and update factual structured data. |
| Provide genuine WIKA evidence and approved wording | Distributor/partner claims need evidence. | Publish the evidence-backed component or keep unsupported claims absent. |
| Confirm final logo/imagery and review technical/Arabic content | Provisional identity and extracted content need business acceptance. | Integrate approved assets and fix specific content findings. |
| Confirm final public domain and Search Console ownership/access | Needed to control official search identity and inspect indexing. | Connect chosen domain, update redirects/canonicals, submit sitemap and inspect URLs. |
| Replace the short admin password and assign named staff roles | Existing account strength and access are owner decisions. | Assist secure setup, check permissions and test recovery after activation. |
| Approve privacy/retention wording and backup arrangements | Customer files, contact data and recovery copies need an agreed operating policy. | Publish approved wording and implement the agreed retention/backup schedule. |
| Supply exact SKUs, opening counts and reservation policy if stock commitments are launched | Catalogue labels do not define warehouse quantities or valid commercial variants. | Import with validation and run staff stock acceptance. |
| Give final business/visual/operational acceptance | Technical tests cannot approve the client's brand or sales process. | Close the release checklist with evidence and remove review notices only when truthful. |

Already supplied and not requested again: all 29 catalogue main pages, the instruction applying stock status to every main-page model, the receiving inbox, approval of PDF/Excel/photo formats, requested color direction and the Precision Revealed hero choice. Checkly remains deferred; accepting unrelated paid plans or integrations is not implied.

### Engineering work that remains ours

**Independent of new client facts:** maintain the corrected documentation; complete wider representative EN/AR device, keyboard, zoom and assistive-technology checks; measure representative catalogue/detail/form performance; fix reproducible failures; maintain dependency and access-control verification. These checks are not all completed by this documentation update.

**After account or content inputs:** finish sender/scheduler provisioning, backup/migration, production quotation configuration, real delivery/upload/recovery acceptance, approved business-content integration, Search Console/domain setup and recurring recovery operations. The developer owns this execution; the client supplies facts/access and accepts the result.

**Unclosed original proposal scope:** the original 10 MB multi-format upload allowance and behavioral/product-event analytics are not fulfilled by the current 2 MiB quotation extension and private demand report. Broader industry content also needs reconciliation with the later two-industry brief. Nour/client must explicitly accept the revised limits or retain these items for implementation; they are not automatically waived or silently counted complete.

**Additional or explicitly deferred:** automatic malware scanning, external object storage, application MFA, a stricter script CSP if pursued, independent penetration testing and external monitoring. Decide which are required by the client's threat model or contracted scope before calling an expanded scope complete. They must not be advertised as delivered today. No payment, checkout or ERP work is part of this launch.

### The full-launch acceptance checklist

The following are proposed closure criteria for the intended enquiry website. They distinguish release blockers from ongoing optimization and optional inventory scope.

| Closure criterion | Current position | Evidence required to close |
| --- | --- | --- |
| Approved public experience and real catalogue | Delivered; final business/content acceptance open | Client accepts current EN/AR pages, technical content and permitted brand claims; corrections verified. |
| Working business contact paths | Inputs outstanding | Verified phone/WhatsApp and contact details resolve on desktop/mobile. |
| Production quotation schema and release | Not migrated or activated | Authorized fresh backup, successful additive migration, compatible deployed version and private-boundary checks. |
| Customer email and sales delivery | Inactive | Real authorized EN/AR customer submission, confirmation, one staff notification, retry/outage recovery and inbox receipt recorded. |
| Existing quotation file journey | Built and cloud-tested only | Accepted PDF/XLSX/photo uploaded, explicitly finalized, visible only to permitted staff, downloaded with the right warning; rejected/expired/oversized cases checked. |
| Staff account and recovery readiness | Login/security controls delivered; credential/recovery setup open | Strong named owner/staff accounts, correct role access and genuine recovery email/reset verified. |
| Privacy and dependable recovery | Draft operating limits and one restore proof exist | Approved policy, authorized current/offsite backups, separate key custody and rehearsed recovery responsibility. |
| Technical/browser acceptance | Automated/cloud/scoped checks complete; broader coverage open | Representative desktop/mobile EN/AR, keyboard, reduced-motion, zoom and screen-reader tasks, forms and failure states checked; material failures corrected. |
| Search handover | Technical eligibility delivered; ownership/submission open | Chosen canonical domain, Search Console ownership, sitemap submission and representative URL inspection recorded. Ranking is not a launch pass/fail guarantee. |
| Original proposal reconciliation | Wider uploads, behavioral analytics and broader industry scope not fully delivered | Client accepts documented scope changes, or engineering implements and verifies the retained requirements. A feature cannot be removed from the completion definition without agreement. |
| Stock commitments, if enabled at launch | Tools delivered; exact data absent | Valid exact SKUs, counted opening stock, approved policy and staff receipt/hold/dispatch/reconciliation walkthrough. Otherwise explicitly defer commitments. |
| Business release decision | Pending | Client accepts the operational workflow; review notices accurately reflect enabled features; operator ownership and support route recorded. |

Completing this list means the agreed launch scope works and has evidence. It does not mean permanent immunity from vulnerabilities, universal accessibility certification, guaranteed inbox delivery, instant indexing or a top-ten award. Those outcomes require ongoing operation and, in some cases, independent parties.

### Release order once inputs arrive

1. Configure verified sender, permissions, policies and protected frequent scheduling without opening public intake prematurely.
2. Take the explicitly authorized current encrypted backup and verify it; apply the additive quotation migration with the tested source revision.
3. Deploy the compatible production build and validate access boundaries, attachment limits and current worker health.
4. Perform authorized real EN/AR enquiry, quotation, staff notification and recovery journeys. Distinguish database acceptance, queued transport and actual inbox receipt.
5. Resolve findings, finish content/domain/search work and rehearse the staff tasks appropriate to the enabled scope.
6. Record client acceptance and enable the appropriate public gates. Verify the stable URL again after activation; keep a recovery procedure available.

The document revision itself performs none of these production changes. It gives the next operator an exact scope and a truthful starting point.
