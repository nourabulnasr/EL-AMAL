# EL AMAL

Bilingual industrial-instrument website built with Next.js16, React19, TypeScript, Payload CMS and Neon PostgreSQL. The public design uses #010736 / #091540, white type and orange accents. Source is on the `codex/el-amal-foundation` branch.

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

## Current launch state

The live site remains a labelled sample-content preview. Actual products are not populated, indexing is off, public enquiries are not active and stock is not reserved. Do not treat the visible interface or successful unit checks as full operational delivery.

`CATALOGUE_SOURCE=demo` preserves synthetic review records. Set `cms` only after approved content is ready; CMS_ENABLED, DATABASE_URL and PAYLOAD_SECRET are also required. CMS mode never falls back to fixtures. Only explicitly projected public fields leave the server; drafts, source evidence, review identities and internal SKUs stay private. Demo/CMS baskets use different browser-storage keys.

See [delivery status](docs/phase-status.md) for the current scope estimate and exact work remaining. [Client inputs](docs/final-client-inputs.md) are collected together at the end.

## Verification and deployment

- `npm test`:58 unit checks as of27 September2026.
- `npm run typecheck`: TypeScript.
- `npm run readiness`: configuration booleans only; no secrets or network activity.
- `npm run build`: production compilation.
- `.github/workflows/quality.yml`: clean install, tests, types, high/critical advisory gate and credential-free demo build on pushes/PRs. This workflow does not itself block Vercel's separate automatic deployment integration.
- `scripts/check-customer-intake.ts` and the existing database check scripts run only against development with `CMS_DATABASE_CHECK=development`; use fake mail transports/exact disposable records. Never point them at the hosted database.

Live deployment is through the existing Vercel project; pushes to the connected branch can update the stable review URL. Migration and operational changes need their separate verification. Git backs up code, not database contents. Current results, deployment IDs and limitations live in [PROGRESS.md](PROGRESS.md).

## Handover references

- [Public enquiry controls and activation](docs/customer-intake.md)
- [Verification email outbox](docs/verification-email-outbox.md)
- [Staff notification worker](docs/notification-queue.md)
- [SEO activation](docs/seo-readiness.md)
- [Original brief and acceptance scope](docs/kickoff-2026-09-17.md)
- [Continue this project](docs/continue-project.md)

Credentials, source proposal text, test artifacts and screenshots are ignored by Git. Keep them private and back up through an appropriate secure process. Visual approval belongs to Nour; release acceptance remains outstanding.
