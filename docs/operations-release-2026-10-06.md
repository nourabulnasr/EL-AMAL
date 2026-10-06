# EL AMAL — security and launch checkpoint, 6 October 2026

## Release state

Application commit: `469ab5d` is **live** at https://el-amal-sigma.vercel.app. Vercel production deployment: `el-amal-f8nhpc4fl-nour-abulnasrs-projects.vercel.app`. Full cloud verification [37393004564](https://github.com/nourabulnasr/EL-AMAL/actions/runs/37393004564) and production-branch run [37393307744](https://github.com/nourabulnasr/EL-AMAL/actions/runs/37393307744) succeeded, including isolated database regressions, all-severity advisory audit, CMS production build and built-server runtime checks. This release contains no hosted schema migration or changes to real staff credentials, stock or customer records.

## What changed and why

### Staff ownership

Staff role changes must preserve at least one owner. The earlier application could demote its only owner, making normal administration unavailable. The new guard rejects that change and serializes competing role changes through a transaction-scoped PostgreSQL advisory lock.

Independent review identified two additional paths. Payload's login, logout and password-reset internals can save a complete, older account snapshot directly through the database adapter, bypassing collection hooks. Also, individual edits sharing one transaction can reenter an advisory lock. The final implementation handles both at the staff-write boundary:

1. Record explicit role-edit intent before the CMS fills omitted fields from an old document. This is a server-local WeakMap marker; browser JSON cannot create it.
2. Remove `role` from every ordinary staff `updateOne` payload, including authentication/session writes. An ordinary account edit cannot accidentally restore an old role.
3. For an explicit, access-checked role edit, require the active transaction and obtain the non-blocking role lock.
4. Apply the role change with one conditional SQL update that refuses removal of the final owner. Counting and changing occur in the same statement, including when individual operations share a transaction.
5. Let the remaining CMS update complete in the same transaction. A failure rolls the role change back too.

Bulk staff updates are rejected; manage staff individually. This is an application safeguard, not a restriction on privileged direct SQL or database-adapter deletion. Database credentials must remain restricted. No MFA, independent penetration test or absolute security guarantee is implied.

### Administrator instructions

Open `/admin/collections/staff` while signed in as an owner. To transfer ownership, first open the successor's account, select **owner**, and save. Confirm that the successor can sign in and reach the owner tools before changing the former owner's role. Keep a strong unique password for each account.

If the system says to keep at least one owner, appoint another owner first. If another role change is in progress, reload the account and retry. Do not use bulk editing for staff. Password reset and login preserve the current stored role; resetting a password does not grant ownership.

### Dependency security

The fresh online audit identified the newly reviewed [braces recursion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) through the CMS's pinned Sass/Chokidar build-tool chain. The four reported package entries represented one underlying advisory, not four separate vulnerabilities.

A scoped override upgrades only `@payloadcms/next`'s Sass dependency to `1.79.6`, retaining the existing compiler API and moving to Chokidar 4 without braces. Payload and Next.js stay at their existing versions. Installation reported zero known advisories; the clean CI install, all-severity audit and actual CMS production build remain release gates. No claim of an exploited public endpoint is made.

### Technical SEO

The read-only live crawler checked **342 public pages, 342 sitemap entries and 155 image assets**, finding **zero issues covered by its checks**. This includes all 151 real model pages in each language. It checks metadata, canonical and language links, structured data, public asset responses and private/faceted-page indexing guards.

This verifies technical eligibility, not Google index membership or ranking. Search Console ownership, URL Inspection and sitemap submission remain unverified. The Vercel subdomain does not itself prohibit indexing. A final custom domain is a brand decision; when chosen, canonical URLs, sitemap and redirects must be updated together. [Google explains that crawl requests do not guarantee inclusion](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## Verification evidence

- Initial isolated database checks reproduced the last-owner/bulk/concurrent failure paths.
- The independent review's login/reset/shared-transaction failures were each reproduced against real CMS operations with synthetic accounts.
- Final isolated admin regression: **22 checks, zero failures**. Includes valid transfer, competing edits, rollback, missing transaction, bulk denial, authentication overlap and existing unlock/notification boundaries. Fixture schemas were removed; no real email was sent.
- Existing unit tests: **142 successful**. TypeScript completed without errors.
- Local evidence: `artifacts/2026-10-06/launch/` (ignored/private); source regression: `scripts/check-admin-boundaries.ts`.
- Full cloud runs37393004564 and37393307744 succeeded on469ab5d. The separate candidate preview is el-amal-bs41w74o9-nour-abulnasrs-projects.vercel.app.
- Stable production alias: six representative English/Arabic public pages returned200 with correct canonical URLs; staff login returned200/noindex; anonymous SKU and private attachment collections returned403; customer-intake readiness remainedfalse. All10 checked responses retained CSP, HSTS and nosniff. Evidence: artifacts/2026-10-06/launch/production-verification.json.
- Browser verification after deployment: the live login form has visible, styled fields and button; a full-page screenshot confirmed the layout, with no observed browser errors. No sign-in, password/role edit or external email was performed. An initial viewport-only screenshot did not paint the form; DOM/contrast/occlusion checks and the full-page screenshot resolved the capture discrepancy without changing the page.

## Prepared separately; not activated

The private existing-quotation feature is on `codex/hero-review-and-quotation`. Its earlier application commit `41ff104` passed full cloud run `36888464946`. It supports PDF, XLSX, JPEG and PNG after genuine email verification, with three files of 2 MiB, encrypted private storage, explicit final submission and one staff notification. Documents remain unscanned and require an authenticated acknowledgment before forced download; this is not antivirus scanning or large-file storage.

The quotation schema migration has not been applied to production. Automatic approval review rejected the proposed full encrypted database export to the laptop because explicit authorization of that private-data destination was missing. No replacement export or migration was attempted. Normal intake also remains disabled until the verified sender and a frequent healthy mail worker are genuinely ready.

The production security fixes were merged into this prepared branch as `975fc3b`. All152 combined unit tests, TypeScript and full cloud run [37393952454](https://github.com/nourabulnasr/EL-AMAL/actions/runs/37393952454) succeeded, including the quotation lifecycle, staff safeguards, build and runtime checks. Updated [quotation review preview](https://el-amal-lvu0rnxc8-nour-abulnasrs-projects.vercel.app/en/rfq#existing-quotation) uses sample content and inactive intake. It is not the production catalogue or an operational submission endpoint. The production reference remains469ab5d.

## What remains

**Nour/client decisions and access:** hero choice; verified sender/domain/provider and frequent-worker authorization; explicit encrypted-backup destination approval; Search Console ownership; final business contacts/company facts/WIKA evidence; exact SKU configurations/counts and stock policy; strong owner credentials/final staff roles; privacy, content and launch acceptance. The receiving inbox and all 29 catalogue pages are already supplied—do not request them again. Checkly remains deferred.

**Engineering after those gates:** migrate and enable the quotation release; verify real customer confirmation, staff receipt, attachments and recovery end to end; configure final-domain canonical redirects/Search Console; schedule an authorized offsite backup with independent key custody; implement the chosen hero and measure it; finish broader device/assistive-technology checks. Larger uploads and malware scanning remain a separate hardening/integration item. Recent lab samples still exceeded the 2.5-second LCP target; no field Core Web Vitals compliance or top-ten ranking is claimed.
