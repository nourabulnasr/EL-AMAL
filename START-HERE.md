# EL AMAL — start here after changing accounts

Handover prepared 24 September 2026. Latest implemented application commit: `052ce3c`; verification checkpoint: `eb5df17`. Check Git for newer commits before work. This document is a portable project summary, not a full chat transcript.

Update: the Payload3.90.2 security upgrade is now live, with its additive migration applied to both databases. See the latest PROGRESS.md entry and docs/resume-2026-09-24.md; older security blockers below are superseded. Next priority is durable RFQ/backend work. Notification recipient confirmed; sender service not yet configured. Existing private backup ZIP predates the owner password change.

Later update: durable enquiry service and protected owner/sales inbox now live. See newest PROGRESS.md entry and docs/enquiry-implementation.md. Public form is still preview-only; submission endpoint, abuse controls, mail/verification/uploads and stock remain pending.25 unit tests and development enquiry integration checks succeeded. No real catalogue needed for the next backend increments.

Latest: owner/sales users can now save sample requests from the bilingual quote form after signing in. Staff-only demo submission endpoint and browser-to-admin journey verified;28 tests succeeded. Anonymous visitors still cannot submit. Next: notification outbox and email verification/sender setup, then uploads and inventory tests. Catalogue deferred.

Notification update: queue and injectable retry worker now implemented/deployed;31 unit tests plus database queue tests succeeded. Enquiries and queue records save atomically. Samples are disabled, no sender configured and no worker scheduled. Next is customer verification and sender integration/operational delivery. See docs/notification-queue.md and newest PROGRESS entry.

## Resume prompt

Paste this into a new Codex task with this folder attached:

> Continue the existing EL AMAL website in this folder. Read AGENTS.md, START-HERE.md, PROGRESS.md, docs/phase-status.md and docs/kickoff-2026-09-17.md first. Inspect git status before editing. Do not rebuild from scratch. Keep the existing Vercel client review link current. Actual catalogue products are deferred until I supply numbered page photographs in a ZIP. Preserve the Precision in steel direction; visual acceptance remains mine. The next technical priority is the recorded Payload security upgrade and permission regression checks, followed by secure enquiry/backend work. Tell me briefly what you found, then continue the next concrete step. Never print or commit secrets.

## Where everything lives

- Local project: `C:\Users\noura\OneDrive\Documents\ChatGPT\EL-AMAL 4`.
- GitHub: https://github.com/nourabulnasr/EL-AMAL
- Working/deployment branch: `codex/el-amal-foundation` (not main).
- Client review: https://el-amal-sigma.vercel.app/en and /ar.
- Hosted admin: https://el-amal-sigma.vercel.app/admin
- Vercel project: `nour-abulnasrs-projects/el-amal`. Successful pushes to the working branch update the stable review domain.
- `src/`: website, CMS configuration/collections, migrations and generated types.
- `scripts/`: trusted owner bootstrap and development database checks.
- `tests/`: catalogue, access, basket, source projection and enquiry-preview validation.
- `PROGRESS.md`: chronological work and verification evidence. Later entries supersede earlier setup blockers.
- `docs/phase-status.md`: six-phase scope; read appended checkpoints, not just the initial summary.
- `docs/kickoff-2026-09-17.md`: extracted scope, decisions and business constraints.
- `docs/source/`: private original proposal and extracted text, ignored by Git.
- `artifacts/2026-09-20/`: local UI screenshots, ignored by Git.
- Root `package-lock.json` is authoritative. Root `cms/` is historical preparation, not the active install location.

## Current state and remaining phases

