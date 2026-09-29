# Operations and search release — 29 September 2026

## Implementation and evidence

The existing bilingual catalogue and approved navy/white/orange design remain. This release adds private staff inventory, verified-enquiry photo attachments, scheduled maintenance and technical search improvements. No catalogue quantities, prices, manufacturer relationship or business contact information are fabricated.

- Inventory: receipts, signed adjustments, exact-SKU holds against verified enquiries, release/dispatch/expiry, reconciliation, role checks, atomic availability and retry identity. `/staff/inventory` is authenticated; collections are private and append-only. SKU identity cannot be relabelled after creation; create a new SKU and deactivate an old definition when configuration changes.
- Photos: up to three reconstructed JPEG/PNG photos per verified enquiry, 2 MiB each, 8 MP input cap, encrypted in the existing Neon database with a 64 MiB logical total cap. Only owner/sales download. Files become unavailable after 30 days; scheduled retention removes expired rows. PDF/Excel/general-document uploading is not implemented. See the photo runbook for key rotation, storage overhead and retry limits.
- Accounts: 15–128-character new passwords, five-attempt sign-in lock, shorter sessions, neutral/rate-limited recovery, private response headers and a real email adapter. A reproduced concurrent reset-token bug was fixed with transaction-bound locking: two successes before the fix, exactly one afterward. Existing credentials were not silently replaced; the previously chosen short owner password still needs replacement.
- Operations: durable shared lease and health, bounded retries/retention, serialized active-queue cap, stale-health admission guard, and daily native Vercel maintenance. New public requests require fresh successful mail-worker evidence; accepted retries remain available during an outage. Maintenance does not fabricate mail health.
- SEO: eligible production indexing, public sitemap with bilingual alternates and product images, category/pagination discovery, private/form/filter exclusions, truthful schema, stable social image, icons and optional Search Console verification. The full sequential crawl checks every public route and expected product count.

122 unit checks and integrated TypeScript succeeded. Isolated development regressions succeeded for inventory concurrency/access, worker lease/retention/queue limits, public intake health/quotas/retries, photo quotas/access/retention and real Payload recovery/session behavior. Fake mail transports only; disposable schemas removed. The additive migration `20260929_002849_launch_operations` was reviewed and applied to development and hosted databases.

Independent SEO, operations and security reviews produced concrete fixes. Working reports and raw verification are in ignored `artifacts/2026-09-29/launch/`. Local compilation reached the TypeScript stage but the Windows host hit native memory exhaustion; that build is not counted as successful. Linux Vercel and GitHub builds succeeded. CI now migrates disposable PostgreSQL, builds with CMS enabled and actually starts the built server to check public/private routes.

The initial9a09e82 build exposed a runtime import-map URL incompatibility. Immediately rolled back to the preceding working site, fixed the bundled URL/path and customer-upload/CMS route collision in2960526, verified a protected candidate and then restored the new release. The stable review URL remains unchanged. This code rollback rehearsal does not establish database backup/restore readiness.

Full live SEO audit:342 public pages,342 sitemap entries,155 assets, zero detected issues and all151 products in both languages. Live owner sign-in, stock page, anonymous access boundaries and maintenance passed their scoped checks. Maintenance attempted/sent zero email and saved no mail-success timestamp. The registered native cron is daily. Exact product configurations are still absent: production has zero counted SKU definitions.

Browser checks covered10 representative English/Arabic public/login routes and owner stock: zero automated axe violations in the checked rules after notice/login landmark fixes; some manual-review items remain. Checked widths included320,390 and1440px without page overflow. Actual Arabic product content works with JavaScript disabled, reduced motion suppresses the entrance, and keyboard focus starts with Skip to content. No uncaught JavaScript errors in these sampled flows. This is not a complete screen-reader/device certification.

Performance fixes prioritize the actual product photo, reduce basket serialization to product ID/model/name and scope Payload's theme-negotiation headers to administration. The checked product HTML fell from140,383 to60,600 bytes (uncompressed), with no public Critical-CH header. Such a header can cause the browser to repeat its first navigation; public pages do not need CMS theme negotiation. [MDN Critical-CH reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Critical-CH)

The new Undici moderate advisory was resolved through the compatible Payload-scoped 7.29.1 override. Audit now reports zero high/critical/low and five moderate findings in the existing Drizzle/esbuild development chain. No esbuild development server is exposed by this app. This is a scoped audit, not a security certification. [Undici advisory](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v)

## Production boundaries

Final application commit `b1c7632` is deployed as `dpl_869XeFsv2NEteNwxHPisnBDCKWBs`; GitHub quality run36507411015 succeeded on that commit. Product basket add/quantity/reload/language/remove, exact-model search and keyboard menu checks were repeated after the smaller basket projection, with test browser data removed.

| Local mobile Lighthouse sample | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Actual product before fixes | 57 | 100 | 100 | 100 | 5.8s | 590ms | 0 |
| Actual product after fixes | 84 | 100 | 100 | 100 | 3.4s | 160ms | 0 |
| Current homepage | 78 | 100 | 100 | 100 | 4.0s | 330ms | 0 |

These samples do not meet the90+ performance/LCP2.5s goals. They are not field Core Web Vitals or proof of perfect SEO/security/accessibility. Further performance work and representative field monitoring remain open. Local response-header inspection confirms gzip support; the Lighthouse compression diagnostic is not alone evidence that production universally lacks compression.

The actual Vercel plan is Hobby. Its daily cron is suitable for bounded maintenance, not one-hour confirmation emails. The source schedule runs at 02:00 UTC within the platform's Hobby timing window. A frequent scheduler and real sender/domain remain prerequisites for enabling customer delivery and recovery. Resend Marketplace offers a free plan but requires an owned sending domain; the confirmed iCloud address is the receiving inbox.

Sensitive Vercel settings are intentionally returned blank by `env pull`; a blank downloaded value is not evidence that production lacks it. Preserve the existing private hosted-secret file and validate runtime behavior.

Search Console ownership/submission, final business/contact facts, stock counts/configurations, strong owner credentials and final client acceptance remain inputs. General-document scanning/storage, broader device/accessibility review, real delivery tests, external alerting and a complete database backup/restore rehearsal remain unfinished engineering/operational acceptance work. Do not describe the project as 100% complete or guarantee ranking/security.
