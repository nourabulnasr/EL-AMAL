# Precision Revealed — 6 October 2026

The client chose the second concept. The home page replaces the original gauge and search box with the approved sculptural instrument illustration. Catalogue search remains on the products page. The illustration is explicitly labelled as a concept, not a manufacturer product diagram.

## What changed

- English and Arabic hero, asymmetric headline, pale-blue emphasis, existing orange primary action and a direct quotation link. Arabic mirrors the artwork and reading order.
- Desktop pointer depth uses a small event-driven component and a spring-shaped CSS transition. It schedules at most one pending frame per pointer event; there is no continuous render loop.
- Supported desktop browsers gently compress the scene during scroll. Product imagery has a restrained crop reveal; keyboard focus disables that crop so the full focus outline remains visible.
- Existing hover responses, section settling and page progress are retained. No new runtime dependency, video or WebGL engine was added.
- Mobile uses a static composition. Reduced-motion rules disable decorative transitions and transforms. Desktop has a working pause control. Unsupported scroll-timeline browsers retain static content.
- Hero text and actions are server rendered. The 1,680,432-byte concept PNG was converted to a 70,360-byte WebP without changing its composition (95.8% smaller). Next Image supplies responsive versions with eager, high-priority loading. This size reduction is an asset measurement, not a Lighthouse or field-speed claim.
- Fixed source-map-js 1.2.1 → 1.2.2 after the CI advisory gate identified [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). No broad dependency upgrade or security gate bypass.
- The next gate identified the newly published [Sharp/librsvg advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w). Patched Sharp0.35.4 →0.35.5 and its bundled platform binaries;142 local tests succeeded and the installation audit returned zero findings. Cloud verification follows the patch.

## Verification

- Combined review branch `3dc08cd`: 152 unit tests and TypeScript succeeded; full GitHub run [37483572520](https://github.com/nourabulnasr/EL-AMAL/actions/runs/37483572520) succeeded, including disposable PostgreSQL migrations, stock/report/admin/quotation regressions, production build and built-server route checks.
- Independent production candidate `a1b1179`: 142 unit tests and TypeScript succeeded locally. It excludes the unpublished quotation schema and backend changes. Full independent CI and live deployment verification are recorded below when complete.
- Browser: desktop English, 390px English and Arabic, no horizontal overflow in checked mobile views, correct Arabic direction and mirrored art, image loaded, pause toggles to enabled/disabled, no errors/warnings in the inspected preview.
- Fresh code review found one important focus-outline issue. Reproduced on the first preview: focused image link retained `clip-path: inset(8% 0px)`. Fixed preview returned `clip-path: none` with its visible outline and 4px offset. CTA hover specificity was strengthened independently of CSS chunk ordering.
- Short-screen desktop spacing was tightened after preview inspection so the catalogue action is easier to reach.
- Reduced-motion behavior has source review; actual OS-preference/device testing and refreshed mobile Lighthouse/field Core Web Vitals are not claimed complete.
- First fresh [PageSpeed report](https://pagespeed.web.dev/analysis/https-el-amal-sigma-vercel-app-en/yh4u9oco6v?form_factor=mobile): mobile85, LCP2.3s, TBT80ms, CLS0.261; desktop100, LCP0.4s, TBT20ms, CLS0. Accessibility, best practices and basic SEO scored100 on both. No field data was available. The report identified the footer as the layout-shift culprit. A public HTML stream confirmed the route-loading placeholder/footer precede the hidden streamed home segment; its48svh fallback was too short. Changed only the fallback's reserved space to100svh, retaining navigation feedback and the approved intro. Re-measure after release; this is not a claim of fixed CLS yet.
- Visual acceptance belongs to Nour/client. The concept selection is approved; this implementation has been inspected by the agent, not represented as new client acceptance.

## Existing quotation uploads

PDF, XLSX, JPEG and PNG submission is implemented on `codex/hero-review-and-quotation` and passed the full combined cloud workflow above. It includes email proof, private encrypted document storage, bounded file validation, authenticated staff downloads, lost-response recovery and explicit final submission without re-entering product lines. Raw PDF/XLSX files remain unscanned and are not previewed or executed. See `docs/customer-intake.md` on that branch.

It is **not receiving real customer files yet**. Release prerequisites remain:

1. Explicit authorization of the full encrypted production backup destination requested this turn: `artifacts/backups/el-amal-2026-10-06-pre-quotation.enc` (and its encrypted manifest), with key separately outside the synced project. Earlier automatic approval review rejected that export because private-data destination consent was missing. No workaround export or hosted quotation migration was performed.
2. Verified sender domain/service and healthy frequent notification worker. The receiving inbox is already confirmed; an iCloud receiving address does not provide sender-domain verification. Vercel CLI discovery encountered expired/missing credentials; its temporary login attempt was cancelled. No terms were accepted and no paid provider was selected.
3. After those prerequisites: hosted additive schema migration, production configuration and a real authorized email/upload/staff-retrieval check before enabling public intake.

Checkly monitoring remains deferred at Nour's request. Hero release proceeds independently. Remaining business/domain/Search Console/stock/policy inputs remain in `docs/final-client-inputs.md`; hero choice is no longer pending.

## Release record

Hero releasea1b1179 is live through `https://el-amal-nw9o7fz6l-nour-abulnasrs-projects.vercel.app` and the stable client alias. Production branch CI37484323691 succeeded. Eleven live route/header checks, EN/AR home metadata/schema/real products and the70,360-byte image succeeded. RFQ deliberately remains noindex; private SKU/attachment APIs returned403 and public intake readiness returnedfalse. Browser confirmed the deployed desktop hero with the primary CTA inside the720px viewport. The loading-space/security follow-up63acd5b is awaiting full CI/deployment verification. Do not promote the sample-data preview; production must rebuild with the existing production environment.
