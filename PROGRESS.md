# EL AMAL progress

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
