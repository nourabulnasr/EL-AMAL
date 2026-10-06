## Remaining work and ownership

The current subcategory status, exact Nour/client input register, developer responsibilities and full-launch acceptance checklist are at the start of this consolidated handbook. They are the authoritative remaining-work list for 6 October 2026. The client has already supplied the catalogue and recipient, selected Precision Revealed and requested PDF/Excel/photo quotations; do not ask for those decisions again.

Public quotation and email activation still need explicit approval of the named encrypted database-backup destination, a verified sending identity and authorized frequent scheduling. Engineering owns the backup/migration/configuration and real end-to-end checks after those dependencies are available. Business facts, WIKA evidence, strong staff credentials, privacy/backup policies, Search Console/domain ownership, exact stock data if commitments are enabled, and final client acceptance remain owner inputs.

Broader device/accessibility and representative performance verification remain engineering work. Automatic malware scanning, larger files, visitor analytics, application MFA and extra industry content are not delivered features; agree any expanded requirements explicitly. External monitoring remains deferred at Nour's request. No account terms, paid service or private-data export is authorized merely by updating this handbook.

Full readiness is closure of the stated launch criteria, not a promise of a top-ten award, perfect security or instant search ranking. Maintain useful technical content, measured usability, dependency/access reviews and tested recovery during operation.

## Operator routines

### At the start of a working day

1. Open the stable public site and check that the catalogue and a representative product load.
2. Sign in through /admin with your own staff account. Use the role assigned to your job.
3. Sales reviews new or changed enquiries once real intake is activated. An empty report before activation is expected.
4. Warehouse staff review held, blocked and expired stock through /staff/inventory. Compare physical counts when policy requires it.
5. The owner reviews delivery operations once mail is active. Successful daily maintenance alone does not prove customer email delivery.

### When publishing a catalogue change

1. Keep the manufacturer's model identity and documentary source together.
2. Review both languages, application classification, image path, specification rows and downloads before publication.
3. Save the permitted CMS fields and resolve publication validation errors rather than bypassing them.
4. Open the public English and Arabic product pages using the site's own links. Confirm the image, table, availability date and technical document destination.
5. Check a model search and the relevant category. If the change affects canonical URLs or categories, run the SEO checks for those routes.

### When recording stock

1. Identify the exact existing SKU. Do not use a generic product family where range, connection or material differs.
2. Choose the correct operation and enter a meaningful reference or reason. Receipts add units; dispatch consumes a reservation and removes physical units; release only returns held units to availability.
3. Check the result before repeating a request. The service prevents the same request from moving stock twice, but a newly created request is a new instruction.
4. Investigate physical discrepancies and record a justified adjustment. A count confirmation is not a substitute for an adjustment.
5. Preserve the audit history. Posted ledger entries are not edited to hide a mistake; corrections are additional explained events.

### At each release

The developer reviews the diff, migration implications, tests and package advisories, then verifies the actual deployed pages and private boundaries. A build marked Ready is not sufficient. The project previously detected a build that succeeded but failed at runtime, rolled it back and added actual server startup checks. Keep a known working deployment available for recovery.

### Periodically

Review who has access, test restore procedures in an isolated database, inspect backup age, review error and mail health, check broken manufacturer links, recheck measured performance and assess new dependency advisories. The exact business schedule and responsibility should be agreed with the owner; an automated timetable is not claimed where no service has been configured.

## Troubleshooting by symptom

| Symptom | Likely meaning | Safe next action |
| --- | --- | --- |
| Admin says credentials are incorrect | Wrong identity or password, lockout, or account state | Confirm the staff email, wait for any lockout window, then contact the owner. Do not share the password in chat. Recovery email is unavailable until activated. |
| Staff page redirects to login | Session expired or missing | Sign in again at /admin and return to the staff URL. |
| Staff page or API refuses access | Current role does not permit that operation | Ask the owner to review role assignment; do not bypass the endpoint. |
| Product cannot be published | Required bilingual content or review gate is incomplete | Review the CMS validation message and the publication checklist. |
| Image fails after editing details | Image path does not match a deployed public asset | Use a verified repository asset path and ask the developer to add new files. There is no general Media upload collection. |
| Customer cannot submit an RFQ | Public intake is deliberately disabled or readiness has failed | Check sender, worker health and intake configuration. Do not tell the customer a request was received if it was not saved. |
| No email arrives | Sender or worker is not active, or queue/provider failure | Owner inspects the correct queue and delivery operations. Do not reset immutable enquiry snapshots. |
| Photo upload is unavailable | Verification is incomplete, capability expired, flag is off or limits were exceeded | Complete the supported verified journey after mail activation; check file type, size and count. |
| Cannot reserve stock | No exact SKU, insufficient available units, stale count, unauthorized role or ineligible enquiry | Read the refusal and correct the underlying record or policy. Model labels do not prove counted availability. |
| Demand report is empty | No matching persisted enquiries for selected dates and cohort | Check Cairo date boundaries and filters. It is not a website traffic report. |
| Google does not show a page | Technical indexability does not guarantee indexing | Verify the canonical URL and Search Console once property access is configured. |
| Client sees a regression after deployment | Code, configuration, migration or runtime problem | Capture URL and time without secrets; verify runtime logs and use the known working deployment while investigating. |

