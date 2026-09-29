# EL AMAL website delivery and administration handbook

Prepared for Nour Abulnasr and the EL AMAL team. Status date 29 September 2026.

This handbook explains what has been built, what the client can use today, how staff operate it, and what remains before full operational launch. It serves two readers: the business owner who needs clear instructions and the developer who needs implementation details, reasons and evidence. The current website is a bilingual industrial instrument catalogue and quotation platform. It is approximately 90 percent complete against the recorded scope; customer email activation and some operational work remain.

Use the public website to review the actual catalogue. Use the private administration, inventory and reporting tools with your staff account. A published catalogue entry describes a model or family; an exact SKU identifies a supplied configuration; a stock receipt records counted physical units. These are three separate records. Publishing a product does not create warehouse stock or promise a reservation.

The handbook records the release serving the client review address when it was prepared. Application commit 7f7326704305012e9637702b3112b5c85f554833 was deployed and verified; documentation checkpoint f751ef5 records its evidence. Historical project notes contain earlier counts and disabled features. The current state described here takes precedence over those historical checkpoints.

## How to use this handbook

- Business owner: start with Delivery status and Where to go, then read the public experience and the remaining work register.
- Catalogue editor: read Catalogue administration, including publication gates, source evidence and the distinction between model availability and SKU stock.
- Sales and warehouse staff: use the administration procedures, stock examples and troubleshooting instructions. Review the permissions table before assigning roles.
- Developer or successor: use the architecture, API, security, email, backup, deployment and verification chapters, then the source map and environment reference.

Each chapter explains the user benefit, the mechanism and its purpose. A statement that a feature is implemented does not mean its external service is activated. The remaining work register names who must supply information, who implements the work and how completion will be checked.

## Delivery status

The most recent estimate is 88 percent weighted completion, rounded to about 90 percent with roughly five percentage points of uncertainty. It measures completed scope. It is not a security score, an SEO score, a design award prediction or a promise of a delivery date. A critical unfinished capability can matter more operationally than its numerical share.

| Workstream | Weight | Estimated completion | Practical position |
| --- | --- | --- | --- |
| Foundation and hosting | 15% | 95% | Website, CMS, roles, separate databases and deployments work. Recovery delivery and staff onboarding remain. |
| Interface and motion | 20% | 90% | Bilingual responsive interface and approved entrance are built. Final brand content and broader acceptance remain. |
| Catalogue and content | 15% | 85% | All supplied catalogue groups are published. Exact configurations and final technical acceptance remain. |
| Enquiries and email | 20% | 80% | Private workflow and queues are implemented. Real submission and mail activation require sender and scheduler setup. |
| Inventory | 10% | 95% | Stock controls and audited operations are implemented. Real SKUs, counts, policy and training remain. |
| SEO security and release | 20% | 85% | Technical SEO, protection, reporting and restore evidence exist. Field performance, offsite backups and wider acceptance remain. |

The estimate above is the existing project estimate, not a new independent audit of every proposal line. The detailed remaining register also identifies original proposal items that have not become live features, including broader document uploads and visitor interaction analytics. No completion percentage should conceal those gaps.

### Live and usable today

The stable English and Arabic website includes the real catalogue, model search, filters, product information, genuine manufacturer images, specifications and technical document links. Visitors can build a quote basket and prepare a model and range request. Staff can sign in to the hosted CMS, manage permitted records, open the private stock console and view demand reports. The stock tools are available, although no exact production SKU definitions or opening quantities have been supplied.

Eligible public pages are technically indexable. The current sitemap and crawl checks cover 342 public pages. A successful technical crawl establishes that the tested pages and metadata are reachable and internally consistent; it does not establish that Google has indexed them or that they rank for a target query.

### Implemented but awaiting activation

Public enquiry submission, customer confirmation email, staff notification email and emailed staff password recovery remain disabled. The confirmed receiving inbox is mohamed.sorour8@icloud.com. A receiving address does not prove ownership of a sending domain. Sender verification, provider credentials and a sufficiently frequent delivery worker must be configured and tested before those switches are enabled.

Private customer photo handling is deployed and configured, but the normal customer must first complete email verification. That means the normal end to end customer photo journey is also waiting for mail activation. Internal development tests do not substitute for a real customer receipt and confirmation test.

### Work still requiring implementation or operational setup

