# Interactive product release and live verification

Prepared 17 October 2026, Cairo time. The release began on 16 October UTC.

The approved product experience is live at **https://www.al-amaleg.com**. Application `03cf9b3a7a8eb681465ba1c4d2375817a72c96ba` was deployed to Production as Vercel `dYEiwqzfBswdSMMe5Vw7NUFzHMWv`, GitHub deployment `7129387398`. Full cloud quality run [38965761267](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38965761267) succeeded before release. The production-branch run `38966072053` also succeeded.

A bounded follow-up, `41fd9dbffe55849cc2b1bfa5e851498198f26205`, wraps the new WIKA statement in the existing framed typography. It adds no CSS, scripts, database changes or new visual direction. Full quality run [38966827297](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38966827297) succeeded; the corrected English preview was inspected. It is now the verified production release: Vercel `Ehx66jrse1ua9uyv71G29brFRQMw`, GitHub deployment `7129538082`. Live English desktop and Arabic mobile checks confirmed the framed heading, correct copy, all three 3D activation controls and no horizontal overflow. Heading size was 58.88px at 1280px and 32px at 390px.

## What customers now have

- Optional sculpted 3D illustrations of the 232.50/233.50 gauge, IV2 valve and model 55 thermometer. Customers can rotate with the cursor, arrow keys or controls, reset the angle, and return to the real photograph. These are labelled simplified illustrations, not manufacturer CAD or exact configuration drawings.
- Complementary **Suggestions** on reviewed product families. The live gauge page offered IV2, a pressure snubber and a syphon; the IV2 page offered a pressure gauge first. Each suggestion explains its role and asks customers to confirm technical compatibility. Selection varies within reviewed pools; unknown pairs are not invented.
- A labelled catalogue search immediately below product-page breadcrumbs. Native GET submission works in English and Arabic without adding client JavaScript.
- The client-confirmed statement that EL AMAL is an official distributor of WIKA products, on Home/About and in relevant descriptions. Supporting evidence links are optional. No exclusivity, territory or certificate was invented.
- Public calling links and Organization structured data using **+20 101 731 4349**. The supplied `+20 01017314349` was normalized by removing Egypt's domestic trunk zero after the country code. Public email remains **alamal4trade@hotmail.com**. WhatsApp availability is not assumed.

Existing product IDs, stock, customer records, email configuration and indexing policy were preserved. This release required no production database migration.

## Live functional evidence

Checks on the production domain observed:

- All three sculptures render. Rotation buttons and keyboard controls work; only one canvas remains after changing products. Returning to the real photo removes the canvas.
- English product-page search for `232.50` returned its single matching group. Arabic search for `IV2` returned its single matching group and kept the Arabic route.
- English and Arabic suggestion text, complementary roles and real product links are present. The two connection options for 232.50/233.50 remain available.
- Arabic layouts at 390px and 320px had no horizontal page overflow. The 3D controls were visible and usable. No browser console errors were observed in these checks.
- The live telephone link is `tel:+201017314349`; both languages display the correct WIKA statement.
- All **165 products** remain published. Both ordinary enquiries and quotation uploads report enabled. The delivery worker recorded a successful run at 21:00 UTC, checked at 21:01 UTC. This was read-only; no customer enquiry or email was sent.

Screenshots and read-only health results are under `artifacts/2026-10-16/product-experience-release/`. Live model/gallery screenshots are `live-3d-gallery.png` and `live-3d-ar-mobile.png`.

## Technical SEO and actual Google indexing

The fresh production crawl checked **372 eligible URLs**, including **165 product pages per language**, and **169 image assets**. It detected zero issues in its covered checks: status/indexing eligibility, canonical URLs, hreflang, locale/direction, titles/descriptions, headings, Open Graph/Twitter metadata, structured-data presence and product image/manufacturer fields. Private, basket, duplicate filtered and other intentionally excluded routes retain noindex controls; the private SKU endpoint rejected anonymous access.

This crawl does not prove rich-result eligibility, Google membership or ranking. Two nonexistent streamed routes returned HTTP 200 with noindex; they were not falsely reported as HTTP 404.

