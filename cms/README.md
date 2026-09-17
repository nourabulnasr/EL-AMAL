# CMS preparation

The Payload/PostgreSQL dependency set was verified against package peer metadata and official installation guidance, but installation failed because the npm registry connection reset fetching @payloadcms/drizzle. These packages are kept in this separate manifest to let the frontend preview install from the local cache.

src/payload.config.ts and src/cms/collections.ts are prepared schema source, excluded from the frontend TypeScript build until the CMS packages are installed. They are not an operational admin. The /admin page explains setup status and accepts no credentials. Public preview pages currently read clearly labelled fixture records, not CMS content.

Next integration steps:

1. Install the exact packages in this manifest into the root application after registry access recovers; remove this temporary manifest separation.
2. Configure a new isolated PostgreSQL database and a random PAYLOAD_SECRET. Keep automatic schema push disabled; generate, review and run migrations.
3. Restore withPayload in next.config.mjs, include CMS source in type checking, generate Payload types and use the official Payload route-group layout/admin/REST entry points.
4. Bootstrap the first owner through a one-time trusted local operation. Public registration must remain disabled; do not default publicly created users to owner.
5. Prove direct API role boundaries, publication rules for both languages, and private-field protections using the real CMS and database.
6. Add the reviewed catalogue adapter. Keep fixture records separate and never import them as publishable products.

Inventory balances and events are deliberately not editable CMS fields. A future tested transactional service must own them. Current schemas have not been run against a database and no migrations are claimed.

References checked 17 September 2026:
- https://payloadcms.com/docs/getting-started/installation
- https://payloadcms.com/docs/local-api/access-control

All future Local API public operations must pass overrideAccess: false and an appropriate user context. Internal bypasses need explicit review.