Larger PDF and Excel uploads with independent scanning are not implemented. Current support is limited to three private JPEG or PNG photos of up to 2 MiB each. Automatic offsite backup scheduling is not active. Wider screen reader and device acceptance, sustained performance measurements and final operational acceptance remain. External uptime monitoring has been deliberately deferred by Nour and should not be repeatedly requested.

## Where to go

| Task | Address or location |
| --- | --- |
| English website | https://el-amal-sigma.vercel.app/en |
| Arabic website | https://el-amal-sigma.vercel.app/ar |
| Product catalogue | https://el-amal-sigma.vercel.app/en/products |
| Quote basket | https://el-amal-sigma.vercel.app/en/quote |
| Direct model request | https://el-amal-sigma.vercel.app/en/rfq |
| Staff sign in and CMS | https://el-amal-sigma.vercel.app/admin |
| Stock operations | https://el-amal-sigma.vercel.app/staff/inventory |
| Sales demand reports | https://el-amal-sigma.vercel.app/staff/reports |
| Source repository | https://github.com/nourabulnasr/EL-AMAL |
| Working branch | codex/el-amal-foundation |
| Local project | C:\Users\noura\OneDrive\Documents\ChatGPT\EL-AMAL 4 |

Replace /en with /ar for the corresponding Arabic public journey. The administration and staff tools share the existing staff account. Localhost on port 3004 is the developer's test server; the client and staff use the public HTTPS addresses above. Keep the stable client URL bookmarked instead of an individual deployment URL.

## What the project includes

EL AMAL helps engineers identify measurement instruments and helps procurement teams describe what they need. The site is designed around product identity, technical information and quotation requests. It does not include public prices, checkout, payment processing, customer accounts, ERP synchronization, automatic purchasing or AI engineering advice. Those were outside the initial scope. No such capability should be inferred from a basket icon or a product page.

The initial brief proposed six implementation increments: foundation, catalogue slice, RFQ slice, stock slice, completion and release candidate. Later progress reports use six workstreams instead. These are two ways to organize the same project, not twelve phases. We are in completion and release acceptance across those workstreams. Core construction is substantially complete, while several operational dependencies remain.

The original proposal mentioned four industry pages. The later client requirements prioritized oil and gas and general industry; those two are the implemented industry routes. Additional pharmaceutical, food and beverage, and construction or EPC content needs to be reconciled with the final agreed scope rather than described as already delivered. The proposal also mentioned a factory location; a verified address, hours and location presentation remain dependent on business information.

## How the project developed

| Milestone | What changed | Result |
| --- | --- | --- |
| Foundation and first review link | Next.js and Payload established with Neon and Vercel | Client could review the same hosted site throughout development. |
| Client requirement implementation | Type and application filters, model and range RFQ, two industry pages and guarded business contact components | The structure follows the client's quotation workflow. |
| Navy design and interaction work | Requested navy colors, white type, orange details, focus and hover treatments, instrument motion | One consistent public visual system with mobile and motion safeguards. |
| Branded entrance | Instrument inspired loading presentation, dismissal and replay | Approved entrance without blocking page reading indefinitely. |
| Real catalogue publication on 28 September | All 29 supplied main pages imported as 151 model groups | Actual images, specifications and documents replaced review fixtures. |
| Operations and technical SEO on 29 September | Stock service, encrypted photos, delivery maintenance, recovery safeguards and full public crawl | Private workflows and indexable real content became available. |
| Completion release on 29 September | Partial stock operations, blocked balances, count reviews, reports, encrypted restore rehearsal, font and loader changes | Broader staff control, recovery evidence and smaller public payloads. |

The source repository contains the implementation and migration history. PROGRESS.md contains dated release evidence. Database records live in Neon and change independently of Git. A pushed commit preserves code; it does not copy the current enquiries, stock ledger, users or unpublished CMS changes.

## The four parts of the design

The focal subject is an industrial instrument and a clear route to model selection. Light and contrast come from white type and restrained orange details against the requested #010736 and #091540 surfaces. Framing uses editorial headings, generous space and an off centre instrument composition. The intended feeling is engineering confidence and clarity. These choices carry through the catalogue and staff presentation, while technical tables remain readable.

The requested animation list was treated as a set of possible techniques. The implementation uses lightweight CSS interactions and Motion where it benefits the hero; it does not install every animation library mentioned. The approved loading entrance is decorative. Real route loading still follows the application's actual work. Performance, reduced motion and touch usability limit how much motion each screen needs.
