# EL AMAL progress

## Current milestone — stock completion, reporting and verified recovery

Implemented partial dispatch/release, blocked balances and audited physical counts with an optional explicit stock-freshness policy. Added owner/sales demand reports and CSV exports at /staff/reports; arbitrary customer text/contact fields are excluded. Closed independent-review pagination and backup safety findings. Public font definitions preserve the approved design while removing about202KB of unnecessary English font downloads (source measurement; new live Lighthouse result pending).

137 unit tests, integrated TypeScript and isolated real PostgreSQL stock/report regressions succeeded. Additive migration20260929_141342_inventory_completion applied to development and hosted. A real encrypted backup restored into a random separate development database with all24 tables/572 rows/fingerprints and constraint counts matching; temporary database removed. Backup key is outside the OneDrive project. See docs/database-recovery.md. Automatic offsite backups are not configured.

External monitoring is deferred at Nour's explicit request. The free Inngest scheduler requires Vercel terms acceptance; no resource or email sender has been provisioned. Existing daily maintenance remains active. Public intake and password recovery delivery remain disabled. New stock/report deployment and browser verification are pending in this source checkpoint; the stable site still runs the preceding verified release below.

## Latest release — 29 September operations and technical SEO

Implemented private stock ledger/holds/dispatch/reconciliation and staff UI; encrypted verified-enquiry JPEG/PNG photos; authenticated bounded maintenance, queue health/capacity and stale-mail-health admission; stronger staff password/recovery safeguards, including a reproduced concurrent-token reset fix; complete bilingual technical SEO and full-route audit tooling. See docs/operations-release-2026-09-29.md and dedicated runbooks.

122 unit tests and TypeScript succeeded. Real isolated development regressions succeeded for inventory, delivery operations, customer intake and staff/photo security; fixture schemas removed and no external mail sent. Reviewed additive migration applied development and hosted. Undici patched; remaining audit is five moderate development-chain entries, zero high/critical. Local build hit host native-memory exhaustion after compilation; successful Vercel and GitHub Linux builds provide the build evidence.

Vercel authorization renewed. The actual project plan is Hobby. Production indexing, private-photo handling, scheduled operations and retention are configured. The registered native schedule runs daily at 02:00 UTC; sender/frequent-mail-scheduler still missing. Customer intake and password-recovery delivery remain off.

Implementation 9a09e82 built successfully but its Payload import-map URL failed at runtime; immediately rolled back to the preceding working deployment. Fixed the Webpack/Node URL incompatibility and customer-upload/CMS route collision in 2960526. Tested a protected repaired candidate before promotion. The Git deployment of the same repaired commit is now production: dpl_7q6FL31KfkE6K7nqszuMbQ7asBSH, el-amal-4ovl67ltk-nour-abulnasrs-projects.vercel.app. Stable URL remains https://el-amal-sigma.vercel.app. GitHub run36505826682 succeeded, including the new disposable-PostgreSQL CMS build and actual built-server startup checks. Neither build success alone nor a Ready deployment is treated as runtime proof.

Full live crawl: 342 public pages, 342 sitemap entries, 155 assets, zero detected audit issues, including all151 products in both languages. Live anonymous boundaries, owner login/private stock page and authenticated maintenance succeeded. Maintenance recorded zero email attempts and no fabricated mail-success timestamp. Production has zero exact SKU definitions; catalogue labels are not counted stock. Browser confirmed owner stock/maintenance screens, no stock-page accessibility findings or mobile overflow, reduced-motion entrance suppression and keyboard skip link. Public notice/login landmark findings corrected in ff5aba2 and deployed as dpl_3jakviTgeTiLBNcPthU8s888gSmE. Ten representative public/login routes and the private stock page now have zero axe violations in the checked rules; manual-review items remain. Arabic actual product content works with JavaScript disabled; initial noncanonical test slug corrected. Evidence: artifacts/2026-09-29/launch/.

Final source release b1c7632 is live as dpl_869XeFsv2NEteNwxHPisnBDCKWBs (el-amal-8q8uv191u-nour-abulnasrs-projects.vercel.app). GitHub run36507411015 completed successfully on that exact commit. It includes ff5aba2 accessibility fixes and81a8365 image/payload improvements, plus a regression-tested fix keeping CMS Critical-CH theme negotiation off public routes. Runtime confirms no public restart header, eager/high-priority detail photo and60,600-byte uncompressed product HTML versus140,383 previously. Basket add/quantity/reload/Arabic switch/remove, model search and menu Escape/focus checks succeeded after the payload change; isolated browser data removed.

Mobile Lighthouse on actual content: product performance57→84, LCP5.8→3.4s, TBT590→160ms, CLS0. Final homepage sample78, LCP4.0s, TBT330ms, CLS0. Both samples report SEO100/accessibility100/best-practices100. These are local simulated lab results, not field compliance, full accessibility or perfect SEO. Performance90+ and LCP2.5s targets are not met by these samples and remain open. Do not reuse an older demo-homepage100 as current catalogue performance evidence.

Overall full-scope estimate is now about85% (84% weighted, rounded; uncertain). Real email/recovery activation still needs an owned sending domain/provider and frequent scheduler. Remaining engineering/acceptance includes broader document scanning/storage, original stock-policy extensions, demand reporting/exports, external alerts/restore rehearsal, performance targets and full launch review. Client facts/configuration/approval remain listed separately in docs/final-client-inputs.md. This release is not full operational launch completion.


## Latest checkpoint — 28 September complete real catalogue publication

