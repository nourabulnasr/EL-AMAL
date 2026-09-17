# Precision in steel foundation implementation plan

Nour selected direction 1 on 17 September 2026. Execute in the existing dedicated codex/el-amal-foundation branch. Scope of this increment: a locally reviewable bilingual catalogue preview, tested catalogue/basket rules and CMS schema groundwork. No live customer submissions, stock writes or publication.

## Design

Graphite (#171C20), steel (#606B73), porcelain (#F1F3F2), white (#FFFFFF), and provisional signal orange (#E98B43), expressed as OKLCH tokens. Newsreader for English display, Manrope for interface and Noto Sans Arabic for Arabic. Asymmetric headline/search beside an explicitly illustrative instrument study; pale product catalogue below. Authentic product photography will replace the illustration when supplied. No manufacturer identity, markings, ranges or certifications are invented.

## Tasks

- [ ] Establish pinned compatible Next.js/Payload/PostgreSQL packages, scripts, TypeScript and environment template. Keep CMS disconnected until explicit database and secret are supplied.
- [ ] Write executable tests for punctuation-normalised model search, Arabic search, category intersections, basket quantities and corrupt stored baskets. Observe failure; implement pure catalogue and basket modules.
- [ ] Write import-validation tests rejecting duplicate IDs, missing translations, unknown categories, invalid stock quantities and unreviewed publication. Implement validation without database writes.
- [ ] Implement /en and /ar homepage, catalogue, category, product and quote routes. Preserve route/query on language switch. Label fixtures globally; fixture mode remains unindexed and never implies real stock.
- [ ] Add CMS collection definitions for staff roles, categories, draft products and private SKUs. Enforce least privilege and forbid unreviewed publication. Do not expose unrestricted inventory writes.
- [ ] Verify tests, types, production build and browser journeys at mobile/desktop sizes, RTL, keyboard, no-JavaScript reading and basket persistence. Save screenshots for Nour's visual review.
- [ ] Document actual evidence and remaining database/assets/business dependencies, update memory and commit/push checkpoint.

Spec: docs/kickoff-2026-09-17.md. Follow-up increments remain RFQ persistence, private uploads, transactional inventory, jobs, complete content, reporting and deployment. Fixtures cannot substitute for the ten approved product records or T01–T14 acceptance.

## Execution checkpoint
Frontend routes, pure validation modules, tests and prepared CMS schemas are implemented. Test/type/build evidence and browser checks are recorded in verification-2026-09-17.md. CMS package installation and database verification remain incomplete. Full keyboard/no-JavaScript/accessibility/performance audit remains pending. This plan is not marked fully complete.
