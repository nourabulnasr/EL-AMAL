# Search and advertising preparation: evidence

Checked 7 November 2026 using the public site and Nour's existing signed-in Google account. This is a dated snapshot, not an ongoing monitoring service.

## Public technical crawl

Command: `node --max-old-space-size=256 scripts/audit-live-seo.mjs --origin=https://www.al-amaleg.com --expected-products=165 --output=artifacts/seo-live-audit-2026-11-07.json`.

Result: exit 0, 384 public pages, 384 sitemap URLs, 165 English product pages and 165 Arabic product pages, 169 image assets, zero covered issues. Checks include HTTP responses, canonical/hreflang, meta/structured-data presence, images and private/form/filter indexing safeguards. This does not verify Google rich-result eligibility, rankings, complete index coverage or field Core Web Vitals. The first process failed to start on Windows; the bounded-memory retry completed normally.

## Google Search Console

Existing domain property `al-amaleg.com` was accessible through Nour's account. No additional DNS verification, access invitation or ownership change was needed or performed.

Sitemap table: https://www.al-amaleg.com/sitemap.xml, submitted29October, lastread2November, **Success**, 384discovered pages.

Aggregate Page indexing lastupdate23October: 155indexed /229notindexed. Exclusions: sixnoindex, fourredirects, one404,216discovered-not-indexed, twocrawled-not-indexed. The404 example is `https://www.al-amaleg.com/$`. It is a made-up URL and should remain unavailable; there is no basis to create content or an unrelated redirect for it. The other exclusion examples were not individually exhausted; do not call every one a defect or every one expected. The aggregate report is stale relative to individual inspections.

Individually inspected:

| URL | Google-reported state |
|---|---|
| https://www.al-amaleg.com/en | Indexed; HTTPS |
| https://www.al-amaleg.com/en/solutions/pressure-instruments-egypt | Indexed; valid breadcrumb item |
| https://www.al-amaleg.com/ar/solutions/pressure-instruments-egypt | Indexed; valid breadcrumb item |
| https://www.al-amaleg.com/en/products/cms-156 | Indexed; valid breadcrumb item; cached product-rich-result issue |

Product rich-result detail: **Either 'offers', 'review' or 'aggregateRating' should be specified**, cached crawl16October14:38:02 as displayed. This RFQ catalogue does not publish fixed product prices or genuine product ratings. Valid descriptive Product entities alone do not meet Google's enriched product-result requirements. Do not fabricate prices/reviews, add a free-price offer, import unrelated company reviews as product reviews or remove useful Product data merely to hide the warning. This limits the enhanced product display, not the observed ordinary indexed status. A fresh crawl cannot supply missing real business data by itself.

Official required properties: https://developers.google.com/search/docs/appearance/structured-data/product-snippet.

Requested a fresh crawl of the updated priority product `/en/products/cms-156`. Google displayed **Indexing requested** and **URL was added to a priority crawl queue**. This proves queue acceptance, not that a recrawl has finished or the rich-result limitation is resolved. No duplicate request was submitted.

The updated About history remains on the review branch pending visual acceptance; no recrawl of unpublished text was requested.

## Advertising and business account availability

The signed-in Nour account's Ads selector contained no selectable Ads account; only account creation/switch-account options. Business Profile Manager showed0businesses. The client might have existing accounts elsewhere. Ask the client to check before creating duplicates. No new Ads account, billing profile, business listing, tracking resource or invitation was created. No ads or outreach were published or sent.

## Prepared assets

`search-ads-draft.json`: sixadgroups,48headlines,24descriptions,30keywordseeds,eightsitelinks. Local validation checks30-character headlines and90-character descriptions; zero length issues. These are candidate assets for human review, not measured demand/CPC forecasts or a Google Editor import file. No Ads account means account-specific forecasts remain unavailable. Combined proposed budget200EGP/day is a proposal; client spending approval is pending.

`conversion-measurement-plan.md`: exact existing success milestones, consent boundary, private-token exclusion, repeat-submission deduplication and launch acceptance checks. Implementation/activation requires the actual client account identifiers and privacy decisions. The existing catalogue analytics do not silently become Google advertising tracking.

`outreach-drafts.md`: WIKA directory request, honest customer-review request and project-story permission request, for the owner to send if desired.

No production website code changed in this marketing-preparation milestone. Existing unrelated dirty security/dependency/analytics files were preserved.