Nour instructed publishing every actual catalogue entry with specifications and real photos. All29 main pages now map to151 model-group entries (90 in stock,61 out of stock),151 original manufacturer images and560 bilingual technical rows.159 official PDF downloads verified;150 entries have datasheets,M12 cable uses catalogue page29. Source/model exceptions corrected. Details: docs/catalogue-publication-2026-09-28.md and catalogue/2026-09-27/README.md.

Implemented validated CMS details,real photos/stock dates/specifications,24-card pagination,bilingual model/range isolation,family guidance,manufacturer/image schema and pagination canonicals. Full technical data remains server-rendered instead of basket hydration. Existing access gates retained.

65 unit tests/TypeScript succeeded; additive migration applied development+hosted. Development permissions/draft/public-projection checks succeeded. Import resumed without duplicates (64 unchanged/87 created); hosted151 created and projected. Local production build succeeded; EN/AR390px grouped-model/detail checks and all151 image contact sheets inspected. Two independent review findings corrected.

Vercel sign-in renewed with Nour's authorization; correct EL AMAL project verified and CATALOGUE_SOURCE=cms added for production. Release 43faaf8 is pushed to GitHub. Production deployment dpl_FeT8KpWkJPLkP6VAjjbtKEuRhfEH reached Ready and serves the stable English/Arabic catalogue. GitHub Website quality run 36351279324 succeeded on the same commit, including the final cloud build.

Live verification: 151 public entries, 90/61 availability split and all 151 downloaded PNGs match local SHA-256 hashes. Source/reviewer fields remain hidden; anonymous SKU/enquiry/notification/verification-email endpoints return 403. EN/AR grouped-model search returns the correct entry. EN/AR detail pages checked at 320px without horizontal overflow; Arabic page 7 has its own canonical and seven final entries. Quote basket add/reload/remove checked with test item removed. M12 cable opens the official catalogue page. Evidence: artifacts/2026-09-27/catalogue-build/live-verification.json and screenshots. The observed runtime log entries are PostgreSQL SSL deprecation warnings, not observed HTTP 5xx failures; existing favicon 404 remains. This is scoped verification, not a zero-diagnostic or full-site acceptance claim.

Real catalogue publication is complete. Overall planned-scope estimate is now approximately 70% (68.25% weighted, rounded), with uncertainty; see docs/phase-status.md. Public enquiry/email sending and indexing remain disabled. Exact inventory/reservations, private attachments, scheduling/monitoring/recovery and full release acceptance remain separate engineering scope. Client visual/technical acceptance remains outstanding.


## Latest checkpoint — 27 September photographed catalogue intake

Received the two user-named Desktop folders: 17 in-stock JPEGs and 12 out-of-stock JPEGs, all 1200x1600. Copied the 29 originals without modification into ignored docs/source/catalogue-2026-09-27/ and recorded source names, dimensions, sizes and SHA-256 hashes. Originals remain untouched. No exact duplicate source images.

Nour explicitly clarified: **every model on the main page** inherits the folder stock label. Pen marks have no stock-selection meaning; products visible only on cropped neighbouring pages are excluded. This is dated model/family availability, not counted SKU balances or proof of every possible configuration being stocked. Do not ask again for the scope or a catalogue ZIP.

Manually indexed all 29 main pages: 151 product cards/model groups, 90 in-stock and 61 out-of-stock. Grouped families are retained as printed; this is not 151 exact orderable SKUs. Readability notes and unknown page numbers are retained. IR80 and M12 x 1 cable have no visible printed datasheet IDs. Full technical specification extraction remains pending.

Prepared ten bilingual draft product rows (DI10, DI30, DI32-1, DI35, DIH10, TC10-A, TR10-A, T15, PSM01 and IV1), traceable source references and separate availability metadata. Official WIKA product pages and downloadable PDF identities/references were checked for these ten. The rest of the index contains printed references only, not yet manufacturer-verified links. No family variants, certification claims, stock quantities or manufacturer images were invented.

Read-only verification succeeded: 29 copied-source hashes/sizes, complete unique page coverage, 151 unique printed card/group labels, 90/61 stock split, ten draft import rows validated against src/lib/import.ts, ten source/link sidecars and Arabic text presence. These structural checks are not Arabic/technical approval. See catalogue/2026-09-27/README.md, model-index.md and pilot-review.md. Raw photos remain private local files; Git contains the index/drafts only. Catalogue working files are excluded from Vercel uploads.

No database writes, product publication, stock changes, real messages or application behaviour changed. Public catalogue remains demo mode. No production build needed for this intake-only milestone. Overall full-site estimate remains approximately 65%; receiving/indexing catalogue content is not completed publication.

Next catalogue work: complete pilot specifications/Arabic review and idempotent draft CMS import, verify draft isolation and EN/AR rendering, then expand remaining records and prepare authorised imagery. Add explicit dated model availability before displaying folder labels; current CMS has no equivalent field. Exact SKUs/quantities, rights, stock policy and final content review remain separate client inputs collected at the end. Private attachments, inventory/reservations, scheduling/monitoring/recovery and release acceptance remain engineering work.

## Latest checkpoint — 27 September public intake, information pages and mobile performance

Nour approved the entrance and requested continuing all agent-owned work while deferring client inputs. Implemented guarded public submission/resend (signed resend-only receipt, exact-origin/body guards, PostgreSQL visitor and normalized-email quotas, retry-safe snapshots), bilingual customer UI, and About/Contact/Resources pages. No real products/contact claims invented. Sending/intake remain disabled until sender/worker/CMS activation. No hosted migration or real email sent.

