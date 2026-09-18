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
