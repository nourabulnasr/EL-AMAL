# Operations and search release — 29 September 2026

## Implementation and evidence

The existing bilingual catalogue and approved navy/white/orange design remain. This release adds private staff inventory, verified-enquiry photo attachments, scheduled maintenance and technical search improvements. No catalogue quantities, prices, manufacturer relationship or business contact information are fabricated.

- Inventory: receipts, signed adjustments, exact-SKU holds against verified enquiries, release/dispatch/expiry, reconciliation, role checks, atomic availability and retry identity. `/staff/inventory` is authenticated; collections are private and append-only. SKU identity cannot be relabelled after creation; create a new SKU and deactivate an old definition when configuration changes.
- Photos: up to three reconstructed JPEG/PNG photos per verified enquiry, 2 MiB each, 8 MP input cap, encrypted in the existing Neon database with a 64 MiB logical total cap. Only owner/sales download. Files become unavailable after 30 days; scheduled retention removes expired rows. PDF/Excel/general-document uploading is not implemented. See the photo runbook for key rotation, storage overhead and retry limits.
- Accounts: 15–128-character new passwords, five-attempt sign-in lock, shorter sessions, neutral/rate-limited recovery, private response headers and a real email adapter. A reproduced concurrent reset-token bug was fixed with transaction-bound locking: two successes before the fix, exactly one afterward. Existing credentials were not silently replaced; the previously chosen short owner password still needs replacement.
- Operations: durable shared lease and health, bounded retries/retention, serialized active-queue cap, stale-health admission guard, and daily native Vercel maintenance. New public requests require fresh successful mail-worker evidence; accepted retries remain available during an outage. Maintenance does not fabricate mail health.
- SEO: eligible production indexing, public sitemap with bilingual alternates and product images, category/pagination discovery, private/form/filter exclusions, truthful schema, stable social image, icons and optional Search Console verification. The full sequential crawl checks every public route and expected product count.

121 unit checks and integrated TypeScript succeeded. Isolated development regressions succeeded for inventory concurrency/access, worker lease/retention/queue limits, public intake health/quotas/retries, photo quotas/access/retention and real Payload recovery/session behavior. Fake mail transports only; disposable schemas removed. The additive migration `20260929_002849_launch_operations` was reviewed and applied to development and hosted databases.

Independent SEO, operations and security reviews produced concrete fixes. Working reports and raw verification are in ignored `artifacts/2026-09-29/launch/`. Local compilation reached the TypeScript stage but the Windows host hit a native memory allocation failure; the local build is not counted as successful. Cloud build and live evidence will be recorded in PROGRESS.md.

The new Undici moderate advisory was resolved through the compatible Payload-scoped 7.29.1 override. Audit now reports zero high/critical/low and five moderate findings in the existing Drizzle/esbuild development chain. No esbuild development server is exposed by this app. This is a scoped audit, not a security certification. [Undici advisory](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v)

## Production boundaries

The actual Vercel plan is Hobby. Its daily cron is suitable for bounded maintenance, not one-hour confirmation emails. The source schedule runs at 02:00 UTC within the platform's Hobby timing window. A frequent scheduler and real sender/domain remain prerequisites for enabling customer delivery and recovery. Resend Marketplace offers a free plan but requires an owned sending domain; the confirmed iCloud address is the receiving inbox.

Sensitive Vercel settings are intentionally returned blank by `env pull`; a blank downloaded value is not evidence that production lacks it. Preserve the existing private hosted-secret file and validate runtime behavior.

Search Console ownership/submission, final business/contact facts, stock counts/configurations, strong owner credentials and final client acceptance remain inputs. General-document scanning/storage, broader device/accessibility review, real delivery tests, external alerting and a complete database backup/restore rehearsal remain unfinished engineering/operational acceptance work. Do not describe the project as 100% complete or guarantee ranking/security.