58 unit tests, TypeScript, cloud build and independent review succeeded. Development database tests verified contention, idempotency, expired windows, duplicate/conflict handling, single queue records, resend/token rotation, confirmed exclusions, quota denial and retry after catalogue removal; disposable records removed. Reviewer found a cleanup race. Reproduced deletion of a renewed quota, then fixed cleanup with locked SKIP LOCKED candidates and outer expiry recheck plus atomic quota upsert/locking. Regression succeeded.

Separated desktop Motion into a conditional dynamic import and shortened mobile entrance. Browser confirmed desktop motion pause/resume and375px mobile static fallback without overflow; bilingual new pages, preview-only RFQ and footer/contact touch targets checked. Live route/metadata/private-API guards verified. Mobile PageSpeed lab improved92→100 performance, LCP3.2→1.2s, TBT100→20ms, CLS0→0.022; automated accessibility100/best-practices100; SEO66 because demo indexing is intentionally disabled. These are homepage lab samples, not field Core Web Vitals, full-site acceptance or perfect security. See docs/release-verification-2026-09-27.md for reports and limits.

Deployment dpl_FCyTJFiapTKx58GEnCwe7CttzW99 reached Ready and was promoted to the stable URL. Live About screenshot artifacts/2026-09-27/about-live.png. CLI curl debug unexpectedly emitted the preview bypass token; revoked and regenerated privately, confirmed old token absent and protection unchanged. No website admin/database credential exposure. Pinned GitHub quality workflow added (tests/types/high-critical audit/build without production secrets); first hosted run36291545326 completed successfully on implementation commit d6a691f (tests/types/high-critical audit/production build).

Overall scope estimate remains about65% (weighted64.5, rounded). Public intake is implemented but not activated. Remaining engineering includes private attachments, inventory/reservations, scheduling/monitoring/recovery and broader acceptance checks. Client inputs remain deferred in docs/final-client-inputs.md. Do not represent these as solely catalogue blockers or claim100% completion.


## Latest checkpoint — 27 September instrument entrance and delivery estimate

Nour requested exact delivery/remaining scope percentages and a professional animated loading entrance inspired by collabcapitolium.fr. Reviewed its live entrance and narrative presentation. Built a distinct EL AMAL navy split-panel reveal with white editorial wordmark, orange gauge sweep, bilingual caption/skip action and footer replay. Brief 1.8-second entrance on document load, not every client navigation; explicitly decorative, no fake percentage counter. CSS finishes independently of hydration, no-JS hides entrance/replay, reduced motion hides entrance and stops loading needle. Pointer/keyboard/focus/scroll can dismiss; no focus steal or page-scroll lock. Actual route-loading.tsx fallback uses accessible bilingual status and resolves with Next streaming; no forced data delay or new dependency.

TypeScript and cloud build succeeded. Staged browser observed desktop/390px Arabic entrance, automatic removal, Escape dismissal, no horizontal overflow, real Arabic catalogue loading status resolving to content, no full entrance replay on client navigation and no console errors in that checked flow. Screenshots artifacts/2026-09-27/intro-desktop.png and intro-mobile-ar.png. Reduced-motion/no-JS safeguards inspected in source, not emulated in browser. No performance score or visual acceptance claimed.

Replaced stale docs/phase-status.md with current six-workstream delivery/remaining list. Overall about65% is a rough weighted scope estimate (63.5 rounded, roughly5-point uncertainty), not a quality/security/SEO score or award prediction. Real catalogue population remains0%; major operational work remains. Client inputs still deferred.

Final deployment dpl_8Jm8mjxtVjLU7En9TKbX9KQaxZ6F reached Ready and was promoted. Live stable-domain footer replay verified and screenshot saved to artifacts/2026-09-27/intro-live.png.

## Latest checkpoint — 27 September verified-customer staff notifications

Fixed a prerequisite for safe public intake: the staff notification worker now atomically requires a CMS-source enquiry with verified status and a confirmation timestamp before claiming either a new message or an expired retry lease. Test/demo confirmation does not qualify. Waiting does not consume attempts. The existing 23-hour queue-age cutoff remains; late confirmation does not reset delivery history. Updated admin queue guidance and generated type documentation. No migration, sender activation or public intake activation.

Development regression first reproduced an unverified notification being sent through a fake transport. After the fix, checks verified unverified/test-verified/missing-timestamp suppression, expired-lease suppression without attempt consumption, genuine single-use confirmation enabling delivery, rollback, duplicate enqueue, concurrent claims, retry limits and stale leases. All disposable records cleaned. All 53 unit tests and TypeScript succeeded. No external email sent. Public intake/resend abuse controls and UI remain next; client inputs still deferred.

Deployment dpl_2vSP9WHgSpMuAQzhRZhLyqA5aGUL reached Ready and was promoted to the stable client URL. Live English/Arabic200, worker GET405/anonymous POST401, private notifications403 and anonymous enquiry submission403 verified.

## Latest checkpoint — 27 September navy design and quality hardening

Applied Nour's exact #010736 / #091540 backgrounds, white text and retained orange accents across public routes, admin and global 404. Preserved instrument materials and existing hover/press/reduced-motion behavior. Added visible field boundaries and admin calendar/tooltip focus corrections. Added generated branded social image, Twitter large-image fallback to Next-generated OG metadata, and product-page WebPage/BreadcrumbList schema; real Product entities only for CMS records, without invented offers or ratings.

Scoped Monaco DOMPurify override to 3.4.16. npm audit now reports zero high/critical/low and five moderate entries from the inherited Drizzle/esbuild development-tool chain (GHSA-67mh-4wv8-2f99). No unsafe major override applied. Added baseline CSP object/base/framing/form restrictions and HSTS; this is not a complete script CSP or security certification.

