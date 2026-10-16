# Interactive products and complementary discovery

Nour requested three cursor-interactive homepage products, complementary suggestions instead of similar models, and catalogue search on product pages. Nour selected **sculpted, simplified 3D illustrations**, with real photography retained. Nour subsequently approved this candidate. It is now live; the [17 October production report](product-experience-release-2026-10-17.md) records deployment, fresh measurements and client handover. The original candidate evidence below is retained as dated history.

## Design and operation

The focal subjects remain the 232.50/233.50 pressure gauge, IV2 valve and model 55 process thermometer. Metallic surfaces use restrained cool studio lighting on the existing navy background. The asymmetric gallery, white typography, lighter blue and orange details remain. Direct manipulation gives a sense of material and depth without an automatic spinning animation.

Each photo has an **Explore in 3D** control. Opening it downloads the optional Three.js chunk, creates one model and makes drag, arrow-key rotation, rotation buttons and reset available. **Actual photo** restores the photograph. Opening another product disposes the previous viewer. Simplified geometry is visibly labelled as illustrative: it is not manufacturer CAD, a technical drawing, a live measurement or a promise of an exact supplied configuration.

No 3D engine or GPU context is requested during the initial page load. One viewer is active at a time; rendering stops at rest, offscreen and in hidden tabs. Resolution is capped at 1.5 device pixels. Reduced-motion preference removes spring interpolation. Touch dragging is horizontal so vertical page scrolling remains available. WebGL failure keeps the real photograph and a readable explanation. Real product links, image alternatives and server-rendered content remain available without the enhancement.

## Suggestions

Suggestions now come from reviewed WIKA model-role pairs, not broad same-category similarity. Examples include pressure instruments with isolation/protection accessories, differential instruments with differential manifolds, temperature sensors with appropriate transmitter families, and specifically documented TC82 and T38 accessories. Every card explains its role; the section asks customers to confirm connections, range, materials and electrical configuration.

Daily variation stays inside those reviewed candidate pools. The selector avoids the current model, duplicate IDs/models and unrelated manufacturers, caps results at three, favours different complementary functions and ensures a gauge appears on relevant valve/accessory pages when one is available. Unknown models do not gain invented pairings. In the current 165-group catalogue, 94 groups have reviewed companions. Model 55 and TG53 have no standalone thermowell available here, so their section is omitted. Newly imported models need association review.

Existing analytics retain the stored `related` context so historical measurements stay usable. The staff filter now says **Suggestions**. Clicking 3D controls does not count as opening a product.

Manufacturer references used in the association review: [IV2](https://www.wika.com/en-en/iv2.WIKA), [IV3/IV5](https://www.wika.com/en-en/iv3_iv5.WIKA), [T16](https://www.wika.com/en-en/t16.WIKA), [T38](https://www.wika.com/en-en/t38.WIKA), [TC82](https://www.wika.com/en-en/tc82.WIKA), [910.12](https://www.wika.com/en-en/910_12.WIKA), plus the supplied publication specifications. These references establish complementary functions, not configuration-level compatibility.

## Product-page search

A visible, labelled search form sits immediately after the breadcrumbs in both languages. It submits a native GET request to the existing localized catalogue `q` search, works before hydration, supports Enter and the mobile Search key, and uses 48px controls and visible focus. It adds no client JavaScript. Specifications, product image sizes, metadata, canonical URLs and indexing rules are unchanged.

## Verification and release boundary

Local TypeScript succeeded. Existing plus updated recommendation tests succeeded, and three geometry tests confirm finite vertices, genuine depth, bounded dimensions and fewer than 60,000 triangles per model. Dependency installation reported zero known advisories. Independent code review found and resolved focus clipping in the scroll reveal and a desktop CSS specificity risk.

Local desktop browser checks observed a rendered gauge and IV2, working drag/button rotation, and a single canvas when switching products. The browser subsequently became unavailable and the development server was stopped to free laptop memory. A final local unit rerun also encountered native memory failures in three unrelated test files; these are not counted as successful local results.

The exact combined candidate `10120d8bccf51487c20aa6c98498c81703b68726` subsequently completed the entire cloud quality run [38963072645](https://github.com/nourabulnasr/EL-AMAL/actions/runs/38963072645): units/permission checks, TypeScript, dependency advisory gate, disposable PostgreSQL migrations and business/security regressions, production build and built CMS routes. Vercel deployment `NbvaHWoAWeyaYM6f3kE4hU7fJNWY` / GitHub deployment `7128929033` succeeded.

Review: [English](https://el-amal-bmfubrbwn-nour-abulnasrs-projects.vercel.app/en) and [Arabic](https://el-amal-bmfubrbwn-nour-abulnasrs-projects.vercel.app/ar). This is the existing isolated development catalogue; its IDs differ from production, indexing and public intake remain disabled.

The recovered browser verified the deployed version:

- All three sculptures render; thermometer responds to arrow-key rotation; gauge/valve support rotation controls and cursor drag.
- Only one canvas remains when switching models. Returning to Actual photo removes the final canvas.
- English detail search submitted `IV2` and reached one matching result. Arabic detail search submitted `232.50` and reached one matching result while retaining `/ar`.
- Gauge page showed an isolation valve, snubber and syphon. IV2 page showed a pressure gauge first, with two other pressure instruments. Both-language section labels, explanations and links were observed.
- Arabic phone layouts at 390px and 320px showed the controls without horizontal overflow. The 320px page had a 305px document content width inside a 320px viewport with scrollbar.
- No browser console errors were observed on the deployed preview during the sculpture checks.

Screenshots are in `artifacts/2026-10-16/product-experience/`: `3d-gauge-desktop.png`, `search-ar-mobile.png`, `3d-ar-mobile.png`. Saved mobile search screenshot was reopened for inspection. Temporary viewport override was reset, and the review tab was left open.

No fresh Lighthouse, field Core Web Vitals, physical touch-device test or forced GPU-context-loss test is claimed. Reduced-motion and failure cleanup were reviewed in code. Nour retains visual approval.

No production database, stock, customer records, email configuration or indexing settings changed. That original preview boundary is superseded by Nour's approval and the verified production release linked above.
