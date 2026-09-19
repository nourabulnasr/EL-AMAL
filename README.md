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

`npm test` runs sixteen unit tests. `npm run typecheck` checks the frontend. Production build succeeded. Browser checks covered model search, language switching, Arabic product details, basket persistence, mobile menu and empty-search reset. Detailed evidence and limitations: [verification report](docs/verification-2026-09-17.md).

## Not yet live

CMS dependencies, guarded admin/API routes and the initial PostgreSQL migration are integrated. The isolated free development database is connected and tested. Permanent owner setup and authenticated admin verification remain pending. The client review deployment keeps CMS disabled. No email service, customer enquiry submission or transactional inventory is configured. No actual stock or product specifications are invented. Preview pages have noindex headers; the sitemap is intentionally empty.

Next: bootstrap the permanent owner, verify authenticated admin/API workflows, implement and test enquiry/stock workflows, import reviewed bilingual catalogue data, replace provisional branding and illustration, complete remaining content and production SEO, then deployment and acceptance checks.

- [Kickoff scope](docs/kickoff-2026-09-17.md)
- [Foundation plan](docs/foundation-plan.md)
- [Progress](PROGRESS.md)

Source proposal text, local screenshots and secrets are ignored by Git. Visual approval belongs to Nour. This preview does not constitute delivery of the full proposal.

Client review: https://el-amal-sigma.vercel.app/en. Vercel automatically deploys pushes to codex/el-amal-foundation to this stable URL. The deployed application is still a sample-content preview, with live enquiries and inventory pending.


## Catalogue source
The public website now uses a shared server catalogue loader. `CATALOGUE_SOURCE=demo` (default) preserves the labelled review records. Set `CATALOGUE_SOURCE=cms` and redeploy only when reviewed content is ready; `CMS_ENABLED`, database connection and Payload secret must also be configured. CMS mode reads published records at request time and explicitly projects public fields. It never falls back to demo products on empty data or failure. Drafts, review identities, source evidence and SKUs are not sent to the public UI. Demo and CMS baskets use different local-storage keys.

This does not enable enquiry submission or stock reservations. Images remain labelled illustrations until authorised assets are supplied. Keep noindex enabled until release acceptance.