All 53 unit tests and TypeScript succeeded. Browser inspected English home/product, Arabic RFQ at 390px (375px content width, no horizontal overflow), admin login, global 404 and generated social image. Fixed Twitter URL discovered during deployed metadata inspection. Source review found calendar focus and standalone 404 link contrast issues, corrected. Authenticated full admin theme, runtime reduced motion and measured Lighthouse/Core Web Vitals still need broader review. No real emails sent, database migrations or actual products added.

Final deployment dpl_E3NuhKKwp4M9XZryZMc6oPkRKSmV reached Ready and was promoted to https://el-amal-sigma.vercel.app. Live EN/AR/product/admin login returned200, private SKU API403, CSP/HSTS present, generated social image200 image/png. Final browser metadata confirms Twitter and OG use the same generated image URL. Live homepage screenshot: artifacts/2026-09-27/navy-homepage.png.

Research, design targets and honest remaining work: docs/quality-roadmap-2026-09-27.md. Public intake/resend integration, secure attachments, inventory/reservation workflow, scheduling/monitoring and final operational/accessibility/performance/security verification remain agent-owned work. Client inputs remain deferred. This checkpoint is not full operational completion or an award/ranking claim.

## Latest checkpoint — 25 September hover and press motion

Nour requested more transitions, especially hover feedback. Extended the existing steel direction with lightweight CSS spring-shaped button lift/press, one-pass sheen, arrow movement, navigation underlines, product image lift, category/chip feedback and field focus treatment. No dependencies or JavaScript added. Hover movement requires a fine hover-capable pointer; touch retains press feedback. RTL motion direction and reduced-motion overrides included. Removed legacy product hover scaling that could abruptly shrink the larger featured illustration.

Browser checked staged English product button hover (computed lift/spring curve), add/remove sample basket round-trip with cleanup, visible keyboard focus, Arabic390px catalogue and no horizontal overflow. Visual review screenshots inspected; client visual acceptance remains pending. Reduced-motion rules inspected in source; no OS preference emulation was available through the browser tools, so runtime reduced-motion testing remains a limitation. No new unit tests for this CSS-only change. Final cloud build dpl_82bEHbhYQ4r7SBLKLEfKDbh2BxHU reached Ready and was promoted. Final staged catalogue loaded the intended button/illustration transitions with no overflow; live English product and Arabic catalogue returned200.

## Latest checkpoint — 25 September encrypted customer email outbox

Implemented optional transactional CMS enquiry + verification digest + encrypted email enqueue, stable snapshotted delivery messages, private owner/sales queue status, protected one-item POST worker, retries/leases/expiry/terminal envelope deletion and controlled trusted resend (one-minute cooldown, three generations per24 hours). New generations invalidate old links. Demo enquiries never enqueue customer email. No public resend/intake activation, sender configuration or scheduler; no real messages sent.

51 unit tests and TypeScript succeeded. Development integration verified rollback, duplicate enqueue, hidden message fields, identical retry messages/keys, concurrent worker/resend behavior, old-link invalidation, confirmation suppression, expiry, cooldown/window reset, leases, stale completion, terminal attempts and tampering. Disposable records removed. Existing verification and staff-notification database regression checks also succeeded with cleanup. Additive migration20260925_121725_verification_email_outbox applied to development and hosted databases; corrected down migration FK order, no down run.

Deployment dpl_ARf7KcsTZniW5HTfWdw3spFX9EtA reached Ready and was promoted to the stable client URL. Staged worker401 and queue403 verified. Live home/Arabic confirmation200, owner queue200, anonymous queue403, worker GET405/POST401, private token/rate collections403, anonymous test issuer403 and confirmation GET405 verified. Owner test session logged out. EN/AR verification/RFQ retain noindex. No actual messages or new hosted enquiry records were created. See docs/verification-email-outbox.md for architecture and activation limits. Existing callers without verification settings keep previous behavior; future public intake must supply settings and fail closed on readiness. Staff notifications are not yet gated on customer verification. Payload secret rotation requires a pending-envelope plan.

Next: anonymous intake/email-based abuse controls and safe resend UI/API, secure attachments, inventory/reservations, operational scheduling/monitoring and final audits. All client-supplied details remain deferred in docs/final-client-inputs.md. The full website is not yet operationally complete.

## Latest checkpoint — 25 September single-use verification flow deployed

Implemented private digest-only enquiry verification records, one-hour random tokens, replacement of unused links, atomic single-use confirmation and immutable verified timestamp/status. Demo records become test-verified, distinct from real verified records. Owner/sales can create test links only for unverified demo enquiries. The trusted customer-source issuer exists server-side but is not exposed through public submission and is not connected to email delivery yet.

Added /en/verify and /ar/verify: token in URL fragment, explicit confirm button (GET cannot consume it), language switching preserves the unused link, token removed from address bar before POST, clear test/customer/unavailable/limited/error states, noindex/no-referrer. Staff saved-test UI now offers the test link. No stock reservation or messages occur.

Verification endpoints enforce same Origin, bounded4KB JSON, private issuer auth and PostgreSQL-backed10/minute pseudonymous per-client/per-scope limits. Vercel-overwritten IP header is trusted only on Vercel; otherwise shared fallback. No raw IP stored; bounded opportunistic cleanup of stale buckets. This protects verification only; public intake spam protection is still separate work.

48 unit tests and TypeScript succeeded. Development integration verified token digest/rotation/expiry/replay, concurrent single-use, source separation, distinct confirmation statuses, private collections, exact concurrent limits/window reset and cleanup. Additive migration 20260925_114611_enquiry_verification applied dev/hosted. Rollback FK ordering fixed and rollback refuses existing confirmed states; no down migration run.

