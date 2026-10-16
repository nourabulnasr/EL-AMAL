# Performance and accessibility verification — 16 October 2026

This audit measures the published, real-catalogue website at `https://www.al-amaleg.com`. It preserves the approved design. It does not establish field Core Web Vitals, certify accessibility compliance or represent visual approval by Nour.

## Method and evidence

Official Lighthouse CLI 13.5.0 ran in isolated headless Chrome 155 profiles, with its standard mobile settings: 412 × 823 CSS pixels, device scale 1.75, simulated slow 4G and 4× CPU slowdown. These were normal page loads with JavaScript, images, fonts, the entrance and consent notice enabled. No resources were blocked and motion was not disabled to improve scores. All eight baseline runs completed without runtime errors or audit warnings.

Local evidence: `artifacts/2026-10-16/performance/lighthouse-*.json` and corresponding logs. A second sample for the English home and Arabic product is in `baseline-repeat/`, including Lighthouse network logs and traces. The repeatable runner is `artifacts/run-public-lighthouse-2026-10-16.mjs`; use a new `--label` to retain earlier reports. This is ignored local evidence, not a public customer-data export.

The official PageSpeed API returned a daily-quota 429 and produced no usable report. The scores below come from successful local Lighthouse runs, not that failed API request. Local CPU and network conditions affect these lab samples; a single result is not a percentile or a guarantee for visitors.

## Production baseline before the focused fixes

| Public route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| English home `/en` | 74 | 96 | 100 | 100 | 3.5 s | 560 ms | 0 |
| Arabic home `/ar` | 79 | 96 | 100 | 100 | 4.1 s | 280 ms | 0.001 |
| English catalogue `/en/products` | 88 | 100 | 100 | 100 | 3.4 s | 100 ms | 0 |
| Arabic catalogue `/ar/products` | 82 | 100 | 100 | 100 | 4.4 s | 80 ms | 0 |
| English product `/en/products/cms-156` | 92 | 100 | 100 | 100 | 3.0 s | 100 ms | 0 |
| Arabic product `/ar/products/cms-156` | 80 | 100 | 100 | 100 | 3.5 s | 130 ms | 0.125 |
| English RFQ `/en/rfq` | 92 | 100 | 100 | 69 | 3.0 s | 160 ms | 0 |
| Arabic RFQ `/ar/rfq` | 86 | 100 | 100 | 69 | 3.9 s | 130 ms | 0.002 |

The RFQ's lower SEO score is the intentional `noindex` on a transaction form. It is not a reason to make the RFQ indexable. Public catalogue pages scored 100 in Lighthouse's covered SEO checks; this does not prove Google has indexed them.

A second unchanged-production sample gave English home **89 / 96**, LCP **3.1 s**, TBT **170 ms**, CLS **0**; Arabic product **82 / 100**, LCP **4.3 s**, TBT **140 ms**, CLS **0**. The contrast failure repeated; the Arabic layout shift did not. Both samples are retained rather than selecting only the better score.

## Findings and narrow corrections

1. **Text contrast during scroll reveals:** both homepages had four failing heading spans. The reveal started at 30% opacity, leaving white text with approximately 2.63:1 contrast on navy and 2.04:1 on the lighter blue section. The correction retains the approved vertical reveal motion and clipping while keeping text fully opaque. Reduced-motion behavior remains in place.
2. **Hero image discovery:** Lighthouse identified the full-width precision illustration as the homepage LCP image. The baseline recorded roughly 0.4–0.65 seconds of discovery delay before its request. The image now uses Next.js 16's responsive `preload` API, giving the browser its existing `srcset`/`sizes` from the head. The image, compression quality and composition are unchanged; no extra image is introduced. Post-release measurement must establish its actual effect.
3. **Consent keyboard focus:** the parent agent's browser check found that declining a manually reopened analytics notice removed the focused button and left focus on the page body. The corrected component returns focus to the settings trigger only when the visitor opened it manually. The initial notice does not jump visitors down to the footer. The trigger also exposes its expanded state. Consent, privacy-signal and tracking behavior are unchanged.
4. **Report context filter:** the backend already supported the `related` context for similar-product impressions and selections. The admin report dropdown was missing its corresponding option. “Similar products” is now selectable without adding a metric or changing stored data.

