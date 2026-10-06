# Precision Revealed release plan

**Goal:** Implement the client's approved second hero and restrained, lightweight motion; finish the existing-quotation release as far as authorized operational prerequisites allow.

**Spec:** Client selection in this conversation; `docs/design/2026-10-01/review-record.json` and the sculpture preview. Preserve the selected composition and existing bilingual catalogue, SEO and private access boundaries.

**Architecture:** Server-rendered hero and optimized image through next/image. A small client component handles desktop pointer depth and pause; CSS scroll timelines provide progressive enhancement without a new animation dependency. Existing quotation code remains in its tested branch until hosted schema changes are safely released.

**Four layers:** subject—exploded instrument sculpture; light—navy with steel-blue reflections and existing amber; framing—monumental diagonal subject beside editorial type; emotion—technical confidence and a clear route to the catalogue.

## Constraints and decisions

- Approved illustration is conceptual, not an accurate WIKA engineering diagram. Label it accordingly.
- No new runtime dependencies, autoplay video, scroll hijacking or WebGL download.
- Mobile shows a static composition; reduced motion disables decorative transforms and transitions.
- English and Arabic receive usable server-rendered headings and links, with mirrored composition, keyboard focus and no hidden essential content.
- Image source target under 250 KB; responsive Next image delivery; do not defer the hero image behind JavaScript.
- Work in the existing feature checkout. Keep production release independent if quotation database approval remains pending.
- User has already authorized implementation and deployment; no repeat design approval gate.
- Full private database export was previously rejected by automatic approval review. Await the specific pending authorization before exporting or applying the hosted quotation migration. Sender/worker setup cannot be replaced by flags.

## Tasks and verification

1. Build `precision-hero.tsx`, `precision-depth.tsx` and scoped CSS; replace the home hero. Optimize the approved asset, preserve provenance. No unit tests for reversible styling that merely mirror CSS; use rendered route, responsive and accessibility checks.
2. Add an actual built-server home regression for EN/AR heading, image, catalogue destination and removal of the old hero search. Run existing unit and TypeScript checks, then full cloud CI build/database checks.
3. Inspect hosted desktop/mobile-equivalent layout, Arabic, links, motion pause, reduced-motion implementation and errors. Record evidence and limits; use one fresh final code review per executing-plans guidance.
4. If authorized, make the encrypted backup at the approved destination, rehearse restore, then apply the additive quotation migration. Otherwise release only the independent hero changes after verification, leaving the tested quotation feature safely pending.
5. Verify the production source/deployment, update progress and remaining client inputs, commit and push.

## Progress / rulings

- Baseline: `322dbef` on `codex/hero-review-and-quotation`, clean; production application `469ab5d`. Existing quotation checks already verified in full cloud CI at `975fc3b`.
- Ruling: reuse the selected concept render as an optimized image with input-driven depth. An accurate live 3D model does not exist, and a full 3D engine would spend the user's mobile performance budget without adding useful catalogue functionality.
- Ruling: hero's secondary link goes to the real bilingual RFQ route, which offers existing quotations once that release is live; it never targets a nonexistent section on the current production release.
- Implementation complete: approved sculpture optimized to70,360 bytes; server-rendered bilingual hero, desktop pointer depth/pause, native scroll compression and product crop reveal. No new runtime dependencies.
- Fresh final review identified keyboard focus clipping on the product crop. Reproduced in browser and fixed (`clip-path` changed from `inset(8% 0px)` to `none` on actual keyboard focus). Made hero hover contrast independent of stylesheet ordering. Tightened short-screen spacing after visual inspection.
- Review branch3dc08cd:152 units, TypeScript and full cloud run37483572520 succeeded. Independent production candidatea1b1179:142 units, TypeScript and full cloud run37483948530 succeeded. Production branch run37484323691 also succeeded. Live deployment verification recorded in docs/precision-release-2026-10-06.md.
- Dependency gate found source-map-js1.2.1 advisory; patched only that compatible lockfile entry to1.2.2, audit clear. No gate disabled.
- Quotation release remains gated on explicit private backup destination authorization and real sender/frequent-worker setup. Temporary Vercel discovery login cancelled; credentials expired, no integration provisioned. Monitoring still deferred.

- Final verification:63acd5b deployed and confirmed; mobile95/desktop99, CLS0, LCP2.4s/0.7s. Combined quotationc2e6262 full CI37486837237 succeeded. Tasks1–3 and5 complete; task4 requires the explicit private-data backup authorization and actual sender/worker setup. No new development acceptance or award/ranking claim is inferred.
