# Important products implementation — 13 October 2026

This release is being verified on the development branch. It is not yet a production release. The live email and quotation setup remains documented in `email-launch-2026-10-13.md`.

## Confirmed scope

Nour selected an isolated product gallery for the homepage, in this order: 232.50 / 233.50 pressure gauges, the existing IV2 valve, and model 55 process thermometer per EN 13190. All 17 highlighted groups in the eight photographs are in stock, as reported on 13 October 2026. This is catalogue availability; no physical SKU counts have been invented.

The batch adds 14 groups: 111.10/111.12; 212.20; 213.40; 113.53/213.53; 232.50/233.50; 232.30/233.30; 422.12/423.12; the eight-model 432/433/452/453 process diaphragm family; 432.56/433.56/432.36/433.36; 700.01/700.02; 711.12/731.12; DPG40; TG53; and 55. Existing IV1, IV2 and IV3/IV5 receive only availability/date changes, preserving their URLs, history and analytics.

## Catalogue accuracy and discovery

- Every new group has English and Arabic names, descriptions, photograph alt text and specification labels/values. The prepared batch contains 68 specification rows.
- Genuine images were extracted from the original WIKA portfolio with their existing alpha masks. Source photographs, embedded object references, image dimensions and SHA-256 hashes are recorded in `catalogue/2026-10-13/`.
- Sixteen official WIKA PDFs were downloaded and checked for HTTP success, PDF signature, printed datasheet code and model coverage. Their source URLs and hashes are retained.
- Current PM04.03 covers the 432/433 series while the supplied catalogue also lists 452/453. The product page states that distinction in both languages. PM01.17 is scoped to the miniature 111.12.027 configuration rather than incorrectly applying it to every 111 model.
- Instrument/application filters use reviewed per-model mappings. The process pressure gauge appears in oil and gas and general industry; the differential-pressure DPG40 is not misclassified as oil and gas simply because its datasheet mentions boilers.
- The existing bilingual product routes, metadata, canonical/hreflang links, sitemap and Product/Breadcrumb structured data consume the new records. Live new-route SEO verification remains a release gate. No prices, ratings or Google-ranking guarantees are fabricated.

## Customer connection choices

The handwritten choices mean **Bottom connection / توصيل سفلي** and **Back connection / توصيل خلفي**. They appear on the three annotated families: 111.10/111.12, 232.50/233.50 and 232.30/233.30. Only 111 maps these choices directly to model 111.10 versus 111.12. Model 233 denotes case filling, not a back connection.

Customers choose a connection on the product page before adding it to the quotation basket. Both choices may be added separately with independent quantities. The selection remains visible after reload, language switching, quotation review and submission. A saved older basket that lacks a required choice asks the customer to select one; it never silently assigns a configuration.

The server accepts stable option IDs and resolves the labels/models from reviewed catalogue data. Customer-supplied labels cannot overwrite trusted details. Enquiry records store immutable English/Arabic option snapshots. Identical retries reuse the saved request; a changed option with the same request key conflicts.

## Staff and owner workflow

Open `/admin/collections/enquiries` to review the saved item, connection, quantity and selected model where applicable. In `/staff/inventory`, the Requested line dropdown also shows the connection so two equal-quantity requests for the same family remain distinguishable. Exact stock allocation still uses the existing staff-controlled SKU workflow.

Owner notifications keep the configured recipient **alamal4trade@hotmail.com** and existing verification/delivery process. Option-bearing notifications include a bounded model, connection and quantity summary. Private contact details, notes, attachment bytes and signed links are excluded from this summary. Historical enquiries without options remain readable and retain their original notification text.

## Homepage presentation

The gallery gives the pressure gauge a larger composition and places the valve and thermometer in distinct supporting compositions. Navy, light-blue illumination, white type and existing orange accents are preserved. Images are real manufacturer cutouts; the generated trial that altered dial details is not used.

