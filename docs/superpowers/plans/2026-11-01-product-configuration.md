# Product configuration implementation plan

Goal: selectable verified size, scale/unit and process connection, preserved in every RFQ surface.

Architecture: extend the existing server-resolved option identity with bounded configuration selections. Derive nominal sizes from explicit reviewed rows, curate standard scales from manufacturer tables, and validate dependent combinations on the server. Keep existing connection snapshots and use the existing immutable range field for a bilingual configuration summary, avoiding a database migration.

1. Add pure configuration catalogue/selection helpers and tests for invalid combinations, nominal sizes, standard scales and diaphragm distinctions.
2. Extend basket identity, persistence and server snapshots; add regression coverage for separate configurations and rejected tampering.
3. Add accessible product selectors and configuration summaries to basket/review. Preserve existing connection selection and stale basket handling.
4. Extend owner notification summaries with saved configuration, then run tests, types, build and independent review.

Ruling: the user approved all scope. Diaphragm gauge dial diameter follows verified nominal-size rows. Separate seal/flange dimensions will only be offered where explicitly documented; no inferred diameter or universal diaphragm toggle.
Ruling: retain existing review branch and unrelated dirty files. No production customer records or email tests are needed for implementation.