The integrated project typecheck completed successfully after these corrections. Candidate/deployed retesting is still required before claiming the corrections are verified live.

## Investigated without speculative changes

- **Arabic font shifts:** the first product sample attributed the 0.125 layout shift to late Noto font subsets; the repeat reported 0. Font widths measured from the actual Noto and Arial files showed the existing fallback size adjustment is already close to representative Arabic text. An isolated Next.js 16.3.8 build verified that dynamically importing the font module did not emit a useful locale-specific preload. Blindly changing fallback metrics or preloading the 166 KB Arabic font on English pages would risk regressions, so neither was applied. Arabic typography remains intact. Further cold-load measurement remains appropriate.
- **Compression:** Lighthouse's Chrome responses lacked a compression header, but explicit public HTTP requests negotiated Brotli successfully for both homepages and both stylesheets. `http-transfer.json` records those responses. Browser/network behavior needs independent confirmation before treating this as an origin compression defect; compression was not disabled in application configuration.
- **CSS size:** the 65 KB decoded shared stylesheet mostly contains authored site styles and font faces. Tailwind utility output is a small portion. The suspected broad dependency scan was not reproduced.
- **CPU variation:** unchanged-home TBT ranged from 170 to 560 ms. This is a reason to repeat measurements, not to claim a code change caused every score difference.

## Browser interaction evidence and remaining checks

The parent agent used the recovered in-app browser on the live site. At 390 px, the skip link moves keyboard navigation to the main content; the mobile menu closes with Escape and returns focus to Menu. Arabic specification-anchor navigation clears the sticky header. Product option radio buttons respond to arrow keys and enable adding the selected configuration. At 320 px, RFQ content has no observed horizontal overflow and attempting the empty review moves focus to the required name field. A combined pressure-switch/pharmaceutical filter produced PSD-4; switching to Arabic retained the query. The 1440 px desktop sample had no observed horizontal overflow. These are targeted checks, not a full assistive-technology audit.

The native zoom shortcut did not change zoom in the available browser, and reduced-motion emulation was not exposed. **Actual 200%/400% zoom, device-level reduced-motion behavior, screen-reader reading order and a physical mobile device remain unverified.** Source rules cover reduced motion, but source inspection is not a substitute for those tests. The parent retains browser screenshots and interaction evidence separately.

The report table source has a labelled, keyboard-focusable scroll region, a caption, row/column headers, associated filter labels, pause controls and background-tab refresh suppression. Thirty-second updates are not a noisy live region; errors use alerts. No private report was exported for this audit.

## Acceptance status

Performance work is measurable but **the 90+ mobile score on every representative page and LCP under 2.5 seconds are not yet established**. Automated accessibility is 100 on six baseline routes and 96 on two homepages before the contrast correction. A 100 automated score does not cover every WCAG criterion. Field INP under 200 ms and a field Core Web Vitals pass require sufficient real-user measurements; these Lighthouse results cannot establish them.

Next verification: build/deploy the integrated candidate, repeat the eight-route audit under a new label, recheck the contrast and focus corrections, preserve any remaining failures explicitly, and complete device/assistive checks when their controls are available.

References: [Lighthouse documentation](https://developer.chrome.com/docs/lighthouse/overview), [LCP guidance](https://web.dev/articles/optimize-lcp), [font fallbacks](https://developer.chrome.com/blog/font-fallbacks), [Next.js Image preload](https://nextjs.org/docs/app/api-reference/components/image#preload), [React DOM refs](https://react.dev/learn/manipulating-the-dom-with-refs).