Deployment dpl_5DSP3H4yfQvcai8rfgx4i9os2imU Ready and promoted. CLI had a local telemetry spawn error after creating the deployment; inspected the existing deployment successfully rather than duplicating it. Browser owner login -> direct test RFQ save -> create link -> open without consumption (checked DB) -> switch Arabic -> confirm succeeded. Exact disposable hosted enquiry/token/notification rows were checked and removed. Live EN/AR verify/RFQ200+noindex; token/rate collections403; anonymous issuer403; GET confirmation405. No mail sent. See docs/enquiry-verification.md.

Next: durable customer verification-email delivery/resend connection, anonymous intake abuse controls, secure attachments, inventory/reservations, scheduling/monitoring and final audits. Client details remain deferred per docs/final-client-inputs.md. Core token confirmation is implemented; customer email verification delivery is not operational.


## Latest checkpoint — 25 September delivery safeguards and SEO deployed

Nour requested continuing implementation while deferring all client-supplied details to one end-of-project checklist (docs/final-client-inputs.md). Do not repeatedly ask for numbers, WIKA proof, catalogue or sender setup.

Implemented a Resend HTTPS notification adapter with15-second timeout, stable idempotency key, generic errors, receipt validation and explicit configuration/off switch. Protected POST /api/internal/notifications processes at most one eligible notification per authorised call; separate32+ character bearer secret, constant-time byte comparison, no GET send action, no-store responses. Delivery remains disabled: no sender/API key configured and no scheduler or messages. Existing worker now stops before the provider24-hour deduplication boundary (conservative23 hours from queue creation) and correctly reports fifth-attempt terminal failure. Read-only npm run readiness reports configuration booleans without values or network activity.

Bilingual canonical/hreflang/Open Graph/Twitter metadata added across routes. Shared WebSite/Organization JSON-LD asserts only existing identity. Central launch policy requires explicit indexing flag, cms catalogue and production environment; defaults stay noindex. Sitemap generates public bilingual routes/records only after activation, remains empty for demo. Admin/API remain noindex; basket excluded. See docs/seo-readiness.md and updated docs/notification-queue.md.

42 unit tests and TypeScript succeeded. Development database fake-send integration verified concurrency, rollback, expired retry window, terminal failure and cleanup. No schema migration required. Deployment dpl_GKRsCdzPWnYdGAERVShc4kdYnC5k Ready/promoted. Staged browser checked Arabic RFQ canonical/languages/schema/noindex. Live home/RFQ/product/industry200 with metadata and noindex; demo sitemap empty; worker POST401 and GET405. No customer emails, public intake or stock operations enabled.

Remaining development: customer email verification and public abuse controls, secure attachment workflow, inventory/reservation service, operational delivery scheduling/monitoring, final accessibility/performance and launch checks. These are not all blocked by client input and are not complete. Client information remains deferred as requested. Existing visual layout retained.


## Latest checkpoint — 24 September client requirements deployed

Previous phase order paused at Nour's request. Added bilingual type/application catalogue filters; CMS fields for reviewed instrument type, applications and HTTPS datasheet links; honest missing-datasheet state; direct /en/rfq and /ar/rfq with model/quantity/range independent of catalogue; immutable staff-test persistence and retry handling; oil-and-gas and general-industry pages with application links. Existing steel visual direction retained. Contact bar/WhatsApp draft and WIKA evidence section are prepared but gated on actual client information. No invented numbers, relationship claims or datasheets.

34 unit tests and TypeScript succeeded. Development integration verified direct RFQ persistence/retries/conflicts, access restrictions and publication of catalogue metadata; disposable records removed. Additive migration 20260924_182238_client_requirements applied to both databases. Final cloud deployment dpl_AGeYNGhwap1cFxhJmCCwNZS8HuE1 Ready and promoted to https://el-amal-sigma.vercel.app. Browser verified EN/AR direct RFQ review, Arabic type+application intersection, industry navigation and mobile layout. A low-contrast industry label was corrected. Live RFQ/industry/product/admin routes200 and anonymous submission403. No emails or stock writes. Visual acceptance and broad performance/accessibility audit remain pending.

Needed from Nour: business phone/WhatsApp numbers; exact approved WIKA relationship plus evidence and bilingual wording. Catalogue and actual model datasheets later. Public RFQ submission is still disabled pending the operational sending/verification flow; signed-in owner/sales can save tests. See docs/client-requirements-2026-09-24.md. No secrets in tracked files.


## Latest checkpoint — 24 September notification queue live, sending disabled

Added private owner/sales Notification queue and transactional enquiry+notification creation. Duplicate requests share one notification. Demo requests create disabled records; worker claims only cms-source records. Injectable worker has no configured transport and no scheduled/API entry point. It supports atomic SKIP LOCKED claims, five-minute leases, stable provider idempotency keys, exponential delay, five-attempt limit, stale-result protection and generic error storage. No customer details are copied into message content beyond the random reference. Confirmed recipient is configurable via ENQUIRY_NOTIFICATION_TO.

31 unit tests and TypeScript succeeded. Development database tests verified enqueue rollback, duplicate/concurrent enquiries, demo suppression, delayed retry, worker contention, stale results and retry exhaustion with fake sender only; temporary rows removed. Hosted migration applied. Cloud deployment dpl_5tsnqsZbcgxHWZDJRNz9ArCX8Ync Ready/promoted. Staged owner queue/API/admin HTML200; live pages/login200 and anonymous queue/enquiry/private setup403. No emails sent. Existing public form remains staff-only demo testing.

Next: customer email verification/token flow, actual sender adapter/configuration, provider idempotency and timeout handling, scheduled delivery and operational monitoring. These are NOT complete. Secure attachments and stock workflow remain after that. Catalogue remains deferred. Queue is preparation, not enabled email delivery. See docs/notification-queue.md.