| Phase | Built | Remaining |
| --- | --- | --- |
| 1 Foundation | Next.js, Payload, separate development/hosted PostgreSQL, migrations, role rules, owner account, working hosted admin, continuous review deployment | Compatible security upgrade, full non-owner HTTP permission matrix, operational email/password recovery, backup/restore rehearsal |
| 2 Catalogue and main UI/UX | English/Arabic home/category/product/search/filter pages, RTL, local basket, reviewed-CMS adapter with explicit demo mode, import validation, refined mobile UI and restrained hero motion | CMS-mode browser verification before activation, actual ten-product pilot/full catalogue/SKUs, real branding/images, full accessibility/performance and Nour's visual approval |
| 3 Enquiries | Local basket and bilingual form preview with validation, editable review and explicit nothing-sent notice | Persistent RFQs, immutable snapshots, verification tokens, private/scanned uploads, email outbox/retries, staff workflow |
| 4 Stock | Private SKU schema and import quantity validation | Inventory ledger/balances, verified allocation, expiry/release/dispatch, scheduled jobs, concurrency/idempotency tests, agreed freshness/hold policy |
| 5 Complete website | Public catalogue interface and homepage industry/approach sections | Full industry pages, About/Contact/Resources/policies, final content, real metadata/schema/hreflang/sitemap/social, analytics/reporting |
| 6 Release acceptance | Stable client review hosting and repeated browser checks | Full T01–T14 acceptance, security, performance/accessibility, final data/mail, restore/rollback, training/handover and launch approval |

The site is a labelled, noindex client review preview. No actual enquiries are submitted, no emails are sent by the preview form, and no stock is reserved. Preview contact details exist only in React memory. Product data remains synthetic; the published-CMS connection is implemented but not activated on the public review site.

## Agreed direction and user decisions

- Design direction selected: Precision in steel. Graphite hero, pale technical surfaces, one orange accent, Newsreader/Manrope/Noto Sans Arabic. Final logo and real photos not supplied.
- Hero is a CSS instrument illustration with Motion springs, desktop pointer tilt, scroll-linked scale and pause. Touch/reduced-motion use static treatment. Glass navigation uses CSS backdrop blur. No R3F/WebGL, Vanta, Lenis, video, liquid logo or original 3D assets were added.
- UI/UX is ongoing across phases, not reserved for the final phase. Nour retains visual approval; never equate browser checks with design acceptance.
- Catalogue is a hardcopy of about50 pages, estimated3–6 products per page. Nour will photograph pages, number images, ZIP them and provide a local path. Leave actual product extraction/import aside until provided.
- Begin real intake with ten representative products, verify/translate/review, then process remaining records. Do not invent specifications, stock, manufacturer claims or rights.
- Scope planning allowance:250 models/up to500 supplied SKUs; totals unverified. Target7 October2026 was conditional, not a completion guarantee.
- No public checkout, payments, ERP or AI engineering advice in this scope.
- Proposed verification/hold/staleness timings still require business approval. On-hand stock is to decrease at dispatch, not enquiry creation.
- User wants autonomous progress and frequent short updates; avoid repeatedly asking for permission for already authorised work.

## Credentials and hosted services — keep private

No secret values are included here. The following files exist locally and are ignored by Git:

| File | Purpose |
| --- | --- |
| `.env.local` | Development database configuration |
| `.env.development.local` | Development Payload secret |
| `.env.owner.local` | Development owner credentials |
| `.env.hosted.local` | Hosted database configuration |
| `.env.hosted-secret.local` | Hosted Payload secret |
| `.env.hosted-owner.local` | Hosted admin credentials; use this for the live login |
| `.vercel/project.json` | Link to the existing Vercel project |

Hosted and local owner passwords differ. Hosted login was verified through the browser and API. Do not run bootstrap again or reset a password unless requested. Public first-user registration and password-reset endpoints are intentionally blocked until secure recovery is configured.

Two separate Neon free-tier databases exist: `el-amal-development` and `el-amal-hosted`, region iad1, Neon auth disabled because Payload handles staff auth. Do not point local experiments at hosted data.

Changing the ChatGPT account does not replace the GitHub/Vercel/Neon accounts. Their access must remain available; reconnect authorisation if prompted. Cloud database contents are not stored in the project folder or private ZIP. Database export/restore is a separate, still-pending backup task.

