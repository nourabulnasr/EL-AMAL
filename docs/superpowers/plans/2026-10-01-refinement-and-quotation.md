# Website refinement and quotation documents implementation plan

> **For agentic workers:** Use executing-plans or subagent-driven-development for implementation and verification. Root owns visual previews, palette, release and documentation; the quotation worker owns the document workflow; the dependency worker owns the package patch.

**Goal:** Give Nour three visible hero alternatives without replacing the live hero, introduce a secondary blue and accessible motion, fix the current security advisory, and let a customer start with an existing quotation document.

**Architecture:** Isolate hero concepts in `docs/design/2026-10-01` with a local-only preview server. Apply shared public-site CSS independently. Extend the existing encrypted, verified-enquiry system for document requests rather than adding artificial catalogue rows or public file URLs.

**Tech stack:** Next.js App Router, Payload/Postgres, TypeScript, native CSS/SVG, existing Motion where already installed.

**Spec:** User request dated 1 October 2026: three hero proposals inspired by the provided studio directory, no hero implementation before selection; lighter blue alongside navy/white/orange; more motion; PDF, Excel and photo quotations; continue independent work.

## Global constraints

- Keep existing production hero until Nour chooses a direction. Generated images are concept art, not manufacturer specifications or EL AMAL premises.
- Preserve navy #010736 and #091540, white copy and the existing warm accent. Add steel blue #365F94 and pale blue #A9D5F3 with adequate text contrast.
- Respect reduced motion, keyboard navigation and touch; do not add an animation framework or scroll hijacking.
- Never claim perfect security, a guaranteed ranking, fabricated imagery authenticity or antivirus scanning that is not present.
- File intake must preserve the existing live email readiness gates, private access, quotas and retention. PDFs and spreadsheets are untrusted documents.
- No provider purchases, terms acceptance or changes to deferred uptime monitoring.

## Review focus

- Mobile/Arabic text remains readable and can wrap; hover cannot be required to discover an action.
- Reduced-motion and browsers without scroll timelines retain all content and functions.
- Document requests without product rows do not break inventory/reporting or send notifications before a file exists.
- Wrong MIME, oversized files, compressed archives and active document content must not become trusted files.
- Production checks distinguish local implementation, deployed code and externally disabled intake.

## Task 1: Separate hero concepts

Files: `docs/design/2026-10-01/index.html`, `preview.css`, `preview.js`, `serve.mjs`, concept assets and screenshots.

- [x] Create three original directions: cinematic industrial, sculptural assembly, vector flow.
- [x] Show exact conceptual limitations and original research references.
- [x] Open the review and capture all three desktop alternatives.
- [x] Check phone layout, pause control and one scroll transition. Save observations.
- [ ] Record Nour's selection before any live hero replacement.

## Task 2: Secondary palette and motion

Files: `src/app/(site)/[locale]/refinement.css`; import after `styles.css` in the locale layout.

- [x] Define steel and ice-blue tokens; retain existing orange and readable white copy.
- [x] Apply surfaces to approach, information/contact sections and catalogue controls; preserve product photos and current hero.
- [x] Add modest native scroll-timeline section movement and reading progress with reduced-motion/no-support fallbacks.
- [x] Verify desktop and Arabic/mobile layout, contrast, focus styling and current CSS build. Broader assistive-technology acceptance remains open.

CSS direction:

```css
.approach, .information-contact { background: var(--blue-steel); }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .section-heading { animation: section-settle linear both; animation-timeline: view(); animation-range: entry 0% cover 20%; }
  }
}
```

## Task 3: Security patch

Files: package manifest and lock only.

- [x] Verify official September 30 advisory and compatible Next.js fix.
- [x] Install exact supported patch, fetch a genuinely online audit (not forced-offline empty output).
- [x] Run the existing tests and typecheck, then production build. Cloud CI succeeded; local large checks hit memory limits.
- [x] Verify the production deployment through the connected GitHub integration.

## Task 4: Existing quotation workflow

Files: enquiry parser/service, collections/types/migration, attachment pipeline, bilingual submission/upload UI and RFQ links; focused tests accompany each trust boundary.

- [x] Add an explicit document enquiry type with contact details and zero product rows; preserve normal RFQ validation.
- [x] Reuse email verification and signed upload grant; reject upload before genuine verification.
- [x] Store bounded files privately with deterministic safe filenames, expiry, quotas and no inline rendering. Validate PDF/XLSX/photo formats without claiming malware clearance.
- [x] Finalize a request only after a valid attachment exists; queue one staff notification idempotently.
- [x] Exercise format spoofing, size/decompression limits, unauthorized/expired downloads, transaction retries and zero-item stock exclusion. Product demand remains item-based.
- [x] Document activation dependencies and scanner limitations separately from code completion.

## Delivery

- [x] Review changes and run focused checks locally, with the complete build/database/type suite on isolated GitHub CI after local memory exhaustion.
- [x] Update PROGRESS.md and the dated design/feature notes; commit only intended files and push the current branch.
- [x] Deploy the tested security/palette release and verify the stable alias; keep hero previews outside the application.
- [ ] Deploy the quotation migration/application after the requested encrypted-backup destination authorization. Real email activation remains separately gated.
- [ ] Report exact deliverables, remaining activation needs and the hero selection separately.