## Latest checkpoint — 24 September staff test form connected

Live deployment dpl_3edTG9kJaoJKL3wChEWqv1Z4FUZH adds an authenticated sample-enquiry flow. /api/enquiry-submissions GET exposes only no-store canSaveTest; POST checks configured CMS, demo source, owner/sales staff auth, exact request origin, JSON and streamed32KB limit. Public access remains denied. English/Arabic review shows Save test enquiry only to authorised staff, preserves request keys across retries/edit-review, prevents double clicks and returns a reference plus inbox link. No outgoing emails, verification or stock writes.

28 unit tests and TypeScript succeeded; cloud build Ready. Staged anonymous capability false/POST403 verified. Live mobile browser owner login → sample DEMO-P1 basket → form → save confirmation → admin record succeeded. Saved bilingual names/model/quantity and immutable fields checked; internal note saved through UI and confirmed in DB. Exact synthetic record and test basket line removed. Arabic review/staff action verified without another submission. No real visitor intake enabled; sender/outbox/verification/uploads remain next work. Existing visual design reused; broad accessibility/performance acceptance not claimed.

## Latest checkpoint — 24 September enquiry persistence and staff inbox live

Catalogue-independent Phase3 foundation implemented: private Payload Enquiries collection, server submission service with bounded input validation, immutable server-resolved model/name/quantity snapshots, canonical fingerprint and database-unique request-key handling (including concurrent duplicate attempts), owner/sales status and internal notes. Catalogue-editor/warehouse/anonymous reads and writes denied; direct create/delete denied even for owner/sales. No public submission endpoint/form integration yet. No email, verification, attachment or stock operations.

Additive enquiry migration applied to development and hosted databases. Generated rollback orders the external FK removal before dropping its referenced table.25 unit tests and TypeScript succeeded. Development integration checks covered persistence, same-key repeat/conflict/race, retries after catalogue removal, role access, immutable fields and cleanup; temporary records removed. Cloud build Ready; deployment dpl_EjfJX3sGZChNMJnpp3itJYmqef2W promoted to stable URL. Authenticated staged API and admin HTML verified empty owner inbox; live pages/login200, public enquiry GET/POST403 and existing private/setup403. Visual admin browser walkthrough remains pending.

Next: connect a protected test submission flow/public intake with abuse controls; notification outbox, sender configuration and verification; attachments/scanning; then inventory service with isolated sample SKUs. Actual catalogue remains deferred. No new input required for backend test work. Recipient mohamed.sorour8@icloud.com confirmed; delivery still needs sender setup.

## Latest checkpoint — 24 September 2026 security upgrade live

Payload, @payloadcms/next and @payloadcms/db-postgres upgraded to3.90.2. Additive reset-password-request timestamp migration applied to development and hosted PostgreSQL. Cloud build succeeded; dpl_9N5fhCvqL3gii2RUsTkJPPKJzwVz promoted to stable client domain. Live EN/AR/catalogue/quote/admin pages200, owner authentication verified, private SKU and disabled registration/recovery endpoints403. Development role/publication checks and cleanup exit0;22 unit tests and final TypeScript succeeded. Audit at verification reported zero known vulnerabilities. Full HTTP role matrix and broader acceptance remain pending.

Hosted owner password changed as requested and verified; ignored credential file updated. Earlier private ZIP credentials are stale. Notification recipient confirmed as mohamed.sorour8@icloud.com. Sender service/domain remains unconfigured. No mail sent; actual products deferred. Next: durable RFQ backend and staff workflow. See docs/resume-2026-09-24.md for detailed evidence and resolved blockers. No UI changes in this increment.

## 17 September 2026 — first working preview

Direction 1, Precision in steel, selected by Nour. Implemented bilingual homepage, catalogue search, categories, product detail and persistent local quote basket on codex/el-amal-foundation. Ten fixtures are clearly labelled synthetic. The proposal was read completely; its commercial and operational defaults remain proposals, not recorded client acceptance.

Validation: ten unit tests succeeded, frontend TypeScript succeeded and production build succeeded. Browser search-to-product-to-basket journey worked across English and Arabic with quantity persistence after refresh. Mobile menu and search reset worked. HTTP checks returned expected 200/404 responses and noindex headers.

Local production preview: http://127.0.0.1:3004/en (npm start, port 3004). Screenshot: artifacts/2026-09-17/home-desktop.png. See docs/verification-2026-09-17.md for evidence and limitations.

Payload installation encountered ECONNRESET retrieving @payloadcms/drizzle. Its pinned packages are isolated in cms/package.json; src/cms and src/payload.config.ts are prepared source only, excluded from frontend type checking. /admin is a setup explanation, not a working admin. No database migrations or stock writes occurred.

Pending: real logo/photos, ten approved bilingual product records followed by complete catalogue/SKUs, stock data, PostgreSQL and mail configuration, CMS integration, transactional stock and RFQ workflows, private upload scanning, scheduled jobs, remaining content and production SEO, accessibility/performance audit, deployment and full acceptance tests. No Lighthouse scores claimed. The unavailable Impeccable suite was not executed; manual checks are documented separately. Nour retains visual approval.

## Client review deployment — 17 September 2026