Google Search Console's sitemap report now shows **Success**, **372 discovered URLs**, and a latest read of **16 October**. The aggregate indexing report is still dated 12 October, so its old three-indexed count is stale. Fresh individual URL inspections confirmed these four URLs are indexed:

- `/en/about`
- `/en/industries/oil-gas`
- `/en/products/cms-156`
- `/ar/products/cms-156`

The product inspections also report an enhancement issue: Google requires an offer, review or aggregate rating for Product rich results. This quotation-only catalogue has no genuine public prices or reviews. Its product information remains truthful; no zero-price offer or invented rating was added. This limits enhanced product snippets, not the ordinary index membership confirmed above. See [Google's Product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

No duplicate indexing requests were sent for the already-indexed pages. Search Console screenshots are saved with the release evidence. Other pages still depend on Google's processing; neither every-page indexing nor first-place rankings are guaranteed.

## Performance and accessibility measurements

Fresh public Lighthouse run [38966403379](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38966403379) measured production `03cf9b3`, before the single framed-copy wrapper follow-up. All eight routes had **100 accessibility**, **100 best practices**, and **zero measured cumulative layout shift**.

| Route | Performance | SEO | LCP | Total blocking time |
| --- | ---: | ---: | ---: | ---: |
| English home | 84 | 100 | 2.4 s | 510 ms |
| Arabic home | 90 | 100 | 2.4 s | 330 ms |
| English catalogue | 65 | 100 | 3.0 s | 1,590 ms |
| Arabic catalogue | 83 | 100 | 3.5 s | 200 ms |
| English product | 82 | 100 | 2.5 s | 580 ms |
| Arabic product | 79 | 100 | 3.5 s | 450 ms |
| English RFQ | 91 | 69 | 2.4 s | 300 ms |
| Arabic RFQ | 72 | 69 | 3.4 s | 800 ms |

RFQ's lower SEO audit score reflects its deliberate noindex policy. The Arabic product run reported a slower-than-expected CPU warning. Results are lab measurements, not field Core Web Vitals, interaction latency on a real phone, or a universal 90+ score. The optional 3D viewer was not activated in these load audits.

A diagnostic comparison with the prior catalogue audit found unchanged application/framework/layout script chunks and slightly lower transfer size. Script evaluation grew only about 54 ms, while most additional time was rendering, layout, other main-thread work and garbage collection. Arabic catalogue blocking time improved on the same release. This is consistent with substantial runtime variation, but does not prove the precise cause or erase the 65-point result. No bounded code regression was identified; consent controls were not hidden to improve a score. Consistent performance and field Core Web Vitals remain measurement and maintenance targets. Comparison evidence is saved as `catalogue-performance-comparison.json`.

Compiled production assets independently confirm that neither homepage's ten initial script/RSC chunks contains the Three.js engine. The viewer's three optional chunks are loaded behind the activation condition. This is compiled/HTTP evidence, not a measured browser network waterfall. The renderer caps resolution, renders on demand, suspends when hidden/offscreen, and provides reduced-motion and photo-fallback paths.

Physical touch devices, screen-reader speech and forced GPU-context loss were not exercised. Source review and browser keyboard checks do not substitute for those tests. The security/dependency and access-control checks succeeded; they do not prove permanent absence of vulnerabilities.

## Client handover and remaining inputs

The refreshed nine-page client admin PDF explains access, per-product clicks/CTR, the most-selected products, live report refresh, CSV exports, enquiries, uploaded files, stock and staff roles. It now covers Suggestions, preserved historical analytics, 3D/photo controls and bilingual product-page search. It clarifies that rotating a model does not increase product clicks. All nine pages were rendered and inspected; 14 links were verified. The existing dated aggregate example was reused without exporting new private data.

The complete current action register is [final-client-inputs.md](final-client-inputs.md). Remaining human inputs include company/CEO content, address/hours, whether the phone accepts WhatsApp, genuine staff password-reset/mailbox acceptance, and operating decisions for attachment capacity/scanning, privacy and backups. The shared attachment quota remains 64 MiB; automatic malware scanning is not implemented. Checkly monitoring stays deferred at Nour's request.
