# Private demand reporting

Owner and sales staff can open `/staff/reports` after signing in through the existing Payload administration. The page reports saved enquiry demand and provides a protected CSV download. Warehouse and catalogue-editor roles cannot read this report. No analytics provider, tracking cookie or browser event collector is introduced.

## Reading the report

- The default view covers the last 30 Cairo calendar days, including today, and includes customer enquiries only.
- Choose dates, enquiry group, a model substring, a range substring and groups per page, then select **Apply filters**.
- **Enquiries** counts distinct matching submissions. **Requested units** sums matching submitted line quantities. **Verified customer enquiries** counts matching customer submissions with verification status `verified` and a stored verification timestamp.
- A submission can contain several models or ranges. It counts once in each matching row and once in the summary, so row request counts must not be added together.
- Customer submissions with no completed verification, including a verified status without a timestamp, belong to the unverified group. `test-verified` records and all demo-source records have separate groups and are excluded from the default customer view.
- Dates filter the original submission time. Verification labels reflect the current saved verification state, not the state at the end of the selected period. Closed submissions remain historical demand. Verification is not a completed sale or confirmed stock allocation.
- No-data views contain no invented or preview statistics. A page beyond the result range links back to the first page.

## Model and range privacy

Reports read immutable enquiry item snapshots rather than joining the current product catalogue. Editing or deleting current catalogue information cannot rewrite demand history. Catalogue model snapshots are eligible when the trusted submission service stored a `cms-N` product identifier; known demo identifier shapes are eligible only in the separate demo group.

Direct customer requests permit arbitrary text in their model and range fields. To prevent names, telephone numbers or email addresses being disclosed through these fields, their models are grouped as **Customer-specified model**. A range is shown only when it matches a narrow numeric measurement expression such as `0–10 bar` or `-20 to 80 °C`. Other text becomes **Range requires staff review**; an empty range becomes **Range not specified**. No technical equivalence or unit conversion is inferred: different submitted expressions remain separate. Staff can inspect original details in the existing private enquiry inbox.

The report never selects contact names, email addresses, company names, customer/internal notes, verification tokens or attachment information from the database. It uses the enquiry database ID internally only for distinct counts; neither that ID, line ID, product ID nor enquiry reference is returned in JSON or CSV. The response contains aggregate model/range/group/count/unit values and selected report filters. Model/range searches operate only on the privacy-safe labels, preventing hidden free-text searches from becoming a disclosure channel.

Demand is not a stock-shortage measure. A model/range enquiry does not identify an exact orderable SKU or prove an allocation shortfall. Staff must review exact SKU selection and stock allocation in `/staff/inventory`. The report does not invent shortages from catalogue availability labels or from unrelated inventory balances.

## CSV and API

`GET /api/staff/demand-report` uses the existing authenticated Payload session. It independently checks the staff collection, identifier and owner/sales role, and the database service re-checks the persisted role before reading. A stale authenticated owner/sales object cannot bypass a later role change. Disabled administration returns 503; missing or unrelated-role authentication returns 403.

Supported query parameters:

| Parameter | Meaning and bounds |
| --- | --- |
| `start`, `end` | Exact `YYYY-MM-DD`, inclusive Cairo calendar dates, no future dates; at most 93 days. Start defaults to 29 days before end; end defaults to today. |
| `cohort` | `customers` (default), `verified`, `unverified`, `test`, `demo`, or `all`. |
| `model`, `range` | Literal case-insensitive substrings of visible labels; maximum 120 / 160 characters. |
| `page` | Whole number 1–20000, default 1; bounded by the maximum source-line count so one-group pages can reach every report row. |
| `pageSize` | Whole number 1–100, default 25. |
| `format` | `json` (default) or `csv`. |

Unknown or duplicate parameters, invalid dates, control characters and oversized queries return 400. Dates convert using PostgreSQL `Africa/Cairo` timezone rules, including daylight-saving transitions. An inclusive end date is represented by the exclusive start of its following Cairo day.

**Download CSV** includes every matching group across all pages, up to 2,000 groups. It refuses an oversized export with 413 instead of silently truncating rows. All cells are quoted, embedded quotes are doubled, and formula-leading cells are prefixed with an apostrophe. This includes negative temperature ranges, which intentionally export as text. UTF-8 BOM supports spreadsheet Arabic/Unicode detection. Columns are period start/end, model, range, enquiry group, requests and units.

All API responses, including errors and CSV, use `private, no-store`, `noindex, nofollow`, `no-referrer`, and `nosniff`. The staff page is dynamically rendered with noindex metadata and inherits private/no-store staff route headers. Neither route belongs in the public sitemap. Database errors return a generic message, not database diagnostics.

## Operational limits

One read-only repeatable-read transaction holds the role check and enquiry snapshot read. Parameterized SQL uses a fixed maximum of 20,001 source rows and an eight-second statement timeout. At most 20,000 dated source lines can be reported; the extra sentinel row detects oversized periods. The source cap applies before model/group filtering. Shorten the date interval if exceeded. The service refuses incomplete totals.

This version needs no schema migration, separate service or new environment variable. It uses the existing Payload PostgreSQL pool. It performs no report writes, no stock changes and no email delivery. Export files are private business information; the server does not keep downloaded copies.

## Verification

Focused pure-function and HTTP behavior checks:

```powershell
node --experimental-strip-types --test --experimental-test-isolation=none tests/demand-report.test.mjs
```

Persisted-data and real Payload JWT regression, only against the verified development environment:

```powershell
$env:CMS_DATABASE_CHECK='development'
node --max-old-space-size=384 --env-file=.env.local --env-file=.env.development.local --experimental-strip-types scripts/check-demand-report.ts
```

The regression uses `scripts/lib/isolated-payload.ts` to clone an empty temporary schema, creates only disposable staff/enquiry fixtures, and removes the schema in `finally`. It verifies model snapshots, quantities, duplicate-line request counts, all four verification/demo groups, closed enquiries, privacy redaction, literal filtering, pagination, complete CSV, formula escaping, actual owner/sales JWT access, denied roles, persisted role revocation and Cairo's 23-hour daylight-saving day. It sends no email and never writes shared application records. Coordinate with other database/build checks on low-memory development hosts.
