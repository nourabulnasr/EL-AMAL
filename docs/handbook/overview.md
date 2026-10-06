# EL AMAL website delivery and administration handbook

Prepared for Nour Abulnasr and the EL AMAL team. Updated 6 October 2026.

This is the consolidated delivery record and operating manual for both nontechnical owners and technical maintainers. It explains what each part does, how it was implemented, why the approach was chosen, where administrators go, what is still inactive, and who must act before full launch. This revision updates the original 29 September handbook rather than leaving the latest state in a separate addendum only.

**The real website and catalogue are live. The complete customer quotation service is not yet operational.** The selected Precision Revealed hero is delivered, while real public submission/email and the existing-quotation upload journey still await activation prerequisites. The next chapter gives the current status by subcategory and the full-launch checklist. An old approximate 90% scope estimate is not a readiness certificate.

## How to use this handbook

- Nour or business owner: read Current delivery and the path to full launch first, especially the input register and acceptance checklist.
- Catalogue editor: use the catalogue publication and administration chapters for exact fields, images, specifications, review evidence and publication steps.
- Sales or warehouse: use the role matrix, enquiry procedures, stock examples, reports and troubleshooting guide. Follow only the procedures available to your role.
- Developer: use the release identities, backend/API/security chapters, environment names, verification scripts and recovery/deployment instructions. Distinguish the production branch from prepared quotation code.

Each status is supported by source or dated verification. A built feature is not necessarily enabled. Examples of stock or customer records are explanations, not real production data. Passwords, tokens, database connection strings and encryption keys are excluded from this document.

## Where to go

| Task | Address or location |
| --- | --- |
| English website | https://el-amal-sigma.vercel.app/en |
| Arabic website | https://el-amal-sigma.vercel.app/ar |
| Product catalogue | https://el-amal-sigma.vercel.app/en/products |
| Quote basket | https://el-amal-sigma.vercel.app/en/quote |
| Direct RFQ | https://el-amal-sigma.vercel.app/en/rfq |
| Existing quotation, after activation | /en/rfq#existing-quotation, or the Arabic equivalent; currently not production-active |
| Staff sign in and CMS | https://el-amal-sigma.vercel.app/admin |
| Stock operations | https://el-amal-sigma.vercel.app/staff/inventory |
| Demand reports | https://el-amal-sigma.vercel.app/staff/reports |
| Source repository | https://github.com/nourabulnasr/EL-AMAL |
| Production branch and application | codex/el-amal-foundation; 63acd5b |
| Continuation branch and combined application | codex/hero-review-and-quotation; c2e6262, followed by documentation updates |
| Local project | C:\Users\noura\OneDrive\Documents\ChatGPT\EL-AMAL 4 |

Replace /en with /ar for the corresponding Arabic public journey. Staff use the hosted HTTPS addresses, not a developer's localhost or sample-content preview. The same staff account and role checks apply across CMS, inventory and reporting. A visible link does not grant access.

## Scope and phase position

EL AMAL is a bilingual industrial instrument catalogue and enquiry platform. A published model may represent several possible configurations. An exact SKU identifies a supplied configuration, while a stock receipt records counted physical units. Publishing a model does not create stock or reserve anything.

The original plan used six implementation increments: foundation, catalogue slice, RFQ slice, stock slice, completion and release candidate. Later reports grouped work into six workstreams. We are in completion and release acceptance, with core construction substantially delivered and specific activation/content/operating gates open. These are two ways to organize one project, not twelve phases.

No public prices, checkout, payment processing, customer accounts, ERP integration, automated purchasing or AI engineering advice are included. A basket is a request-preparation tool. Oil and gas and general industry are the two implemented industry routes required by the later client brief; other industry pages from the original wider proposal require scope reconciliation. The original broader 10 MB upload allowance is not delivered: the tested quotation implementation supports three files of 2 MiB each.

## Delivery milestones

| Milestone | Delivered outcome |
| --- | --- |
| Foundation and first review link | Next.js/Payload, Neon databases and Vercel hosting; one stable client review address. |
| Client workflow requirements | Search by model/type/application, direct RFQ with model/range/quantity, industry pages and conditional business contact/WIKA evidence components. |
| Brand and entrance | Requested navy/white/orange, bilingual typography, approved loading entrance and mobile/motion safeguards. |
| 28 September catalogue publication | All 29 supplied main pages published as 151 actual model groups, with genuine images, bilingual specifications and manufacturer documents. |
| 29 September operations | Private inventory and reports, bounded encrypted photos, daily maintenance, crawl evidence and an isolated encrypted restore rehearsal. |
| Permission corrections | Owner-only unlock and private notification worker fields; later last-owner continuity and authentication/role concurrency safeguards. |
| 1 October prepared quotation extension | PDF/XLSX/photo existing-quotation workflow implemented separately; migration and public activation remain pending. |
| 6 October selected hero release | Precision Revealed, lighter-blue/motion refinements, smaller image, layout-shift correction and narrow security patches deployed. |
| 6 October final verification | Production 142-unit workflow and combined 152-unit workflow succeeded; homepage lab performance mobile 95 / desktop 99, measured CLS 0. |

Git preserves code, migrations and this handbook. Neon contains the live records. Ignored original photographs, private settings and backup keys are separate assets. Neither this PDF nor a repository clone is a current database backup.