## Source ownership and continuation

The project is saved in C:\Users\noura\OneDrive\Documents\ChatGPT\EL-AMAL 4 and the EL-AMAL GitHub repository. Production source is `codex/el-amal-foundation` at `63acd5b`; continuation uses `codex/hero-review-and-quotation` with combined application `c2e6262` and later documentation commits. Source, migrations, tests and this handbook are versioned. Live database contents, credentials, ignored originals and operational artifacts are separate assets.

A new assistant or developer should read AGENTS.md, PROGRESS.md, docs/phase-status.md, this handbook and the current Git diff before acting. Do not restart the catalogue extraction. Do not ask again for the receiving inbox or the supplied 29 pages. Keep production and development database connections separate and never run development mutation checks against production.

Signing in to another ChatGPT account does not itself move or back up the database. Access from another device depends on an already configured host connection or a checked out repository with securely supplied environment settings. An unrelated cloud chat does not automatically have this laptop's local files. No automatic resume task is scheduled by this handbook.

## Glossary

| Term | Plain meaning |
| --- | --- |
| CMS | The private content management system where staff edit permitted records. |
| Model or family | A manufacturer's product identity, which may include several possible configurations. |
| SKU | One exact supplied configuration that can be counted in inventory. |
| RFQ | Request for quotation, describing what a customer wants before price and supply are agreed. |
| Ledger | The append only history of stock movements and reviews. |
| Reservation or hold | Units temporarily allocated to an eligible request without leaving the warehouse. |
| Blocked stock | Physical units excluded from availability, for example while a staff review is needed. |
| Outbox | A database queue that preserves a message until a worker can send or conclusively fail it. |
| Idempotency | Repeating the same operation identifier and input does not apply the action twice. |
| Transaction | Several database changes succeed together or are rolled back together. |
| Migration | A versioned change to database structure that accompanies application changes. |
| Canonical URL | The preferred address declared for a page. |
| Hreflang | Links identifying the language alternatives of equivalent pages. |
| Structured data | Machine readable facts in a page, using Schema.org vocabulary. |
| Noindex | An instruction asking compliant search engines not to index a page; it is not authentication. |
| LCP | How long the largest visible content element takes to appear in the measured load. |
| CLS | The amount of unexpected visual movement during the measured page session. |
| INP | How responsive real interactions are over a page visit; it requires appropriate field evidence. |
| CI | Automated checks run when source changes are pushed. |
| Encryption key | A secret required to decrypt protected data; it must be stored separately from the backup. |

## Evidence and verification index

The current production release `63acd5b` passed 142 unit checks and complete cloud run `37486441262`. The prepared combined quotation release `c2e6262` passed 152 units and complete run `37486837237`. Both include TypeScript, an all-severity advisory gate, disposable database regressions, build and actual built-server checks. Production is `el-amal-3m6pheeed-nour-abulnasrs-projects.vercel.app`, on the stable client alias. This documentation revision did not rerun application tests or deploy code.

The 6 October read-only crawl covered 342 public pages, 342 sitemap URLs and 155 assets with zero issues detected by the implemented checks. Final 6 October English-homepage PageSpeed measured mobile 95 / desktop 99; mobile LCP 2.4s, TBT 60ms and CLS 0. Automated accessibility, best-practices and basic SEO checks scored 100 on both. September product performance 90 / LCP 2.9s is a historical sample, not a newly measured October result. There is no recorded real-user field dataset or field INP.

The encrypted restore rehearsal recovered 24 tables and 572 rows with matching row fingerprints and constraint count into a separate temporary development database. It was performed on the backup taken before the additive inventory completion migration. The temporary database was removed. Future recovery must apply the appropriate forward migrations before switching a replacement environment into service.

Current evidence is summarized in `docs/precision-release-2026-10-06.md` and `docs/operations-release-2026-10-06.md`, with source/test identifiers and the public PageSpeed report linked in the current readiness chapter. Scoped live artifacts are under ignored `artifacts/2026-10-06/launch/`; original crawl, restore and lab evidence remains under `artifacts/2026-09-29/`. Raw diagnostics and synthetic regression results are not a substitute for actual customer email and operational acceptance.

The source references in the preceding chapters are repository relative. Open them within the local project or at the matching Git commit. Configuration variable names are provided for developers; values and credentials are intentionally kept in private environment settings. This handbook contains no login password, database URL, API key or backup key.

## Technical references

The project code and recorded tests establish what EL AMAL actually does. These official references explain several of the underlying approaches; they do not certify this implementation.

- [Google guidance on canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) explains why consistent preferred addresses, internal links and sitemap entries help consolidate duplicate pages. A canonical declaration is a signal, not a guarantee that Google will select it.
- [Google guidance on language alternatives](https://developers.google.com/search/docs/specialty/international/localized-versions) explains the use of equivalent English and Arabic language links.
- [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds) explains the good experience thresholds of LCP at most 2.5 seconds, INP at most 200 milliseconds and CLS at most 0.1, evaluated at the 75th percentile of visits. A Lighthouse sample is not that field dataset.
- [OWASP authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) provides the security context for strong credentials, throttling, neutral login and recovery responses, and session controls. Independent penetration testing and broader authentication hardening remain separate from implementing those controls.