Live review URL: https://el-amal-sigma.vercel.app/en (Arabic: /ar).
Vercel project: nour-abulnasrs-projects/el-amal. First deployment READY: dpl_4RoihoYFtFX2KYbbLZCSu9TCv4UD, application commit 2987a4a; build completed in 41 seconds.
GitHub repository connected; production branch is codex/el-amal-foundation. Every push to this branch triggers a build and updates the stable domain when successful. Vercel calls this the production target; the application remains a clearly labelled sample-content client review preview, not the operational launch.
Unauthenticated HTTPS checks of /en, /ar, /en/products?q=demo+p1 and /en/quote returned 200 and the preview notice, with noindex/nofollow headers. No protection settings were disabled. No domain purchase, database or paid service was provisioned. Future development should keep this link current through verified commits and pushes. Failed builds retain the last successful deployment.

## CMS schema validation checkpoint — 17 September 2026

CMS dependencies successfully installed in the isolated cms package; lockfile saved. Added cms/tsconfig.json and verified prepared schemas against actual Payload types. Fixed the bilingual field union and owner-only create/update restrictions on review metadata; regression first reproduced editor-forged metadata on creation, then fixed. Four new permission callback tests bring the suite to14. All14 tests, CMS typecheck and frontend typecheck succeeded.

CMS is still not integrated into the live app. No PostgreSQL connection, migrations, trusted owner bootstrap, operational admin, HTTP permission verification or live RFQ exists yet. No local psql/docker executable found in PATH. User was asked whether a database already exists; no specific database answer received. Next: arrange isolated PostgreSQL and secure secret configuration, integrate pinned Payload packages into root, generate migrations/types and test admin plus direct API permissions. Never silently provision paid services or paste credentials into chat.

Resume from phone using the same task via Remote; see docs/continue-project.md. Live client URL remains https://el-amal-sigma.vercel.app/en.

## 18 September 2026 — database setup awaiting account owner

Resumed from checkpoint; clean working tree. Vercel integration list and env ls confirmed no connected resources or variables. Marketplace lists Neon free_v3 (Free). Attempted el-amal-development in iad1, built-in Neon auth disabled (Payload owns staff auth), development environment only, no env pull. CLI returned action_required: integration_terms_acceptance_required. No database was created. Nour must review/accept https://vercel.com/nour-abulnasrs-projects/~/integrations/accept-terms/neon?source=cli then retry the same command. Do not accept legal terms for Nour.

Resume command after acceptance: vercel integration add neon --name el-amal-development --plan free_v3 --metadata region=iad1 --metadata auth=false --environment development --no-env-pull --scope nour-abulnasrs-projects

Then verify resources once before retrying, pull development credentials into ignored .env.local without printing values, integrate CMS, generate/review migrations and test against this isolated database. Live client preview remains unaffected. No paid plan authorized or provisioned.

## 18 September 2026 — PostgreSQL and admin integration

Nour accepted Neon terms. Provisioned free_v3 el-amal-development in iad1 with Neon auth disabled and development-only Vercel connection. Verified database connectivity. Credentials are in ignored .env.local and generated local-only Payload secret in ignored .env.development.local; no secret values printed or committed.

Root application now owns pinned Payload packages. Generated src/payload-types.ts and initial catalogue migration; reviewed and applied migration to the new empty development database with push:false. Real Payload/PostgreSQL checks verified draft persistence, public draft exclusion, anonymous staff-create denial and private-SKU denial; temporary records removed. All16 unit tests succeeded. Root TypeScript includes CMS and migrations now.

Admin and REST routes integrated with explicit CMS_ENABLED gate. Public first-register blocked in both route and collection endpoint. Password-reset routes blocked pending a configured mail adapter. Public client review still has no CMS flag/credentials; do not enable it with the development database. Permanent owner email requested and still pending. No permanent admin account created, no authenticated browser walkthrough yet, no real catalogue/import, live RFQ or stock service.

Local memory exhaustion interrupted several commands; sequential checks with reduced Node heap succeeded. See current build/test output before claiming the latest deployment verified. Next: receive owner email, bootstrap securely, verify authenticated admin/API roles, connect reviewed catalogue, and implement RFQ/stock services. Do not expose unrestricted first-user registration.

Verification completed: production build exit0 (webpack compiled with warnings, no error details emitted); TypeScript succeeded within build. Enabled-development HTTP /en and /admin/login returned200; /api/staff/first-register POST, /api/staff/forgot-password POST and /api/skus GET returned403; /api/products GET returned200 with zero records. Temporary local test server stopped after checks. Authenticated browser testing remains pending permanent owner setup.

Cloud build1bfe7bd found .vercelignore cms pattern also excluded src/cms. Narrowed to /cms/ so only the obsolete root preparation package is excluded. Previous client deployment stayed live; verifying replacement build.

Deployment verification: corrected commit06441b5 is Ready on Vercel (dpl_EB2pTLtJvo6igopgmaw5kYnxtqYo), aliased to https://el-amal-sigma.vercel.app. Unauthenticated live checks: /en200, /ar200, /admin200 setup page, /api/staff503 confirming CMS disabled. Permanent owner email still required for next authenticated admin milestone.

## 18 September 2026 — development owner bootstrap

Created the user-supplied owner account in the development database through scripts/bootstrap-owner.ts. Generated password is in ignored .env.owner.local; it was not printed, committed or emailed. Bootstrap refuses an existing staff database and uses exclusive credential-file creation to avoid overwriting credentials. Account email is kept with the local credentials rather than in this repository.

Verified Payload login and HTTP owner role, authenticated /api/staff/me, /api/skus and /api/categories200, cookie-authenticated /admin200, and logout200. Local admin preview runs at http://127.0.0.1:3005/admin with CMS enabled only for this local process. Public Vercel admin stays disabled. Browser visual walkthrough and non-owner HTTP role matrix remain pending. No live email service or automatic password reset. Owner should replace the generated temporary password through the authenticated account page before real use.

## 19 September 2026 — hosted admin activation

