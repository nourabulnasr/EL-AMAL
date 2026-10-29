# Technical Advisor and Owner Workflow Design

## Approved direction

EL AMAL will use the same decision logic customers expect from WIKA's technical filters, expressed in EL AMAL's own dark, editorial visual language. The catalogue will never imply a material, range, approval, connection or accuracy that is not present in the reviewed product record.

The work is split into three release-safe parts:

1. A category-aware Technical Advisor for pressure, temperature, and valves/accessories.
2. A clearer existing-quotation journey that shows the upload capability before email confirmation without exposing an upload input early.
3. A unified owner workspace entry point that explains where enquiries, files, email queues, stock, and product-interest analytics live.

Logo reconstruction and a photo-rich About story are deliberately separate visual-content milestones. The current raster logo has a baked background and is not a suitable source for a faithful production vector. The About page also needs authentic company history, CEO information, and owned/cleared photography. Neither will be fabricated.

## Four-layer visual concept

- **Subject:** the reviewed industrial instrument and the exact decision criteria needed to select it.
- **Light:** deep navy surfaces, a lighter blue information layer, white typography, and the existing orange action accent.
- **Camera:** an asymmetric technical workspace: compact advisor rail, generous product field, and clear hierarchy rather than a generic card dashboard.
- **Emotional register:** precision, confidence, and calm control; technically serious without feeling like a copied manufacturer interface.

## Technical Advisor behavior

- Existing model search, category, instrument type, and industry filters remain available.
- Technical facets are derived from reviewed bilingual specification rows already published for each product.
- Facets are category-aware. Pressure, temperature, and accessories never receive an irrelevant shared checklist.
- The public URL uses whitelisted technical parameters. Unknown values are ignored and never reflected into markup.
- Selecting several values inside one facet uses OR semantics; selecting values across facets uses AND semantics.
- Facet counts are calculated against the current non-technical search/category/type/industry result set.
- Only options represented by at least one reviewed product are enabled. Unsupported WIKA options are not presented as EL AMAL inventory facts.
- Filtered catalogue URLs are followable but non-indexable and canonicalize to the clean catalogue/category route to prevent search-index duplication.
- The sitemap remains limited to clean catalogue, category, product, solution, industry, and company pages.
- The interface is server-rendered and uses native form controls/details disclosure to minimize JavaScript and preserve keyboard access.

## Initial verified facet mapping

The first release uses specification evidence already present across 165 published products:

- Pressure: nominal size, measuring unit, accuracy class, wetted/case material evidence, explosion-protection evidence.
- Temperature: nominal size, measuring unit, measuring range family, process connection, wetted material, explosion-protection evidence.
- Valves/accessories: material, nominal-pressure band, valve/protective-device family evidence.

Exact free-text ranges remain visible on product pages. The advisor converts only safely recognizable values into broad discovery options; it does not rewrite the underlying specification.

## Existing quotation behavior

- The RFQ page shows a visible file-drop-style preview listing PDF, XLSX, JPEG, and PNG support.
- Before confirmation, the panel is clearly locked and explains that the real file picker appears after the customer confirms the email link.
- No file is selected, transmitted, or stored before confirmation.
- The current private, encrypted, retention-limited upload flow remains unchanged.

## Owner workspace behavior

- `/staff` becomes the authenticated operational index rather than a collection of undocumented links.
- It explains the purpose of Enquiries, Enquiry attachments, email queues, stock control, demand reports, and product-interest reports.
- It links directly to each protected area and highlights that files are separate from the enquiry record and that the queue status is the authoritative email-delivery view.
- It does not duplicate sensitive customer data into a new public or client-side endpoint.

## Deferred inputs

- Product families with multiple customer-selectable variants: exact variant names, models, and compatibility rules.
- Final logo: original SVG/PDF/AI/EPS or explicit approval of a traced redraw.
- Rich About story: company founding year/history, CEO name/title/biography/photo, team/office/warehouse photography, and usage rights.
- Independent confirmation that owner emails arrive in Inbox rather than Spam.
- Malware scanning provider for PDF/XLSX uploads, external uptime monitoring, and independent penetration testing.

