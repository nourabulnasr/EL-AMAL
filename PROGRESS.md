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