## Development and verification

- Stack at handover: Node22, Next16.3.5, React19.2.8, Payload3.78.0, PostgreSQL, Tailwind4, Motion12. Exact versions are in the root lockfile.
- Existing folder: use installed dependencies. On a restored copy without dependencies, run `npm ci` from the root.
- Frontend preview: `npm run dev` at http://127.0.0.1:3004.
- `npm run typecheck`, `npm test`, `npm run build` are the standard checks.
- Read the installed `node_modules/next/dist/docs/` before changing Next.js behaviour.
- Local Windows has repeatedly hit paging-file/thread/process exhaustion. Run heavy checks sequentially. `NODE_OPTIONS=--max-old-space-size=384 --v8-pool-size=1` helped types/database scripts. Running each test file directly with Node avoids concurrent test workers.
- `npm run cms` is development-only by default. Do not accidentally substitute hosted env files for test scripts.
- `CATALOGUE_SOURCE=demo` is the default; `cms` requires a reviewed explicit deployment change and working CMS env. It never silently falls back to fixtures on errors/empty results. Separate browser-storage keys isolate demo and CMS baskets.
- Last evidence:22 unit tests, TypeScript and Vercel build succeeded. Development DB publish/draft-edit isolation/unpublish checks succeeded and temporary IDs were cleaned.
- Browser checked: English/Arabic search/detail/basket, persistence, category-chip reset, no-results guidance, form required errors/review/edit focus, mobile menu Escape,320/390px hero and desktop pause/resume. No console errors in the checked flow.
- Screenshots: `artifacts/2026-09-20/homepage-desktop.png` and `homepage-mobile-320.png`.
- Full CMS-mode browser render test, Lighthouse/Core Web Vitals measurements, comprehensive accessibility and complete role/security tests remain unfinished. No scores/approval claimed.

## Next work in order

1. Recheck npm advisories and upgrade the existing compatible Payload package group with migration review and security/permission/login regressions. Audit on20 September reported high/critical advisories in the3.78 stack; Motion had none. Do not use a blind force-upgrade.
2. Finish non-owner direct API tests, hosted recovery/mail setup and backup/restore procedures.
3. Receive Nour's visual feedback and complete measured accessibility/performance checks; retain static/reduced-motion alternatives.
4. Verify CMS-mode public rendering in a controlled environment without exposing test records on the live catalogue.
5. Implement secure persistent RFQ workflow and then transactional inventory. Keep the form honestly labelled until enabled end to end.
6. Continue remaining content-page structure; ask for factual contact/legal/brand content when needed.
7. Actual catalogue intake only after Nour supplies photos. Proceed with the other work meanwhile.

## Backup and moving to another account

The working folder is already on this laptop. A private ZIP is stored under `artifacts/private-backups/`; see its manifest for exact coverage. It includes Git history, local env credentials, source proposal and screenshots, but excludes reproducible `node_modules`, `.next`, output/coverage and TypeScript caches. Restore those dependencies using `npm ci`. The ZIP is not encrypted: keep it private, preferably with another copy on a private external drive.

This folder does not contain a full conversation export, cloud database dump, installed global plugins/skills, or account authentication sessions. Durable project decisions are summarised above. Keep the original account accessible if you need its historical chat. On the same laptop the global tools may still exist; on another machine reinstall tools and reauthenticate rather than copying account tokens.

Sign in with the new account, add/open this existing folder as a local project, and paste the resume prompt above. Do not start a blank project or clone over this folder. If restoring the ZIP, extract into a new empty folder, preserving hidden `.git`, `.env*` and `.vercel` files. Local project folders and durable AGENTS.md/documentation support resuming work: https://learn.chatgpt.com/docs/projects


Latest priority: client requirements from 24 September now deployed. Read the newest PROGRESS.md checkpoint and docs/client-requirements-2026-09-24.md before resuming the older phases. Phone/WhatsApp and WIKA evidence await Nour; catalogue remains deferred.
