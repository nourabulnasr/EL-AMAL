# Release verification — 27 September 2026

## Implemented and deployed

- Guarded customer RFQ submission and resend API/UI, bilingual status handling and fixed-window PostgreSQL visitor/email limits. Signed receipts permit resend only; staff notifications still require genuine customer confirmation. No live sending or inventory reservation enabled.
- About, Contact and Resources pages in English/Arabic; useful specification checklist, truthful company copy, conditional approved contact/WIKA information, canonical/hreflang/schema and navigation.
- Mobile/reduced-motion visitors use the server-rendered instrument without the desktop Motion import. Desktop motion retains pause/resume. Mobile decorative entrance shortened to 1.15 seconds; desktop remains 1.8 seconds.
- Footer/contact touch targets enlarged. A pinned, read-only GitHub quality workflow runs tests/types/audit/build without production secrets. It is an independent check, not a configured Vercel deployment gate.
- Fixed a concurrent rate-limit cleanup race: locked stale candidates are skipped and expiry is rechecked; quota establishment and locking now use one atomic upsert.

## Verification evidence

58 unit tests, TypeScript, cloud production build and independent source review succeeded. Development-database customer tests checked parallel limits, repeat requests, conflicts, expiry, atomic enqueue, resend contention/token replacement, quota denial and saved-snapshot retries. A separate cleanup regression first reproduced deletion of a renewed quota and then succeeded after the fix. Disposable records were removed. No real email transport invoked or hosted schema mutation performed.

Browser checks: desktop About; Arabic Resources and Contact; preview-only Arabic RFQ review; mobile home at375px content width without overflow; desktop motion pause/resume; mobile static fallback; no console errors in checked flow. Earlier local browser resource failure recovered with a fresh test tab. Reduced-motion/no-JS safeguards inspected in source, not runtime-emulated. Activated public submission still requires a separate real-delivery/browser test.

Live EN/AR home/About/Contact/Resources, RFQ and admin login returned200. Public enquiry readiness false; submit/resend503; private SKU API403; anonymous workerPOST401 and workerGET405. Page metadata/schema/hreflang, CSP and HSTS inspected. Preview content remains noindex.

Deployment: dpl_FCyTJFiapTKx58GEnCwe7CttzW99, promoted to https://el-amal-sigma.vercel.app.

The CLI interpreted the native curl -d argument as debug and emitted the project's deployment-protection bypass token. The old token was revoked and a replacement generated privately through the Vercel API; the old token's absence and unchanged protection configuration were verified. Admin/database credentials were not exposed. Future authenticated CLI curl checks must avoid -d/debug and filter diagnostics; do not print tokens. The application does not use the automation bypass environment variable.

## Mobile performance comparison

Both measurements are Google PageSpeed Insights lab runs of the live English homepage, Lighthouse13.5, emulated Moto G Power, slow4G, initial navigation. Single runs can vary. No real-visitor CrUX data is available.

| Metric | Before | After |
|---|---:|---:|
| Performance |92|100|
| Automated accessibility |100|100|
| Best practices |100|100|
| SEO |66|66|
| First Contentful Paint |0.9s|0.9s|
| Largest Contentful Paint |3.2s|1.2s|
| Total Blocking Time |100ms|20ms|
| Cumulative Layout Shift |0|0.022|
| Speed Index |2.5s|2.1s|
| Estimated unused JavaScript |75KiB|47KiB|

[Before report](https://pagespeed.web.dev/analysis/https-el-amal-sigma-vercel-app-en/lv0x342cgz?form_factor=mobile) · [After report](https://pagespeed.web.dev/analysis/https-el-amal-sigma-vercel-app-en/w0ee8nx0hi?form_factor=mobile).

SEO's reported failure is intentionally blocked indexing of demo content. Do not enable indexing merely to improve a score. Automated100 accessibility/best-practices scores are not WCAG conformance, security certification or full-site acceptance. The current LCP/CLS lab values meet our targets; real-user75th-percentile LCP/INP/CLS remains unmeasured. The CSS release animation retains discrete visibility/pointer behavior as a hydration-independent escape; Lighthouse flags it as an unscored non-composited-animation diagnostic. Further render-blocking CSS/legacy JS opportunities remain.

Dependency audit: zero critical/high/low, five moderate inherited Drizzle/esbuild tooling entries. No unsafe major dependency override applied.

Local evidence lives in ignored artifacts/2026-09-27: unit-tests.txt, live-release-check.json, pagespeed-before.txt, pagespeed-after.txt/png, about-live.png and resources-mobile-ar.png. Screenshots are implementation evidence, not a substitute for Nour's visual approval.

## Remaining scope

Production email activation/scheduling/monitoring, private attachments/scanning/retention, stock ledger and reservation lifecycle, account recovery and restore rehearsal, approved policy/business content and full device/permission/accessibility acceptance remain. Catalogue/client details stay deferred in final-client-inputs.md. This increment does not complete all engineering or launch acceptance.
