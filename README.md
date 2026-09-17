# EL AMAL

Bilingual industrial instrument catalogue built with Next.js 16, React 19 and TypeScript. Direction: Precision in steel, selected by Nour on 17 September 2026.

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3004/en or /ar. For production preview: `npm run build` then `npm start`. Google font downloads require network access on a clean build.

## Implemented

- English and Arabic RTL homepage, catalogue, category and product routes.
- Model/keyword search and category filters, with explicit empty states.
- Local quote basket with quantity validation and persistence across language changes and refreshes.
- Ten explicitly synthetic demo records; illustrative CSS instrument artwork.
- Pure validation for catalogue imports, stock opening records and publication prerequisites.
- Prepared CMS schemas and staff-role rules; see [CMS integration status](cms/README.md).

## Validation

`npm test` runs ten unit tests. `npm run typecheck` checks the frontend. Production build succeeded. Browser checks covered model search, language switching, Arabic product details, basket persistence, mobile menu and empty-search reset. Detailed evidence and limitations: [verification report](docs/verification-2026-09-17.md).

## Not yet live

CMS dependencies could not finish downloading. CMS source is excluded from frontend type checking and is not operational. No database, email service, customer enquiry submission, transactional inventory or deployment is configured. No actual stock or product specifications are invented. Preview pages have noindex headers; the sitemap is intentionally empty.

Next: finish CMS dependency installation, connect isolated PostgreSQL, implement and test enquiry/stock workflows, import reviewed bilingual catalogue data, replace provisional branding and illustration, complete remaining content and production SEO, then deployment and acceptance checks.

- [Kickoff scope](docs/kickoff-2026-09-17.md)
- [Foundation plan](docs/foundation-plan.md)
- [Progress](PROGRESS.md)

Source proposal text, local screenshots and secrets are ignored by Git. Visual approval belongs to Nour. This preview does not constitute delivery of the full proposal.

Client review: https://el-amal-sigma.vercel.app/en. Vercel automatically deploys pushes to codex/el-amal-foundation to this stable URL. The deployed application is still a sample-content preview, with live enquiries and inventory pending.
