# EL AMAL final refinements — 24 October 2026

> **Publication update, 25 October:** Nour subsequently requested publication. Commit 0562013 is now live with production settings. The review-only statements below describe the earlier checkpoint and are superseded by [the production release record](refinements-production-release-2026-10-25.md). The two dependency findings remain unresolved.

## What was ready for review

The English and Arabic implementation is committed as 6bb5bbfb07d4399fa5535892d816142701ac53d3 on codex/hero-review-and-quotation.

Review: https://el-amal-4wlh2baxg-nour-abulnasrs-projects.vercel.app/en (Vercel team sign-in required).

- Homepage: “In a world full of choices, choose EL-AMAL” and its Arabic translation use the existing progressive scroll reveal. Text remains server-rendered and readable without animation, with reduced-motion support.
- Home and About: a framed official WIKA distributor statement is paired with factual manufacturer/application information. The desktop layout has the statement on the left and supporting copy on the right; Arabic mirrors the reading order. No exclusivity or unprovided certifications are claimed.
- Pressure and Temperature: the former page-three product cohorts are prioritised on page one. Exact-model searches still take precedence, combined filters still apply, all products remain available, and the remaining order stays stable. Model identity rather than database IDs makes the behaviour consistent between preview and production.
- Product pages: complementary Suggestions have a prominent native expandable control beside the quotation controls. Keyboard operation needs no new JavaScript, and there is no interrupting timed popup. Compact suggestion photographs preserve room for details.
- Framework security updates: Next.js 16.4.3 and the DOMPurify package override at 3.4.17 are committed.

## Delivery endpoint hardening

An additional change bounds scheduler requests to 64 KiB before SDK parsing, rejects unsigned POSTs before reading their body, rejects compressed bodies, and counts actual streamed bytes even when Content-Length is absent or false. The SDK still verifies signatures. Raw bytes, URL and headers are preserved. This endpoint carries scheduled delivery metadata, not uploaded customer files; quotation upload limits are unchanged.

Eight focused tests succeeded on 24 October, including a valid HMAC-signed execution reaching a fake callback and a signed oversized request being rejected without another callback. No provider, production database, real staff account or customer email was involved. TypeScript completed with exit 0. Independent code review found no concrete defect in the request guard and requested the successful signed-request test, which is now included.

## Release evidence and limits

- Vercel built review commit 6bb5bbf successfully: deployment HPpfeLW4cv4H81ksAaeBCfZZqWLq.
- GitHub Actions run 40090215743 completed unit/permission tests and TypeScript, then failed the dependency advisory gate. Later database integration, build and runtime-regression steps in that workflow were skipped. Vercel's separate successful build is not a substitute for those skipped checks.
- The local full suite under Node 24 showed 232 successes and an asynchronous multipart-stream test failure. The cloud Node 22 unit job succeeded. The project deployment target remains Node 22; no runtime migration is part of this work.
- Hosted review access succeeded after sign-in. English Suggestions expanded by click, collapsed with native Return and reopened with Space. Arabic product pages were checked at 390px and 320px with no measured horizontal overflow; gauge-to-IV2 navigation and valve-to-pressure-instrument suggestions were confirmed. The Arabic homepage slogan and mirrored framed WIKA section were inspected. The About route includes the same panel; at 390px its panel and supporting copy stack without horizontal overflow. Pressure page one contains the exact 11 prioritised models followed by the existing order; Temperature page one contains all 24 requested models, with the same order after switching to Arabic. Evidence: artifacts/2026-10-24/suggestions-desktop.png, suggestions-ar-mobile.png and wika-ar-desktop.png. These are engineering observations, not owner visual acceptance. English About panel evidence is saved as artifacts/2026-10-24/wika-about-en.png. Exhaustive screen-reader/device checks are not claimed.
- Production remains the 17 October release, 41fd9dbffe55849cc2b1bfa5e851498198f26205. These refinements are not yet live. The isolated preview database and environment must never be promoted directly to production.

## Engineering work still required

1. Resolve Zod advisory GHSA-mrhx-c7xc-m3w5 in the Inngest dependency path. The installed SDK imports zod/v3; forcing a v4 package version does not demonstrate that the imported v3 parser is repaired. The new request cap reduces exposure but does not close the advisory. Keep the dependency gate enabled.
2. Resolve and verify the actual Monaco editor sanitiser loaded by Payload admin. Package overrides do not necessarily replace a vendored browser copy or the loader's CDN copy. Do not claim the runtime is patched solely from the npm dependency version.
3. Complete the remaining review checks: closed-panel analytics visibility and final release performance/accessibility measurements. Representative hosted EN/AR Suggestions, keyboard and mobile checks have succeeded; maintain their evidence rather than restarting them.
4. Run the remaining database/build/runtime quality checks on the final source, then release through the production branch with production settings and verify live routes, enquiry availability and worker health.
5. Record fresh performance/accessibility measurements for the final release. Historical scores are not new verification.

## Fresh production technical SEO audit

The read-only audit on 24 October checked all 372 eligible public URLs, the 372-entry sitemap, 169 image assets, robots/canonical/language/metadata/schema/link checks and private/missing-route guards: zero issues in its covered checks, exit 0. Both languages retained 165 product pages. Evidence: artifacts/2026-10-24/seo-live-audit.json. This measures the existing production release, not the unreleased preview, Google index membership, rankings or field Core Web Vitals.

## Work requiring Nour or the client

- Review the revised visual treatment. Vercel preview access has now succeeded; no further sign-in is currently requested.
- Provide approved company/CEO story, name/title and photograph.
- Supply public address and opening hours if they should appear; confirm whether the supplied phone supports WhatsApp.
- Complete the owner's real recovery and mailbox acceptance check.
- Decide long-term attachment capacity, malware scanning, privacy/retention and off-site backup arrangements. Checkly monitoring remains deferred by request.

The confirmed domain, logo, telephone, owner email, WIKA relationship and supplied products do not need to be supplied again. See final-client-inputs.md for the maintained action register and client-admin-guide.md for admin instructions.

Technical SEO makes pages eligible and understandable; Google controls indexing and ranking. No all-pages-indexed, guaranteed top ranking, zero-vulnerability or universal performance claim is made.
