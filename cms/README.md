# CMS integration

Payload 3.78.0 and the PostgreSQL adapter are installed in the root application. The old isolated cms/package.json and lockfile are retained only as history; use root npm ci and npm run typecheck. All source, including CMS and migrations, now participates in root type checking.

The free Neon database el-amal-development is connected only to Vercel's development environment. Credentials live in ignored .env.local; the local Payload secret is in ignored .env.development.local. Never print or commit those files. Do not point local tests at a production database.

Commands (development environment files required):

- npm run cms -- generate:types
- npm run cms -- migrate:create descriptive_name
- Review generated migration SQL, then npm run cms -- migrate
- npm run cms -- migrate:status
- Set CMS_DATABASE_CHECK=development, then npm run cms -- run scripts/check-cms-database.ts

The database check creates uniquely identified temporary records and deletes only those exact IDs. Explicit overrideAccess:true is limited to trusted test setup/cleanup; permission assertions use overrideAccess:false.

Admin and REST routes are integrated and guarded by CMS_ENABLED=true plus valid database/secret configuration. The public Vercel review deployment has no CMS credentials or enable flag and remains disabled. Public first-register is blocked at the route and collection endpoint; password-reset routes stay blocked until a real email adapter exists. A permanent owner must be bootstrapped through a trusted local procedure after Nour supplies the owner email. Never expose first-user self-registration.

Initial migration: src/migrations/20260918_090933_initial_catalogue.ts. Applied to the new development database, with automatic schema push disabled. No production migrations, customer products, inventory balances, live RFQ or email delivery are configured.

Pending: owner bootstrap, authenticated admin walkthrough and HTTP role tests, email service, reviewed content adapter, stock/RFQ transaction services, separate deployment database and release checks. Browser visual approval remains Nour's.

Owner bootstrap: scripts/bootstrap-owner.ts requires CMS_BOOTSTRAP=development and BOOTSTRAP_OWNER_EMAIL. It refuses to operate if any staff account exists, writes a random password to ignored .env.owner.local with exclusive creation, creates the first owner and verifies login. Do not rerun to reset an account. The user-supplied development owner has now been created; authenticate with the local credential file. No credentials belong in Git or chat.
