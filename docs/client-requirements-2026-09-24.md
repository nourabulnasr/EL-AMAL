# Client requirements — 24 September 2026

The client screenshot takes priority over the previous phase sequence. Retain the existing Precision in steel visual direction. Actual catalogue entry remains deferred.

## Implemented

- English and Arabic product filters combine category, instrument type, application and search. Demo classifications are illustrative, not a suitability guarantee.
- Products in admin have instrument type, application selections and an HTTPS datasheet URL. Public product details show an external manufacturer-document link only when supplied; otherwise clearly state it is missing. Real documents remain to be supplied with catalogue content.
- Direct /en/rfq and /ar/rfq accept model, integer quantity, measurement range/unit, name, email, company and optional notes without catalogue selection. Signed-in owner/sales can save a test record in the existing private inbox. Model/range snapshots are immutable, retries are deduplicated, and changed-range reuse conflicts. The existing basket flow is preserved.
- /en/industries/oil-gas and /en/industries/general-industry, with corresponding Arabic routes, describe audience-specific request details. Homepage industry links now lead to these pages. Pages link to application filters and direct RFQ.
- Contact bar and direct RFQ WhatsApp draft action are ready for approved numbers. No placeholder phone numbers are displayed.
- WIKA evidence component on the homepage is prepared and hidden until bilingual approved relationship wording and an evidence URL are supplied. No authorised-distributor claim or WIKA logo is invented.

## Needed from Nour/client

1. Business phone and WhatsApp number in international format. Set BUSINESS_PHONE and BUSINESS_WHATSAPP in Vercel (for example +countrycode..., no spaces).
2. Exact WIKA relationship, approved English/Arabic wording and certificate or official listing. Set WIKA_RELATIONSHIP_EN, WIKA_RELATIONSHIP_AR and WIKA_EVIDENCE_URL only after evidence review.
3. Actual products and model-specific datasheets later, with reviewed applications and reuse rights.
4. Configured sending service is still required for operational email RFQs. The confirmed receiving inbox alone does not provide a sender.

Public online submission remains disabled. The form does not claim a message was sent. When WhatsApp is configured it opens a prepared message; the visitor must send it in WhatsApp. No automatic messages or stock reservation are introduced.

## Verification

34 unit tests and TypeScript succeeded. Additive migration 20260924_182238_client_requirements applied to development and hosted databases. Development integration verified manual RFQ model/quantity/range storage, duplicate/conflict handling, access controls, product publication with application/datasheet metadata and cleanup. Cloud/browser results recorded in PROGRESS.md.

Visual approval, final catalogue suitability, real downloads, WIKA proof and live contact delivery are not claimed complete.