The gallery uses responsive Next Image and below-fold lazy loading. Spring tilt loads near the gallery only on suitable desktop pointer devices; touch and reduced-motion users retain static products. Scroll reveal has a keyboard-focus override. Product impressions are measured on a bounded visible identity region, so short desktop windows can still qualify for the existing consent-based analytics.

The current authentic cutouts are small. Permission to remove white backgrounds from the higher-resolution original photos with an exact local pixel process is pending. English/Arabic mobile and desktop layouts have now been inspected. Keyboard focus and navigation, image loading and separate bottom/back basket selections across language switching and reload were verified. Source-image softness at gallery scale remains visible. Nour's visual approval and the earlier exact-photo-processing decision remain outstanding.

## Verification and release order

The additive migration `20261013_120000_enquiry_connection_options` adds four nullable columns. It was applied to the dedicated development database only. A real isolated PostgreSQL regression succeeded for migration up/down, old rows, forged-option rejection, concurrent retries, immutable bilingual snapshots, staff allocation, notification SQL/retries and rollback refusal when submitted option history exists. Its mail transport is a local test function; no customer email was sent.

The importer is dry-run by default, requires the saved authenticated owner and an explicit matching target on apply, validates all 14 additions and three stock updates, and saves only affected public catalogue details for rollback. Production must retain IDs 135/138/139. Development resolves its own IDs by exact external identity and model. Re-running a completed batch must make no further changes.

The development import succeeded: 14 created, three stock updates, and 165 published groups in total. An immediate rerun reported zero creations, zero updates and 17 unchanged groups. Local verification completed with 192 successful unit tests and TypeScript exit 0. Independent catalogue, connection-option and gallery source reviews have no unresolved findings within their reviewed scope.

Remaining release steps: resolve the final photo/visual approval; apply the tested migration before production code; import the reviewed catalogue; deploy and verify the new public routes, images, stock labels, options, sitemap and metadata. The expected production total is 165 groups, provided no other catalogue edits intervene.

Local preview attempts encountered native memory exhaustion, so no local browser or Lighthouse result is claimed. Nour explicitly authorized storing the separate development database connection and CMS secret in this branch's Vercel preview after automatic approval review requested that authorization. Production credentials/settings were not changed.

## Online review evidence

- Review: https://el-amal-idofstov8-nour-abulnasrs-projects.vercel.app/en and /ar. Vercel deployment `dpl_Duq49xRkfx8ML2mLbJZD4WZ2Q1Xd`, application `4cd06a3f30561f032ae1c3c54f723498c904f077`.
- GitHub quality run: https://github.com/nourabulnasr/EL-AMAL/actions/runs/38346243512 — all steps succeeded, including the built server.
- The initial cloud build exposed a server-only crypto import in the staff display helper; it was corrected and the entire cloud check completed again.
- Browser evidence: `artifacts/2026-10-13/preview/`. English and Arabic at 390px; desktop at 1440px and wide English at 1920px. Keyboard outline measured solid 2.4px with no clipping or active reveal animation while focused. No horizontal mobile page overflow observed.
- The exact-photo fallback looks soft when enlarged. This is a visual quality limitation, not final visual approval. Pointer tilt/reduced-motion behavior was source-reviewed; a complete browser interaction matrix and new performance scores are not claimed.
- Public intake, analytics writes and indexing stay disabled in this isolated review. Production release is still pending.

## Recovered authenticated page audit

Authenticated preview audit recovered all 34 English/Arabic product response bodies: zero metadata, canonical/hreflang, noindex or exact in-stock/date issues. The preview sitemap is empty. robots.txt intentionally allows public crawling so robots can read noindex, and excludes admin/staff/API paths; an initial audit expectation of Disallow: / was incorrect. A tool-session reset lost the final image-response and private-API transport status results, so those specific preview HTTP checks are not claimed. Browser image loading and cloud permission regressions are separately verified. Report: artifacts/2026-10-13/preview/http-audit-final.json.
