# Public performance follow-up — 29 September 2026

The font-loading candidate reduces unnecessary assets without changing the approved navy/white/orange design, entrance, product photographs or CMS publication behavior. A new production build and browser measurements are still required. The existing mobile targets are not yet verified as met.

## Existing production baseline

Source release: `b1c7632`, stable site `https://el-amal-sigma.vercel.app`.

| Mobile Lighthouse sample | Performance | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: |
| English home | 78 | 4.0 s | 330 ms | 0 |
| English PSM01 product | 84 | 3.4 s | 160 ms | 0 |

These are the actual-catalogue reports in `artifacts/2026-09-29/launch/lighthouse-*-mobile-final.json`, not field Core Web Vitals. They supersede the old demo-homepage result. The product's real photograph is only 5,968 bytes; the trace attributes approximately 2.3 seconds to discovery delay before its request. The root layout currently waits for the fresh catalogue before returning the document shell.

## Implemented font changes

Only `src/app/(site)/[locale]/layout.tsx` changes:

1. Request Newsreader at its used weight, `400`. Every explicit use in the site stylesheet—headings, category headings and the entrance wordmark—uses regular weight. Google's response for the same font family/style supplies a 22,504-byte Latin file instead of the 58,152-byte variable file. The heading typeface and selected weight remain the same.
2. Request Noto Sans Arabic as one variable face rather than four repeated static-weight declarations. The actual Google font response uses exactly the same five WOFF2 URLs for both requests; its raw CSS falls from 20 faces / 19,744 bytes to five faces / 4,956 bytes. The 400, 500, 600 and 700 weights remain available.
3. Disable the Arabic font's unconditional preload in the shared locale layout. English CSS never assigns this family; its Arabic language-switch label inherits the existing body/system fallback. Arabic documents still assign Noto Sans Arabic through their existing `html[lang=ar]` rules and load it when those glyphs are needed. This preserves the family but moves its Arabic discovery to CSS matching, which needs an Arabic timing/shift regression check.

The baseline transfers 248,880 font-file bytes before headers: Manrope 24,576 + Newsreader 58,152 + Noto Sans Arabic 166,152. The expected English initial font-file total is 47,080 bytes, a 201,800-byte reduction. This is an asset calculation, **not a measured new Lighthouse score or loading-time result**. The built manifest and browser network must confirm it after deployment.

## Investigation and verification

- Read the installed Next.js 16.3.5 font, loading and layout guidance and the installed Google font loader/validator.
- Fetched the production CSS and inspected font faces. The suspected Tailwind dependency scan problem was not found: generated utility rules are a small portion of the stylesheet; most rules are authored site CSS.
- Queried the Google Fonts CSS endpoint with the same modern browser user agent used by the installed loader. Compared URLs and measured Newsreader font-file bytes. Evidence copies are under `artifacts/2026-09-29/completion/`.
- The installed Next font validator accepts both new configurations. TypeScript `transpileModule` reports no layout syntax diagnostics. This is narrower than project typechecking.
- A full capped project typecheck failed with native `Fatal process out of memory: Zone`, without TypeScript diagnostics. A single capped Edge probe exited before producing evidence. No successful current browser, full typecheck or local build is claimed. No unrelated processes were terminated.
- Read-only live requests showed Brotli compression and no-store responses. The first home sample took approximately 1,501 ms to headers; subsequent home/product samples took 237–375 ms. This small warm/cold sample does not establish a server latency percentile.

## Rejected change: wrapping the whole site in Suspense

The installed Next guide explicitly explains that a same-segment `loading.tsx` cannot unblock data awaited in its layout. Wrapping the current data-dependent basket/site subtree in Suspense would stream the shell earlier, but an actual React 19 server-render fixture emitted the final catalogue inside a hidden segment and used an inline `$RC` script to reveal it. With JavaScript disabled, this would leave the real content hidden. The fixture is retained as `react-suspense-nojs-fixture.html`; that refactor was not applied. Publication reads remain request-scoped and fresh, with no new persistent cache.

## Required release checks

1. Run the normal cloud TypeScript/build checks on the integrated source.
2. Verify generated font assets: English has no Arabic font preload/request; Newsreader Latin is the regular file; Arabic still renders Noto at the required weights.
3. Repeat representative English/Arabic home and product checks at mobile and desktop widths. Check heading geometry, language switching, intro/replay/skip, no horizontal overflow, reduced motion, keyboard navigation, and no-JavaScript product content.
4. Run mobile Lighthouse against actual catalogue routes on the deployed candidate. Preserve reports, compare repeated samples and report the actual results. Retain any unresolved 90+ / LCP <2.5 s target explicitly; lab samples do not establish field INP or Core Web Vitals.

Example local commands, only when native memory is available:

```powershell
node --max-old-space-size=384 --v8-pool-size=1 node_modules/typescript/bin/tsc --noEmit
$env:CHROME_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node --max-old-space-size=384 --v8-pool-size=1 C:/Users/noura/AppData/Local/npm-cache/_npx/8003d8991b0d346b/node_modules/lighthouse/cli/index.js https://el-amal-sigma.vercel.app/en --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=artifacts/2026-09-29/completion/lighthouse-home-mobile.json --chrome-flags="--headless --disable-gpu --disable-extensions"
```

Use a fresh mobile run for `/ar`, `/en/products/cms-120` and `/ar/products/cms-120`; do not disable motion or block legitimate resources to produce acceptance scores. Visual acceptance remains Nour's.

## Deployed font verification

Release08e7cfb: fresh English homepage font transfer47,680bytes. Browser checks covered EN/AR home/products, 390px/1440px staff reports, no overflow/axe violations in checked rules, and a no-JavaScript Arabic product. Mobile lab samples: home91/product90 performance, LCP2.9s each, TBT210/230ms, CLS0, other categories100. These samples meet the90 score target; LCP<2.5s and field INP remain open. See ignored completion Lighthouse JSONs. No simulation/resource blocking tricks were used.
