# Product interest and live reporting

Implemented 7 October 2026 on the quotation review branch. **Prepared and tested; not yet activated on the production website.** On 8 October Nour authorized the encrypted backup and release; the backup was locally verified and both production migrations were applied. Vercel sign-in and application release remain pending at this checkpoint. See [release record](analytics-release-2026-10-08.md). Historical clicks cannot be recovered.

## Where the administrator goes

Sign in at `/admin` with an owner or sales account. Choose **Open product interest**, or open `/staff/products`. The same destination is in the staff navigation and linked from **Demand reports**. Warehouse and catalogue-editor accounts cannot access analytics reports or their export API.

The table ranks products by selections by default. Choose dates, language, device width, context and sort order, then **Apply filters**. **Download CSV** exports the same filtered aggregate view. No customer contact details or visitor identifiers are included.

Both **Product interest** and **Demand reports** refresh every 30 seconds while their tab is visible. Uncheck the update option to pause, or use the refresh button. A timestamp identifies the last successful result. Failed refreshes leave those results visible with an explicit warning; loss of staff permission stops automatic refresh.

## Metrics and decisions

| Metric | Meaning | Use |
| --- | --- | --- |
| Visible | Distinct consenting 30-minute sessions with a product card at least 50% within the viewport for one continuous second in a visible tab | How much exposure the product received |
| Selected | Those sessions with a subsequent product-link activation in the same list/language/context and selected date range | Interest after exposure |
| CTR | Selected / visible × 100; a dash when no measured denominator exists | Compare response to exposure, with the counts alongside it |
| Page views | Sessions where the product heading was visible under the same duration rule | Product-page interest, including direct visits |
| Basket adds | Sessions with an actual enabled Add to quote button activation | Consideration, not a submitted RFQ |
| Datasheets | Sessions activating a technical-document link | Technical interest |
| Saved demand | Separate `/staff/reports`, requested models/ranges/units from persisted enquiries | Stronger purchasing signal; verified email is still not a sale |

Repeated clicks do not inflate a session's counts. Quick clicks before eligibility are excluded from CTR, including when the visitor later returns. Right-clicks do not count; middle-click counts only for links. A product can appear in several contexts; the all-context view deduplicates sessions again, so do not add context totals. Cairo calendar dates, including daylight-saving boundaries, define the reporting window.

Fewer than 30 visible sessions is labelled **Small sample**. This is a practical warning, not a statistical significance test. A 100% CTR based on one person is weak evidence. Compare exposure and verified RFQ quantities before changing procurement. Document-only quotations still require a member of staff to identify the requested products. No guessed demand is extracted from a file.

This is on-site product CTR. Google search CTR belongs to Search Console. Neither is a ranking guarantee or a count of unique people.

## Privacy, security and performance

- Optional bilingual consent notice and persistent footer settings. Collection starts only after Allow. Decline or withdrawal disconnects observers and discards unsent events; browser privacy signals keep tracking off. Choosing either option leaves RFQ functionality available.
- First-party HttpOnly, SameSite=Lax session cookie, Secure on HTTPS, signed and limited to 30 minutes. Database identifiers are HMAC hashes. No new external analytics vendor or runtime dependency.
- Contact details, uploaded documents, referrers, raw search strings, freeform notes and raw IP addresses are absent from measurement records. Rate-limit buckets use the existing separate pseudonymous request-limiting mechanism.
- Allowlisted enums and published, reviewed CMS product IDs; bounded JSON and 32-event batches; same-origin checks; request limits; recognized bot and authenticated staff exclusions. Client measurements remain best-effort and cannot prove every visitor is human.
- One PostgreSQL transaction with database uniqueness and bounded capacity prevents concurrent duplicates. Bulk upserts avoid one cloud database round trip per event. Maximum 100,000 stored context/session rows; no paid capacity automatically provisioned.
- Measurements expire from reports after 93 days. Bounded deletion runs on writes and scheduled maintenance; inactive deployments still need their maintenance schedule operating. Platform backups have their own retention policy.
- The collector is lazy-loaded after consent. IntersectionObserver avoids a continuous scroll polling loop. Public product HTML stays server-rendered. Hidden tabs stop visibility eligibility; admin polling also pauses.
- Authenticated reports recheck the stored role, use private/no-store responses and contain aggregate data only. CSV protects formula-leading cells. All API/staff routes retain noindex and existing security headers.

## Release procedure and evidence

Apply reviewed migrations in order, including the pending quotation migration, only after the previously requested production recovery/export authorization is resolved. Deploy the verified review commit. Set `PRODUCT_ANALYTICS_ENABLED=true` only on the intended live CMS deployment with correct `SITE_URL`, a strong Payload secret and operating scheduled maintenance. Keep it false on ordinary previews.

Development migrations `20261001_120000_existing_quotations` and `20261007_120000_product_interest` were applied to the separate development database on 7 October. No production migration or private export occurred.

Evidence so far: 162 unit checks and TypeScript succeeded; isolated real PostgreSQL tests cover concurrent deduplication, paired CTR, filtered denominators, publication checks, role revocation, aggregate privacy and expiry cleanup. Independent review found right-click, retroactive fast-click attribution and stale-demand-refresh issues; these were corrected, along with observer-context resets, bounded bulk writes and staff secondary-link contrast.

The laptop's full Next development preview exhausted native memory. Browser verification therefore used the actual React report/consent/collector components in a clearly marked synthetic-data harness, separately from real database integration tests. Opt-in, qualified impression/selection, heading visibility, basket actions, ignored right-click, count deduplication, manual refresh, stale-result warning, Arabic withdrawal and continued browsing were checked. Desktop1280px/mobile390px measured no page overflow. The harness uses fallback fonts; it is not production traffic or full deployed browser acceptance.

Commit `470462660d4d225fc94bfa85fda23c4290e40b1d` passed [complete cloud CI](https://github.com/nourabulnasr/EL-AMAL/actions/runs/37681217472), including all database regressions, the production build and built-server private-route/disabled-intake guards. [Vercel review deployment](https://el-amal-4kdrhfa80-nour-abulnasrs-projects.vercel.app) is successful with collection inactive. Production activation and its real end-to-end verification still follow the release procedure above.

References: [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), installed Next.js route-handler documentation. These informed measured viewport visibility and hidden-tab behavior; occlusion by other applications is not reliably measured.
