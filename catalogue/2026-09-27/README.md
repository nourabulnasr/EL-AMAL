# EL AMAL real catalogue — publication checkpoint 28 September 2026

All151 entries/model groups are now published in the hosted CMS, with151 original manufacturer images and560 bilingual specification rows. Stock follows Nour's confirmed main-page folder classification:90 in stock,61 out of stock.150 entries have verified manufacturer datasheets; M12 cable uses official catalogue page29. See ../../docs/catalogue-publication-2026-09-28.md and PROGRESS.md for verification and deployment status.

New reproducible files: extract-official.py/official-extraction.json; prepare-content.mjs/content-source.json; translation-input.json/translations.json; verify-datasheets.mjs/datasheet-links.json; build-publication.mjs/publication.json. The trusted ../../scripts/import-catalogue.ts validates all coverage/assets, authenticates the owner, saves an affected-record backup and creates/updates by external ID; dry run is default. Original source photos/PDFs remain private under docs/source; extracted product PNGs are published under public/images/products. No exact SKU quantities or price claims.

## Historical intake checkpoint (superseded by complete publication above)

The 29 photographs contain **151 product cards/model groups: 90 in stock and 61 out of stock**. There are 17 in-stock photos and 12 out-of-stock photos. A card can contain several models or a family; this is not an exact product or SKU count.

Nour confirmed: **“Every model on the main page.”** Apply the folder label to all models on that page. Ignore pen marks and exclude cropped neighbouring pages. Availability is a dated, user-reported model snapshot, not an exact configuration quantity or stock reservation.

## Saved files

- `source-manifest.json`: photo names, local copy paths, SHA-256 hashes and dimensions.
- `page-index.json`: all 29 main pages, 151 card labels, printed datasheet IDs and readability notes.
- `model-index.md`: readable main-page/model index.
- `pilot-products.json`: ten English/Arabic draft rows in the existing import-validator format.
- `pilot-review.json`: source evidence, reported availability and official manufacturer page/PDF links for the pilot.
- `pilot-review.md`: readable bilingual sample with source links.
- `verify.mjs`: read-only source/hash, index and import-format checks. Run from the repository root: `node --experimental-strip-types catalogue/2026-09-27/verify.mjs`.

Original photos remain untouched in the two Desktop folders. Project copies are under `docs/source/catalogue-2026-09-27/`, ignored by Git and Vercel. Include that directory in a private local backup: a Git clone contains the index but not the photos. No catalogue scans or manufacturer images were published.

## Review status

This is a first-pass identity index, not completed specification extraction or technical sign-off. Small text affected by glare/folds has not been converted into specifications. Missing page numbers remain unknown.

Ten models have short English/Arabic draft copy and matching official model/datasheet references. Manufacturer pages and PDFs were checked on 27 September 2026. This verifies document identity, not every configuration, certification or stocked variant. The remaining cards' references are transcribed from the catalogue and have not yet been checked against current manufacturer documents.

Two cards have no visible printed datasheet identifier: IR80 and M12 x 1 cable. Grouped cards and `8xx` contact families need review before splitting. T15, DI35, IV1 and other family names must not be expanded into supplied variants merely because an official datasheet lists those variants.

## Next work

1. Complete the pilot's specification and Arabic terminology review; implement an idempotent draft CMS import; check private-draft isolation and English/Arabic rendering before processing the rest.
2. Finish specifications, translations, datasheet verification and asset preparation for the remaining records.
3. Add an explicit dated model-availability workflow before displaying these folder labels. The current CMS has no equivalent field, so availability is preserved in the review sidecar rather than converted into quantities.
4. Collect exact SKUs/opening quantities, stock policy and asset-reuse confirmation with the other final client inputs. No repeated request for the catalogue or main-page stock scope is needed.
5. Complete owner content review and publication checks before switching the public catalogue from demo to CMS.

No CMS records, SKU rows, stock balances, emails, publication flags or deployment settings changed during this intake. No production build is needed for these data/documentation files. This first intake does not establish a measured full-import delivery rate.
