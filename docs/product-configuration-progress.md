# Product configuration work — 1 November 2026

User approved implementation of pressure and temperature configuration choices, dependent size/range/connection, diaphragm applicability, bilingual basket/admin/email persistence and separate configuration lines.

Implemented and technically checked. Cloud preview built successfully. Awaiting Nour's visual approval before production publication.

## Implemented

- Bilingual model, dial/case size, pressure/temperature scale with its unit, and process connection selectors.
- Dependent model/size choices and cleared downstream selections. Single supported choices appear as fixed specifications. Mounting direction is separate from thread size; conflicting model/mounting selections are rejected client/server.
- Connection fields across all 42 existing dial-instrument catalogue groups, including paired differential connections, compression sizes, and diaphragm flange DN choices. Dial diameter and process flange dimensions are distinct.
- The same product in different configurations remains separate in the saved basket. Quantity and removal identify the full configuration. Stale selections block submission and can be reset explicitly.
- Customer review shows the chosen specification summary. Trusted server data creates an immutable bounded bilingual snapshot in the existing 160-character range field; no schema migration or production data rewrite.
- Owner notification reads this saved snapshot; the protected admin and staff inventory views retain it. Request retries keep their original snapshots after catalogue changes.
- Operating-temperature limits, sensor autorange intervals and switch setting envelopes are intentionally not turned into orderable dial scales. They remain technical specifications. Manufacturer order codes are not fabricated.

## Manufacturer evidence and scope

Reviewed the linked official WIKA datasheets on 1 November 2026. Main full standard tables: PM01.01 (111), PM02.02 (232/233.50), PM04.03 (diaphragm .30/.50), TM55.01 (55), TM53.02 (TG53). Additional standard ranges: PM02.01 (212.20), PM02.06 (213.40), PM01.08 (113.53), PM02.12 (213.53), TV25.01 (TGS55), TV28.01 (70 with contacts).

Additional connection sources: PM04.02, PM04.07, PM07.02, PM07.14, PM07.20; PV11.03, PV12.03/.04, PV14.03/.07, PV15.02, PV16.06, PV17.05/.13/.19, PV21.02/.04, PV22.01/.02/.03, PV24.03/.07, PV25.02, PV26.06, PV27.05/.13/.20/.22; TV25.01, TV27.01, TV28.01/.02/.03. Exact official document links remain in each product's existing catalogue datasheets. These are selected verified catalogue choices, not a reproduction of every special WIKA configurator option. Generic scale menus preserve explicitly documented endpoints only; unlisted intermediate values and on-request configurations are not inferred. The team must still assess application suitability and commercial availability.

## Verification

- Final full test run: 288 tests succeeded, zero failures. Includes real-catalogue coverage, saved configuration identity, stale/forged selections, owner notification and existing website regressions.
- Real catalogue regression: all 42 dial families expose sizes and connection choices, valid sample snapshots fit 160 characters. This checks implementation coverage, not independent certification of every manufacturer combination.
- TypeScript check succeeded after the final selector reset change.
- Actual isolated development PostgreSQL regression succeeded: configured sizes, ranges, units, threads and quantities persisted, appeared in staff data, and reached the locally captured owner notification. Retry, forged-choice rejection and immutable history checks succeeded. Disposable schema removed; no external messages sent.
- Cloud optimized build succeeded for commit2727ace: deployment dpl_3mwp1NSBQfL9Ld1nYZFmNSZ9m6fs, build2m18s, Preview Ready. Local build had compiled before Windows paging-file exhaustion stopped its TypeScript worker; the cloud build verified the committed source independently of unrelated local edits.
- Local browser review subsequently succeeded after running one server without a concurrent build: actual development catalogue, customer submissions disabled. Checked EN232.50 configurations63mm/0–10bar/G¼ and100mm/0–16bar/G½ as separate lines, quantities and refresh persistence, dependent resets and review summary. Checked AR55 at390px with100mm/0–120°C/G½, Arabic basket, keyboard focus retention during changes, and repairing a stale TGS55 fixed-size choice. Corrected numeric direction in Arabic selectors.
- Screenshots: artifacts/configuration-pressure-en.png, artifacts/configuration-review-en.png, artifacts/configuration-temperature-ar-mobile.png. Local review server: http://127.0.0.1:3014. Review helper explicitly enables the development catalogue and disables public submissions.
- Protected cloud HTML was fetched successfully using authenticated Vercel curl. No environment credentials were exported. Automatic approval review rejected a broader development-env export; the safer authenticated curl flow was used instead.

## Remaining release steps

1. Final cloud preview build for the last Arabic direction, copy and review-helper adjustments.
2. Nour's visual approval, required by the supplied AGENTS.md approval discipline ("WAIT for Nour's approval"), then production release and smoke checks.

Review preview: https://el-amal-git-codex-hero-review-an-09f530-nour-abulnasrs-projects.vercel.app/en/products/cms-167 (Vercel sign-in required). This stable branch URL follows the latest successful preview; it is not the production website.

Existing unrelated dirty dependency/security/analytics/staff edits must be preserved and excluded from this milestone unless separately reviewed. Current branch codex/hero-review-and-quotation.