Nour explicitly requested the admin at https://el-amal-sigma.vercel.app/admin. Created separate free Neon el-amal-hosted in iad1, production environment only, built-in Neon auth=false. Applied the reviewed initial migration. Configured Vercel production PAYLOAD_SECRET, CMS_ENABLED=true and SITE_URL; no secrets printed. Created the requested owner via trusted bootstrap and verified Payload login. Hosted credentials are in ignored .env.hosted-owner.local, distinct from development credentials. Bootstrap supports explicit hosted target; refuses any existing staff database.

Redeployment and public HTTPS access verification are the next checks. Development remains separate. Public catalogue still reads labelled fixtures, not CMS records. No mail adapter/password recovery, attachments, RFQ persistence or transactional stock yet.

## 19 September 2026 — hosted login verified and phase checklist updated
Deployment 01d4a83 reached Ready on the stable domain. Hosted owner login, authenticated admin/private API checks succeeded; anonymous private SKU and first-register access remained blocked. Following a reported incorrect-password message, retested ignored .env.hosted-owner.local credentials: login200 with owner role, authenticated /admin200, then logout. Development .env.owner.local has a different password. No password values printed or reset; owner browser retry remains unconfirmed.
Expanded docs/phase-status.md with built versus remaining scope for all six phases. Current work: phase2 plus phase1 operational follow-ups. Public catalogue still uses fixtures; RFQ and stock backends remain pending. Local commands work again after earlier Windows memory exhaustion. Next: CMS-to-public adapter and reviewed ten-product pilot.

Hosted login browser follow-up: actual form entry using .env.hosted-owner.local reached /admin with Dashboard visible in the user's existing browser tab. No password reset/code change. Origin-bearing API login also succeeded. Earlier reported failure could not be reproduced; cause remains unconfirmed. Left dashboard signed in for user. Added explicit UI/UX scope across all six phases to docs/phase-status.md.

## 19 September 2026 — public catalogue integration
Implemented a shared server-side catalogue loader and explicit public DTO, wired homepage/category/product/search and quote basket to it. CATALOGUE_SOURCE defaults to demo for continuous client review; cms is an explicit deployment choice once reviewed records exist. No actual catalogue products were entered. CMS reads are request-scoped, exclude drafts/unreviewed records and expose no private source/reviewer/SKU data. Empty or failed CMS never falls back to fixtures. Demo and CMS baskets are separate.
Validation so far: 20 unit tests, TypeScript and development PostgreSQL publish/draft-edit isolation/unpublish checks succeeded; exact temporary test IDs cleaned. Production build/browser/deployment verification in progress.
Cloud verification: application commit01bbf9e built successfully on Vercel, deployment dpl_6zzHMn3a9hD7LnW2WmL9K7hEVp1i Ready and aliased to https://el-amal-sigma.vercel.app. Browser verified demo model search, product detail, basket addition, refresh persistence, Arabic language switch and removal of the sole temporary basket item. CMS-source browser rendering still requires verification before activation; database publish/draft/unpublish tests succeeded. No real products added and no source-mode switch on production.

## 20 September 2026 — UI/UX and motion review
Implemented the selected Precision in steel refinement: larger editorial hero, layered CSS instrument with lazy Motion spring tilt and scroll-linked compression on fine-pointer desktop only, explicit pause and reduced-motion static treatment. Glass navigation uses CSS backdrop blur with opaque fallback. No WebGL, video, liquid logo or scroll interception: no approved final logo/video/3D asset, and catalogue usability takes priority.
Catalogue now has category navigation/counts, removable filter chips, improved empty-state guidance and larger product presentation. Product detail clarifies configuration confirmation and no reservation. Basket now leads to a bilingual enquiry-form preview with validation, focused errors and an editable review state. Contact details remain React state only; nothing is submitted or saved. Attachments are an honest unavailable placeholder pending secure RFQ backend.
TypeScript and all22 tests succeeded; parallel runner hit Windows process/resource errors, sequential execution succeeded. Browser checks and Vercel build pending. Nour retains visual approval. Actual products remain deferred.
Browser review20 September: desktop and390px hero inspected;320px heading clipping found and corrected with responsive type. Filter removal preserved query/results but select retained stale defaultValue; form now remounts on query/category changes. EN enquiry required errors, valid review, edit preservation and focus tested. Arabic errors and RTL width checked;390px viewport content375px with no page overflow. Mobile menu Escape collapses and restores focus. No real enquiry submitted; only dummy contact data used in memory.
Dependency audit during Motion installation: Motion has no advisory; existing Payload3.78 stack reports high/critical advisories. Separate compatible Payload upgrade/security verification required before operational launch. Do not claim security or performance acceptance complete.
Final UI deployment052ce3c is Ready: dpl_DuNeVHzWBzfvhzzvBrJ7rsbiRPvP, stable alias https://el-amal-sigma.vercel.app. Rechecked corrected320px heading visually and filter chip removal (category control resets to All instruments while query remains). Desktop pause/resume control verified; paused transforms reset. No console errors in checked flow. No-results guidance verified. Screenshots saved locally under artifacts/2026-09-20/homepage-desktop.png and homepage-mobile-320.png. Temporary test basket item removed; viewport override reset. No Lighthouse/Core Web Vitals score claimed. Visual acceptance pending Nour. Next priority before operational rollout: compatible Payload security upgrade and full permissions/security regression, then secure enquiry backend. Actual products remain deferred.

24 September2026: account-change handover prepared in START-HERE.md. Source proposal copied into ignored docs/source so local backup retains the original. Private backup covers local project and Git history/configuration, not live Neon database or full conversation/account sessions. No application behaviour changed.
