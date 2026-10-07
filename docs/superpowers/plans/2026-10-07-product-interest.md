# Live product interest implementation plan

> Execution: inline using executing-plans and test-driven-development, with an independent final review. Nour explicitly requested implementation and completion of all work that needs no human action.

**Goal:** Show owners and sales staff live, measured per-product catalogue CTR alongside saved customer demand.

**Architecture:** A first-party, consent-based collector writes deduplicated product/session measurements to the existing PostgreSQL database. Server-issued, signed 30-minute sessions, bounded requests, same-origin checks, published-product validation and role protection keep the feature independent of a third-party analytics account. The private report refreshes every 30 seconds while visible; exact customer demand remains a separate metric.

**Stack:** Existing Next App Router, React, Payload PostgreSQL pool, native IntersectionObserver and Page Visibility APIs. No added runtime dependency.

**Spec:** Current user request and docs/source/proposal-extracted.txt analytics definitions. The following decisions narrow the first delivery without inventing historical data.

## Design and constraints

- Catalogue CTR = distinct consenting sessions with a selection paired with an eligible impression / distinct consenting sessions with an eligible impression, per product and selected date/locale/device/list filters. A card is eligible after at least 50% viewport intersection for one continuous second in a visible document. Occlusion by other windows cannot be measured reliably; describe this as measured viewport visibility.
- Deduplicate repeated events in the database. Never manufacture an impression from a click; quick clicks without an eligible impression do not enter CTR.
- Track product-page views, basket additions and datasheet clicks separately, once per product/session/context. No raw query strings, referrers, names, emails, phone numbers, uploaded files or freeform text enter measurements.
- First-party opt-in defaults off; choices can be changed in the footer. Respect browser privacy signals. Staff and recognized bots are excluded. This is a sample of consenting measured visits, not all visitors or unique people.
- Session lifetime 30 minutes, pseudonymous measurement retention 93 days, bounded cleanup on writes. Disabled collector returns unavailable and never creates an identity.
- Use existing navy, pale blue, white and orange staff styles. Focal point: sortable product table. Contrast: existing dark surfaces. Framing: left-aligned editorial heading, full-width table. Feeling: calm, accurate operational insight. No new public visual direction or hero change.
- Report refresh 30 seconds while visible, pause/manual refresh controls, last-success timestamp, errors retain prior data clearly labelled stale. Filters use Cairo calendar dates, at most 93 days. Low sample warning below 30 impressions is a practical caution, not statistical significance.
- All staff reads require owner/sales role, rechecked against stored role. No public raw-event read endpoint. CSV neutralizes spreadsheet formula prefixes.
- Existing RFQ report counts are server-persisted enquiries. No synthetic conversions or claim that a view became a sale. Quotation documents cannot reveal product demand automatically.
- Production database mutation remains behind the specifically unanswered backup-destination authorization. No private export workaround, paid integration, account acceptance, monitoring activation or business facts invented.

## Review focus

1. Out-of-order/retried events must not double-count or create CTR above 100%.
2. Fast clicks, hidden tabs and navigation cleanup must not fabricate impressions.
3. Consent withdrawal, staff visits, expired/forged sessions and unpublished product IDs must not record events.
4. Cairo date boundaries and filtered denominators must match; raw customer text must not reach analytics or CSV.
5. Concurrent writes and report refreshes must remain bounded, authorized and visibly honest when disabled or failing.

## Tasks and evidence ledger

### 1. Measurement contract and intake
- [ ] Tests first: `parseInterestEvents({events:[{kind:'impression',productId:'cms-1',locale:'en',list:'catalogue'}]})`; reject arbitrary keys, draft/demo IDs, oversized batches, malformed enum values. Session token tampering/expiry, disabled gate, cross-origin and staff denial tests.
- [ ] Implement src/lib/product-interest.ts, product-interest-session.ts and product-interest-http.ts, plus the POST route and runtime.
- [ ] Implement reviewed additive SQL migration with database uniqueness, bounded cleanup and published-product validation in product-interest-service.ts.
- [ ] Verify deduplication/concurrency/authorization/retention against an isolated development schema, never production data.

### 2. Browser and private report
- [ ] Add deterministic visibility state tests before browser observer implementation.
- [ ] Add consent control, event batching and observer lifecycle with route-change handling; annotate existing card/detail/action elements without turning product content into client components.
- [ ] Implement aggregate query, date/locale/device/list/sort filters, CSV, staff page and automatic refresh. Test paired CTR, distinct sessions, date bounds and response privacy.
- [ ] Link report from staff navigation, existing demand report and Payload dashboard.

### 3. Verification, documentation and release
- [ ] Run full unit suite, TypeScript, isolated SQL tests and production build/CI as available. Review EN/AR consent and report mobile/desktop behavior in browser.
- [ ] Independent review; fix material findings with regression evidence.
- [ ] Update readiness, admin usage, remaining-work register and progress with exact built/tested/live distinctions. Commit and push scoped files to current review branch; do not promote pending schema into production.

Ruling: existing selected visual system and the user's direct execution instruction supply scope and authorization; no repeat design/plan approval is needed. Impeccable files were not found; manual accessibility/layout checks must be reported honestly, not represented as that suite.

Ruling: use a versioned additive migration and isolated test schema for analytics. The pending quotation migration must not be skipped or silently promoted when deploying this branch. Production activation is an owner-dependent release step until the existing backup restriction is resolved.
