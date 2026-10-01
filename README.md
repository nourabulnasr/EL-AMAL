# EL AMAL

Bilingual industrial-instrument website built with Next.js16, React19, TypeScript, Payload CMS and Neon PostgreSQL. The public design uses #010736 / #091540, steel and pale blue, white type and orange accents. Production source is on the `codex/el-amal-foundation` branch; unfinished review work may be on a separate branch.

Client review: [English](https://el-amal-sigma.vercel.app/en) / [Arabic](https://el-amal-sigma.vercel.app/ar). Administration: [/admin](https://el-amal-sigma.vercel.app/admin).

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3004/en. Production preview: `npm run build`, then `npm start`. Clean builds download Google fonts. Match package.json's Node22 runtime. Do not connect a local development server to the hosted production database.

## Implemented

- English/Arabic/RTL homepage, catalogue, category, product, industry, About, Contact and Resources pages; canonical/hreflang, social metadata and structured data.
- Model search, category/type/application filters, datasheet fields and separate demo/CMS publication gates.
- Persistent quote basket, model/quantity/range RFQ, validation and review, staff-test saving and private enquiry inbox.
- Guarded public submission/resend code with durable visitor/email limits, immutable snapshots, duplicate protection and signed resend receipts. Production activation stays off until its prerequisites are ready.
- Single-use email confirmation, encrypted transactional email queue, protected retry workers and verification-gated staff notifications. A provider is implemented, but real email delivery and scheduling are not active.
- Payload staff roles and hosted owner login, private SKUs, separate development/hosted Neon databases and versioned migrations.
- Responsive navy design, instrument illustration, hover/press/focus states, reduced-motion safeguards and the approved branded entrance. Desktop instrument interaction loads only when the device supports it.
- Baseline security headers, access controls, validation, dependency review and automated GitHub quality workflow.
- Private stock receipts, adjustments, exact-SKU reservations, expiry, release, dispatch and reconciliation with an immutable audit ledger and staff console.
- Verified-customer private JPEG/PNG attachments, bounded encrypted storage, staff-only downloads and scheduled retention.
- An existing-quotation route within the RFQ page accepts contact details without product lines, then verified private PDF/XLSX/photo uploads and explicit final submission. Documents are unscanned, download-only and require staff acknowledgment. Intake activation remains gated; see [current implementation and limits](docs/customer-intake.md).
- Password policy, sign-in limits, one-time concurrent-safe password recovery and durable delivery health/queue limits. Recovery delivery needs a verified sending domain.

## Current launch state

The real catalogue contains all 151 supplied model groups, with original manufacturer images, bilingual specifications and technical downloads. The 29 September release adds technical SEO and operations. Exact deployed state and verification are recorded in PROGRESS.md. Customer email remains gated until sender verification and a frequent delivery scheduler are provisioned; the daily Hobby-compatible maintenance cron does not establish email readiness. Staff enter actual SKU quantities; model-level catalogue availability never creates counted stock.

`CATALOGUE_SOURCE=demo` preserves synthetic review records. Set `cms` only after approved content is ready; CMS_ENABLED, DATABASE_URL and PAYLOAD_SECRET are also required. CMS mode never falls back to fixtures. Only explicitly projected public fields leave the server; drafts, source evidence, review identities and internal SKUs stay private. Demo/CMS baskets use different browser-storage keys.

See [delivery status](docs/phase-status.md) for the current scope estimate and exact work remaining. [Client inputs](docs/final-client-inputs.md) are collected together at the end.

## Verification and deployment

- `npm test`: unit and permission checks; the current count and release evidence are in PROGRESS.md.
- `npm run typecheck`: TypeScript.
- `npm run readiness`: configuration booleans only; no secrets or network activity.
- `npm run build`: production compilation.
- `.github/workflows/quality.yml`: clean install, tests, types, all-severity advisory gate, disposable PostgreSQL migrations, a CMS-enabled production build and actual built-server route checks. CI uses synthetic credentials, never hosted database secrets. This workflow does not itself block Vercel's separate automatic deployment integration.
- `scripts/check-customer-intake.ts` and the existing database check scripts run only against development with `CMS_DATABASE_CHECK=development`; use fake mail transports/exact disposable records. Never point them at the hosted database.

Live deployment is through the existing Vercel project; pushes to the connected branch can update the stable review URL. Migration and operational changes need their separate verification. Git backs up code, not database contents. Current results, deployment IDs and limitations live in [PROGRESS.md](PROGRESS.md).

## Handover references

- [Detailed website and staff handbook (PDF, browser and editable source)](docs/handbook/README.md)
- [Public enquiry controls and activation](docs/customer-intake.md)
- [Verification email outbox](docs/verification-email-outbox.md)
- [Staff notification worker](docs/notification-queue.md)
- [SEO activation](docs/seo-readiness.md)
- [SEO launch and complete crawl](docs/seo-launch-2026-09-29.md)
- [Stock control](docs/inventory-operations.md)
- [Demand reports and CSV](docs/demand-reporting.md)
- [Encrypted backup and recovery](docs/database-recovery.md)
- [Private photo attachments](docs/private-enquiry-photos.md)
- [Scheduled operations](docs/delivery-operations.md)
- [Original brief and acceptance scope](docs/kickoff-2026-09-17.md)
- [Continue this project](docs/continue-project.md)

Credentials, source proposal text, test artifacts and screenshots are ignored by Git. Keep them private and back up through an appropriate secure process. Visual approval belongs to Nour; release acceptance remains outstanding.
