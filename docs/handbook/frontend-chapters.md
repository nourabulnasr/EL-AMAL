# EL AMAL handbook: public website, catalogue, design and search

Evidence date: 29 September 2026. This chapter describes application commit `7f7326704305012e9637702b3112b5c85f554833`, deployed as `dpl_4iYTN8joqJgEfHa7L2GZzR4pn2bA`. The documentation checkpoint preceding this handbook is `f751ef5`. The stable public address is [EL AMAL English](https://el-amal-sigma.vercel.app/en) and [EL AMAL Arabic](https://el-amal-sigma.vercel.app/ar).

This is documentation of the existing implementation. No application code, deployment, database or external account was changed to produce this chapter. Statements about live checks refer to the saved release evidence, not a fresh live audit. Repository-relative source paths below resolve from `C:\Users\noura\OneDrive\Documents\ChatGPT\EL-AMAL 4`.

## 1. What the public website does

EL AMAL helps an engineer identify an industrial instrument and helps a purchasing team assemble the details needed for a quotation. Visitors can browse a real bilingual catalogue, search a model reference, narrow the results, open manufacturer documents, collect models and quantities, and prepare an enquiry. They can also start a direct request for a model that is not listed.

The site is a quotation catalogue. There are no public prices, checkout, payment processor, customer accounts, automatic purchasing, ERP integration or AI engineering recommendations. These were outside the initial proposal. Adding an item to the basket does not reserve stock or place an order. A catalogue model can represent a family with many possible configurations; it is not automatically an exact orderable SKU.

The real catalogue and eligible search pages are publicly available. Visitor enquiry submission, real customer email delivery and password-recovery delivery remain disabled until the sender and frequent delivery scheduler are ready. A visitor can prepare and review a request but must not be told that a review screen has sent it. Private staff operations are implemented separately from these public readiness switches.

The current public header consequently displays: “Client review — enquiries and stock reservations are not yet available,” with an Arabic equivalent. This notice describes visitor-facing availability; it does not mean the private stock ledger or staff inventory console is absent. Search indexing and email activation are independent controls.

**Source:** `README.md`; `PROGRESS.md` current milestone; `src/components/header.tsx`; `src/components/enquiry-preview.tsx`; `src/components/direct-rfq.tsx`; `src/lib/customer-readiness.ts`; `docs/kickoff-2026-09-17.md`.

## 2. Public pages and navigation

### Complete route families

Every content route below exists in English and Arabic. Substitute `en` or `ar` for `{locale}`. Product details are generated from published CMS records, not 151 separately authored page files.

| Route | What the visitor sees | Search treatment |
| --- | --- | --- |
| `/` | Redirect to `/en` | Entry redirect, not a separate sitemap page |
| `/{locale}` | Homepage, model search, category entry points, selected instruments, quotation process and industry links | Eligible when production indexing is enabled |
| `/{locale}/products` | All 151 published model groups, filters and first 24 results | Eligible |
| `/{locale}/products?page=2` through `?page=7` | Remaining catalogue pages; page 7 has seven entries | Each valid page has its own canonical and sitemap entry |
| `/{locale}/categories/pressure` and `?page=2` | 47 pressure entries | Both pages eligible |
| `/{locale}/categories/temperature` and `?page=2`, `?page=3`, `?page=4` | 87 temperature entries | All four pages eligible |
| `/{locale}/categories/accessories` | 17 valves/accessories entries | Eligible |
| `/{locale}/products/cms-N` | One published model-group detail, real image, availability date, technical rows and document links | All 151 existing IDs have eligible EN/AR pages; exact list in Appendix A |
| `/{locale}/industries/oil-gas` | Oil and gas application briefing/checklist, direct RFQ and related application filter | Eligible |
| `/{locale}/industries/general-industry` | Factory/utility/replacement briefing/checklist, direct RFQ and related filter | Eligible |
| `/{locale}/about` | Current approach and quotation process; conditional WIKA relationship evidence | Eligible |
| `/{locale}/contact` | How to begin a request; current submission status; conditional phone/WhatsApp actions | Eligible |
| `/{locale}/resources` | Technical enquiry preparation checklist | Eligible |
| `/{locale}/quote` | Browser-saved basket, quantities, removal and enquiry preparation | `noindex, nofollow`; omitted from sitemap |
| `/{locale}/rfq` | Direct model/quantity/range request and review | `noindex, nofollow`; omitted from sitemap |
| `/{locale}/verify` | Token-based enquiry confirmation; optional photos after real confirmation | `noindex, nofollow`, `no-referrer`; omitted from sitemap |
| `/{locale}/products?q=…&category=…&type=…&application=…` | Any supported combination of model search and filters | `noindex`; production allows following links |
| `/sitemap.xml` | Generated bilingual discovery list | 342 URLs in the final audit |
| `/robots.txt` | Crawler rules and, when eligible, sitemap location | Public machine-readable endpoint |
| `/social-image` | Stable 1200 × 630 PNG sharing artwork | Public asset |
| `/favicon.ico`, `/icon.svg` | Existing navy/orange/white A monogram | Public assets |
| `/images/products/*.png` | 151 original manufacturer product images | Public assets |

The locale `opengraph-image.tsx` file also participates in Next's generated image convention. Nested-page metadata deliberately points to `/social-image`, whose path is stable rather than relying on Next's generated suffix. These are image routes, not separate editorial pages.

The 342 sitemap pages reconcile exactly: for each language there are six home/information/industry pages, seven catalogue pages, seven category pages and 151 product pages: `2 × (6 + 7 + 7 + 151) = 342`. The count does not include quote/RFQ/verification pages, filter combinations, assets or administrative routes.

Unknown product/category/industry/information identifiers call `notFound()`. Unknown locales are rejected. There is a localized not-found view inside the site and a standalone bilingual global 404 fallback. Because Next may begin streaming before a missing record is discovered, two missing nested routes in the saved SEO audit returned HTTP 200 with explicit noindex; `/xx` returned HTTP 404. Do not describe every missing nested route as returning 404.

There are no implemented public `/privacy`, `/terms`, `/delivery`, `/services`, `/industries/pharmaceutical`, `/industries/food-beverage` or `/industries/construction-epc` pages. The information route allows only `about`, `contact` and `resources`.

**Source:** `src/app/(redirect)/page.tsx`; `src/app/(site)/[locale]/`; `src/content/information.ts`; `src/content/industries.ts`; `src/lib/seo-discovery.ts`; `src/app/social-image/route.tsx`; `src/app/global-not-found.tsx`; `artifacts/2026-09-29/completion/seo-final.json`.

### Header, footer and contact bar

The header links the EL AMAL wordmark to the current language homepage. Main navigation contains Catalogue, Industries, Request a quote and About. Industries opens the homepage industry section; its two entries then open the dedicated industry pages. A language switch and quote-basket link sit alongside the navigation. The basket badge counts distinct model lines, not total requested units.

The header is sticky. An `IntersectionObserver` changes its scrolled appearance without a continuous custom scroll listener. Below 1024px the navigation becomes a Menu disclosure; at the smallest widths the language and basket actions form their own row. The toggle exposes `aria-expanded` and `aria-controls`; choosing a menu link closes it, and Escape closes it and returns focus to the toggle. A no-JavaScript style keeps navigation links visible and hides the unusable toggle.

The footer repeats catalogue, basket, About, Resources and Contact links, includes a localized introduction replay button, and shows the current year. A separate contact bar always offers the RFQ route. Telephone and WhatsApp links appear only when valid approved numbers are configured; they are not placeholders.

`BUSINESS_PHONE` and `BUSINESS_WHATSAPP` accept international numbers beginning with `+` and a nonzero country code, followed by 7–14 more digits. The phone becomes a `tel:` link. WhatsApp removes the plus sign for its `wa.me` URL. The direct RFQ can open a prepared WhatsApp message only when that number is present. Opening the draft is not sending a message.

**Source:** `src/components/header.tsx`; `src/app/(site)/[locale]/layout.tsx`; `src/components/business-contact.tsx`; `src/lib/business-contact.ts`; `src/components/direct-rfq.tsx`.

### What changed from the original proposal

The 17 September kickoff proposed four industry pages: oil and gas, pharmaceutical, food and beverage, and construction/EPC. The 24 September client-requirements record explicitly says the client screenshot takes priority over the previous phase sequence, and specifies the two implemented industries: oil and gas and general industry. The content file, product application choices and sitemap all use those two. This handbook records the later implementation scope; it does not count four completed industry pages or silently assume the three other original sectors exist.

The original “up to 250 models / 500 supplied SKUs” was a content allowance, not evidence that 250 real models or 500 stock items were supplied. The later authorized publication covers all 151 model groups on the 29 actual photographed main pages. There is no missing batch implied by subtracting 151 from the original allowance. Exact stocked configurations and opening balances remain separate client inputs.

**Source:** `docs/kickoff-2026-09-17.md`; `docs/client-requirements-2026-09-24.md`; `docs/catalogue-publication-2026-09-28.md`; `src/content/product-options.ts`.

## 3. How the real catalogue was built

### Sources, counts and what they mean

| Evidence | Verified recorded quantity | Meaning |
| --- | ---: | --- |
| Original photographed main pages | 29 | 17 in-stock and 12 out-of-stock source photos; partial neighbouring pages excluded |
| Published entries | 151 | Printed cards/model groups, including grouped families; not 151 exact SKUs |
| In-stock / out-of-stock labels | 90 / 61 | User-reported main-page classification, dated 27 September 2026 |
| Measurement categories | 47 pressure / 87 temperature / 17 accessories | Totals reconcile to 151 |
| Original manufacturer images | 151 | One image path for every published group; 151 actual PNG files |
| Bilingual specification rows | 560 | Each row has English/Arabic labels and values; not 560 separate rows per language |
| Translated terms checked | 486 | Publication report's terminology/numeric-fidelity check |
| Datasheet identities/downloads | 159 | 158 verified codes plus one explicitly recorded official-link/code mismatch |
| Entries with official datasheet links | 150 | The remaining M12 cable entry links the manufacturer catalogue at page 29 |
| Document references in publication JSON | 164 | Families can have several documents and documents can recur; 160 distinct URLs including the catalogue fallback |
| Application tags | 33 oil/gas / 90 general industry | Manufacturer-evidenced classification; tags can overlap and are not suitability guarantees |

The counts were read from the publication report and checked against `publication.json`: 151 products, 151 unique image paths, 560 technical rows, and the 90/61 split. `datasheet-links.json` records 159 codes, 158 normally verified codes, one official-link/code mismatch, zero unresolved codes, 149 cards with complete conventional datasheets and 150 with official datasheet links. The distinction explains why “150 entries have links” is not identical to “150 entries have perfectly matching printed datasheet codes.”

Nour's explicit rule is that every model on a main photographed page inherits that folder's stock label. Pen marks do not select stock. This rule supersedes earlier intake uncertainty. It must not be re-asked or silently reinterpreted. The label is a dated family-level report, not a live count, factory commitment, configuration guarantee or reservation.

The images came from the matching official WIKA portfolio, not AI replacement product photography. They show the model family; a supplied variant can differ. The homepage's decorative instrument remains an illustration and is explicitly captioned as such. It must not be confused with the actual product photographs.

**Source:** `docs/catalogue-publication-2026-09-28.md`; `catalogue/2026-09-27/publication.json`; `catalogue/2026-09-27/datasheet-links.json`; `catalogue/2026-09-27/source-manifest.json`; `public/images/products/`; `src/components/hero-instrument.tsx`.

### Extraction, translation and publication path

The source workflow retains photographed originals privately, records filenames/dimensions/hashes, indexes each main page, extracts matching official catalogue material, translates the selected technical information, verifies manufacturer document identities, and builds importable publication records. The reproducible files include `extract-official.py`, `official-extraction.json`, `prepare-content.mjs`, `content-source.json`, `translation-input.json`, `translations.json`, `verify-datasheets.mjs`, `datasheet-links.json`, `build-publication.mjs` and `publication.json` under `catalogue/2026-09-27/`.

The importer validates before writing, uses stable external IDs, and records a backup of affected records. Dry run is its default; writes require the explicit chosen target. The recorded development import resumed with 64 unchanged and 87 new records, without duplicates. Hosted publication created and verified all 151 records. The 28 September live check compared SHA-256 hashes for all 151 served PNG files against local originals.

A product can appear in the public projection only when it is published and has both-language names and descriptions, a source reference, reviewer identity, parseable review date and reuse-rights confirmation. The public object is rebuilt from an allowlist. Internal source/reviewer records, draft versions and exact SKUs do not pass through to the public page. Categories without projected products are omitted. CMS mode never silently falls back to plausible demo products when reads fail or return no products.

This is a publication-control mechanism, not a manufacturer's certification of every specification or a substitute for the client's final technical/Arabic review. Original photos/PDFs and operational artifacts are ignored by Git; a clone is not a backup of those private source files. Approved extracted product PNGs are public assets.

Known source corrections were documented rather than hidden: TFT35's printed TE76.18 resolves to TE67.18; BA's PV32.22 resolves to PV32.21; the official PGT21 document has inconsistent printed PV21.02 headers, so its public title identifies WIKA PGT21; the missing A-1200 negative sign was restored from PE81.90; an ambiguous generic HPNV low-pressure option was omitted in favour of supported nominal information. None of these corrections creates an offered configuration or certification claim.

**Source:** `scripts/import-catalogue.ts`; `src/lib/import.ts`; `src/lib/access.ts`; `src/lib/public-catalogue.ts`; `src/lib/catalogue-details.ts`; `docs/catalogue-publication-2026-09-28.md`; `catalogue/2026-09-27/README.md`.

### Search, filters and pagination

Search works across the model reference, both-language name and both-language description. It is not a separate search service. Normalization applies Unicode NFKC, lowercase, removes punctuation/spaces and Arabic vowel marks/tatweel, and normalizes the common alef variants. An exact normalized model match sorts first. Input is capped at 120 characters. This lets model references survive punctuation and mixed-script differences without pretending to offer semantic engineering advice.

Four inputs combine: text query, measurement category, instrument type, and application. Types are pressure gauges, pressure transmitters, pressure switches, temperature instruments, and valves/accessories. Applications are oil/gas and general industry. Filters submit through ordinary URL forms, so results can be bookmarked and remain readable without JavaScript. Active filter labels and reset links make the current state visible. A search/category chip can remove that specific condition; type/application labels are shown and can be changed through their selects or the full reset.

Pagination renders 24 cards per page with ordinary Previous/Next anchors. Filters are preserved in navigation. Invalid, noninteger, unsafe or out-of-range page values resolve to page 1. Category-only navigation can use a dedicated `/categories/<key>` path; combinations with query/type/application use `/products` query parameters. Canonical generation normalizes valid page state and excludes page 1's redundant `page=1` parameter.

The zero-result view suggests shortening the model or resetting filters. An empty real catalogue instead says it is being prepared; it does not substitute synthetic content. A direct-RFQ link covers a model outside the catalogue. Card descriptions are visually limited to two lines; full descriptions and the technical table remain available on the product detail.

**Source:** `src/lib/catalogue.ts`; `src/components/catalogue-view.tsx`; `src/components/product-card.tsx`; `src/content/product-options.ts`; `src/lib/seo-discovery.ts`; `src/app/(site)/[locale]/products/page.tsx`; `src/app/(site)/[locale]/categories/[slug]/page.tsx`.

### Product detail behavior

Each detail opens with a breadcrumb, manufacturer image, category link, isolated model code, localized title/description, dated availability and Add to quote. The page explicitly says that configuration and current availability need confirmation during quotation. The technical section explains that ranges/options describe the family, then renders manufacturer-document buttons and a definition list containing the model, category, source status and bilingual specification rows.

Images use `next/image`, known dimensions, responsive `sizes`, and `object-fit: contain` so the whole instrument remains visible. Card images are lazy; the main detail image is eager with high fetch priority because it is prominent initial content. Fixed photo stages and declared dimensions reduce image-driven layout shifts. Document links are HTTPS and open with `noopener noreferrer`; missing documents have an explicit message. Product availability is a textual status plus a localized date rather than color alone.

No price, stock quantity, product rating, certification badge or authorization claim is inferred. Final suitability, revision, variant, availability and commercial terms need human confirmation. There is no gallery of invented alternative views or 3D product viewer.

**Source:** `src/app/(site)/[locale]/products/[slug]/page.tsx`; `src/components/product-image.tsx`; `src/components/product-availability.tsx`; `src/lib/catalogue-details.ts`; `src/lib/public-catalogue.ts`.

## 4. Basket, direct RFQ and confirmation experience

### Basket sequence

1. Open a product and select **Add to quote**. Each click adds one unit to that model's existing line or creates a new line. A status message confirms the interface action.
2. Open the header's quote basket. Change quantities from 1 to 9,999 whole units, remove a line, or return to the catalogue.
3. Add name, work email and company, with optional application/configuration notes. Review the details before any submission action.
4. In the current gated production state, the interface truthfully remains a form preview. The separate authorized staff test-save function is available only in demo catalogue mode, not in the current real CMS catalogue mode. Visitor review does not save a real enquiry or send email.
5. When prerequisites are configured and the independent intake switch is deliberately enabled, the customer submission control can save the immutable request and queue confirmation. Confirmation must happen before the downstream customer workflow; adding a basket item never reserves stock.

Only product IDs and quantities are saved in browser `localStorage`. Demo and CMS baskets use different keys: `el-amal-preview-basket-v1` and `el-amal-cms-basket-v1`. The provider removes records that no longer exist in the current projected catalogue, rejects malformed saved structures, limits baskets to 100 distinct lines, and synchronizes other tabs through the storage event. An unavailable storage mechanism produces a warning and leaves the current session usable. The browser catalogue payload contains only each product's ID, model and bilingual name; all technical detail remains server-rendered.

The basket is device/browser storage, not a logged-in cross-device cart. Contact details are component state, not persisted basket data; reloading can lose an unfinished form. Editing/saving the basket requires JavaScript and the no-script message says so. Catalogue reading and product document access do not require the basket to work. A 100-line add limit exists in the library; the product button does not provide a separate visible full-basket message, so that extreme case is not claimed to have complete UX acceptance.

The basket enquiry uses inline localized validation, required labels, email direction isolation, explicit invalid-field descriptions and focus on the first invalid field. It moves focus to the review heading after successful validation, and back to the form when editing. Name, email, company and notes are bounded at 120, 254, 160 and 2,000 characters respectively.

**Source:** `src/components/add-to-quote.tsx`; `src/components/basket-provider.tsx`; `src/lib/basket.ts`; `src/components/quote-basket.tsx`; `src/components/enquiry-preview.tsx`; `src/lib/enquiry-preview.ts`; `src/app/(site)/[locale]/layout.tsx`.

### Direct request sequence

The direct RFQ requires model, integer quantity, measurement range/unit, name, email and company, with optional notes. Model/range can describe an unlisted instrument. The form uses native required/email/number/pattern validation and limits model to 120 characters and range to 160. Review disables the input fieldset, shows that technical suitability/availability need confirmation, and offers Edit details. The optional WhatsApp action assembles the details into a URL-encoded draft for the visitor to send.

The activated customer control uses a request fingerprint plus an idempotency key, a busy lock, bounded request timeout and localized rate-limit/unavailable feedback. Retrying the same details is intended to avoid duplicate requests. A saved response displays a reference and says the confirmation email is queued, not delivered. Resend uses a returned receipt, a visible 60-second cooldown and eligibility wording. The server revalidates these limits and identities; client validation alone is not a trust boundary.

**Source:** `src/components/direct-rfq.tsx`; `src/components/customer-enquiry-submit.tsx`; `src/components/test-enquiry-submit.tsx`; `src/lib/customer-service.ts`; `docs/customer-intake.md`.

### Confirmation and attachments

The verification page reads the token from a URL fragment, shows an explicit Confirm action, and removes the fragment from browser history before the confirmation request. Statuses distinguish missing/expired/used links, rate limiting, uncertain failures, real customer verification and staff test confirmation. A test confirmation explicitly does not prove customer email ownership. Confirmation itself does not place an order or reserve stock.

A genuine customer confirmation may return a short-lived attachment grant and display the photo component. The implemented subset is up to three JPEG/PNG photos, 2 MiB each, with 8-megapixel processing limits, metadata removal, private encrypted handling, 30-day access and bounded logical storage. It is not the proposal's broader three-file PDF/JPEG/PNG/XLSX, 10 MB-per-file feature. The pre-submission “Drawings & technical documents” text is a placeholder for future broader support; do not describe it as an enabled PDF/Excel uploader. Real customer entry to this path remains constrained by the disabled public intake/email chain.

**Source:** `src/app/(site)/[locale]/verify/page.tsx`; `src/components/verify-enquiry.tsx`; `src/components/enquiry-photo-upload.tsx`; `docs/private-enquiry-photos.md`; `docs/phase-status.md`.

## 5. English, Arabic and mobile behavior

The locale layout sets real `html lang="en"`/`lang="ar"` and `dir="ltr"`/`dir="rtl"`; translation is stored in code/content fields rather than supplied by a runtime translation service. The same record identity links both languages. English uses Manrope body text and Newsreader display headings. Arabic uses Noto Sans Arabic for body/headings with its own line-height and size rules. Arabic titles are not forced into the English spacing metrics.

Model references, signed ranges, units and email addresses retain left-to-right isolation where needed. `BidiText` separates Latin/numeric runs inside Arabic prose with `<bdi dir="ltr">`; explicit model fields also use isolation. This matters for references such as grouped models, a minus sign in a temperature range, or connection dimensions. Technical review still needs to validate terminology; layout isolation is not translation certification.

With JavaScript, the language switch replaces the first locale segment, then preserves the current query string and fragment through a full document navigation. Thus an Arabic filtered catalogue can retain its filters when switching to English, and the same local basket survives the switch. The anchor itself preserves the path without JavaScript, but query/hash preservation is implemented in its click handler; do not claim the complete query-preserving switch in no-script mode. Unsaved form component state is not transferred between languages.

The layout starts as a vertical phone layout. Catalogue controls precede results; the filter becomes a sticky sidebar on a large screen. Product details stack and later become two columns. The final desktop catalogue uses two product columns beside the filter, while the homepage's selected-instrument composition deliberately gives the first product a larger stage. Category tabs can scroll horizontally, product/model/table text can wrap, and on widths below 420px technical definition rows become one column. Wider layouts constrain the overall readable width instead of stretching indefinitely.

The important thresholds are 640px for several two-column arrangements, 768px for desktop-motion eligibility, 900px for editorial information-page composition, 1024px for full navigation/hero/filter layout, and 1500px for additional outer margins. Different components need different thresholds; there is no claim that all responsive behavior is controlled by one breakpoint.

Recorded browser checks include 320px grouped product details, 375/390px mobile views and 1440px desktop samples, both locales, language switching, filters, basket persistence and no horizontal page overflow in the sampled routes. These are useful samples, not coverage of every phone, browser, zoom factor or all 342 pages in a rendered browser.

**Source:** `src/app/(site)/[locale]/layout.tsx`; `src/app/(site)/[locale]/styles.css`; `src/components/header.tsx`; `src/components/bidi-text.tsx`; `src/content/copy.ts`; `artifacts/2026-09-29/launch/browser-audit.json`; `artifacts/2026-09-29/completion/final-browser.log`; `docs/catalogue-publication-2026-09-28.md`.

## 6. Design and motion: what is actually implemented

### Visual direction

The selected direction began as **Precision in steel**, then adopted Nour's exact navy request on 27 September. Its four design layers are: the instrument and quotation task as the subject; bright white type and orange details against deep navy as the light/contrast; oversized editorial headings and an off-centre instrument as the framing; precision and confidence as the intended feeling.

The active background values are `#010736` and `#091540`, white written content, and the existing orange accent `oklch(72% .14 55)`. Source CSS retains older steel/neutral rules before the later navy overrides; reading only the first `:root` block gives the wrong current palette. It is a mixed implementation: the final navy overrides use exact hex values, with OKLCH retained for the accent and some effects. It is not a uniformly converted OKLCH-only design system.

The final override deliberately makes body/muted text white, distinguishes adjacent navy surfaces with borders/spacing, and keeps dark glyphs on orange controls. Actual manufacturer images sit on white contained stages to preserve the complete photographed instrument. Metal shading inside the illustrative gauge is retained. The current A monogram/wordmark and supplied-content presentation are provisional identity work pending the final logo and approved company assets.

Manrope handles functional text; regular-weight Newsreader provides English display hierarchy; Arabic has Noto Sans Arabic. Hero headings use responsive sizing up to approximately 142px in the large English composition, while technical copy and labels are materially smaller. Most pages use generous section spacing, clear rules and editorial asymmetry rather than repeated equal-weight rounded cards. This describes implementation and intention; only Nour grants visual acceptance.

**Source:** `docs/quality-roadmap-2026-09-27.md`; `src/app/(site)/[locale]/styles.css`, especially the “Client palette — 27 September 2026” block; `src/app/(site)/[locale]/layout.tsx`; `src/components/instrument.tsx`; `PROGRESS.md` 20 and 27 September entries.

### Hero depth and motion

The hero instrument is a layered HTML/CSS illustration: gradients, a case, dial, needle, stem and shadow. Perspective/rotation make it appear dimensional. There is no polygon mesh, WebGL scene or downloadable 3D model. Its caption expressly says “Illustrative study, not product photography.”

On a fine hover-capable pointer, at least 768px wide, and with normal motion preference, a dynamic import loads the interactive component. `motion/react` uses `LazyMotion` and separately loaded features. Pointer position drives spring-smoothed X/Y rotation; scrolling through the instrument region compresses its scale from 1 to 0.88 and moves it by up to 45px. The pointer spring uses stiffness 95, damping 22, mass 0.7. Leaving the instrument returns it toward neutral. A visible Pause motion / Enable motion control swaps the interactive component for the static instrument.

Mobile, coarse-pointer and reduced-motion visitors receive the server-rendered still instrument without loading this desktop Motion component. JavaScript-disabled visitors also retain readable static content. This is a bounded interaction around the instrument, not scroll interception for the whole site.

**Source:** `src/components/hero-instrument.tsx`; `src/components/interactive-instrument.tsx`; `src/components/motion-features.ts`; `src/components/instrument.tsx`.

### Introduction, loading, hover and focus

| Feature | Implemented behavior | Limit or distinction |
| --- | --- | --- |
| Branded introduction | Navy split panels, white editorial EL AMAL wordmark, orange gauge sweep, localized caption/Skip, footer Replay | Decorative entrance; no fake network percentage |
| Entrance duration | Desktop CSS sequence 1.8s; mobile below 768px 1.15s; JS fallback dismissal 2.2s | Runs on document mount/replay, not every client navigation; no once-per-session storage flag |
| Dismissal | Pointer press, any keyboard input, focus entry, wheel/touch movement and explicit Skip can dismiss | Does not lock body scroll or take focus for decoration |
| No-JavaScript / reduced motion | Introduction/replay hidden; global animation/transition reductions; route needle static | No mandatory animated gateway to content |
| Actual route loading | Localized `role="status"`, polite live region and `aria-busy`, with gauge needle | Fallback reflects Next route work; not a simulated duration or progress estimate |
| Header | Sticky, darker/translucent scrolled state with CSS backdrop blur | CSS glass appearance, not a liquid-glass library |
| Buttons | Fine-pointer lift, one-pass sheen, arrow displacement; immediate press response | CSS spring-shaped `linear()` easing, not physics simulation for every element |
| Links/categories/cards | Navigation underline, category text/arrow movement, image-stage lift, active-filter feedback | Hover movement is opt-in for fine pointers; touch retains press feedback |
| Form focus | Visible orange outline/boundaries and error treatment | Keyboard focus is explicit; full assistive-technology acceptance remains open |

The same-segment `loading.tsx` does not unblock data already awaited in the locale layout. The current layout awaits the fresh catalogue before returning its full shell. That is an identified performance tradeoff. A whole-site Suspense experiment was not applied because its tested hidden late segment required JavaScript to reveal real content; keeping the no-script catalogue readable took precedence in the existing implementation.

`package.json` includes Motion 12.43.0. It does not include Vanta, Three.js, React Three Fiber, GSAP, Lenis, Anime.js, a liquid-glass package or a logo-morph package. There is no video hero, procedural particle scene, original 3D modelling, scroll hijacking, true liquid logo or 3D product viewer. Requested visual outcomes must be described in terms of the actual CSS/Motion implementation, not attributed to unused libraries. The split-panel introduction is an EL AMAL composition informed by a reference entrance; it is not evidence that the reference site's implementation was copied.

**Source:** `src/components/site-intro.tsx`; `src/app/(site)/[locale]/loading.tsx`; `src/app/(site)/[locale]/styles.css`; `src/components/header.tsx`; `package.json`; `docs/performance-completion.md`; `PROGRESS.md` 25/27 September interaction entries.

## 7. Technical SEO and discoverability

### Twelve implemented approaches and why

These twelve groups describe concrete implementation choices, not a claim that there are twelve ranking factors or that the site has earned a particular ranking.

1. **Server-render the real catalogue.** Product names, descriptions and technical content reach readers/crawlers as HTML, with no-script readability preserved. This reduces dependence on browser JavaScript for discovering the business's actual content.
2. **Build a crawlable hierarchy.** Home links to categories and selected products; catalogue/category pages link to detail pages; breadcrumbs support return navigation. Discovery does not depend only on search boxes.
3. **Give pagination real URLs.** Native Previous/Next anchors and a separate canonical for each valid page expose all 151 records, including later catalogue/category pages. Pagination is not collapsed to the first page.
4. **Exclude faceted search duplicates.** Search/category/type/application query results use noindex while their product links remain followable in eligible production. Dedicated category routes retain useful indexable landing pages.
5. **Generate page-specific metadata.** Localized titles and descriptions describe the actual page/model and page number. Canonicals identify its normalized URL rather than relying on a generic site title.
6. **Connect language equivalents.** English/Arabic reciprocal alternates, English x-default, correct document language/direction and distinct canonicals clarify the bilingual relationship without treating Arabic as duplicate English content.
7. **Describe facts with structured data.** Website/organization, page/breadcrumb, collection/list and real CMS Product entities describe what is actually present. Fictional prices, reviews and authorization claims are excluded.
8. **Gate search exposure by environment.** Demo/development/previews remain noindex; private/admin/API and quotation utility routes have permanent exclusions. Production indexing is a separate explicit decision from activating customer mail.
9. **Generate the sitemap from eligible records.** Both languages, valid pagination, nonempty categories and published products are included, with real image URLs and no invented last-modified dates. Drafts/internal data are excluded.
10. **Provide stable sharing and brand assets.** Explicit Open Graph/Twitter images and repaired favicon/icon routes prevent missing nested-page previews and broken brand assets. These are presentation/discovery basics, not ranking guarantees.
11. **Preserve content provenance and truthful claims.** Reviewed bilingual publication fields, actual manufacturer photos/documents and conditional WIKA relationship evidence limit unsupported commercial/technical assertions. Technical accuracy still needs final client acceptance.
12. **Audit the entire intended discovery set.** The bounded read-only crawler verifies route coverage, metadata, alternates, schema and assets, and reports partial-crawl failure rather than treating a sample as a full audit. Google indexing/traffic and field performance remain separate observations.

The subsections below give exact behavior and source references for these approaches.

### Metadata contract

All indexable public page families use `generateMetadata` with the shared `pageMetadata` helper. Home titles are absolute, for example `EL AMAL | Industrial instrumentation`; other pages use the layout's `%s | EL AMAL` template. A product title combines its model and localized name. Descriptions come from the relevant bilingual page or product content. Valid page numbers are reflected in paginated titles.

Each helper-generated page has its own absolute canonical, English and Arabic language alternatives, and English `x-default`. Alternatives preserve the normalized page path/query. A canonical identifies the preferred URL for that page; it is not a promise of indexing. Product IDs are shared across languages. Valid pagination uses a self-canonical; it is not all collapsed to page 1.

Open Graph sets type `website`, EL AMAL site name, localized title/description, absolute page URL, `en_GB` or `ar_EG`, the reciprocal alternate locale, and the 1200 × 630 `/social-image`. Twitter uses `summary_large_image` with title/description/image. The shared artwork contains English EL AMAL campaign wording; Arabic metadata does not imply a separately translated Arabic image. `GOOGLE_SITE_VERIFICATION`, if supplied, emits Google's verification meta token. No Search Console ownership or submission is implied by merely supporting that variable.

The helper's coverage should not be overstated: `/verify` deliberately supplies its own noindex/referrer metadata rather than the full public-page metadata contract, and standalone error pages are separate. Noindex utility pages are not intended to be SEO landing pages.

**Source:** `src/lib/page-metadata.ts`; `src/app/(site)/[locale]/layout.tsx`; the individual `page.tsx` files; `src/app/(site)/[locale]/verify/page.tsx`; `src/app/(site)/[locale]/opengraph-image.tsx`; `src/app/social-image/route.tsx`.

### Production gate and exclusions

Indexing is allowed only when all four conditions are true: `SITE_INDEXING_ENABLED=true`, `CATALOGUE_SOURCE=cms`, `CMS_ENABLED=true`, and `VERCEL_ENV=production`. The canonical origin comes from a valid credential-free HTTPS `SITE_URL`; the current fallback/stable origin is `https://el-amal-sigma.vercel.app`. A preview does not become indexable merely because the switch was copied into its environment.

When the production gate is false, all routes receive `X-Robots-Tag: noindex, nofollow`, the layout metadata is noindex/nofollow, and the sitemap is empty. In eligible production, private administration/staff/API routes and EN/AR quote/RFQ/verification routes retain permanent `noindex, nofollow` headers. A `/products` request with any `q`, `category`, `type` or `application` key receives `noindex, follow`; even an explicitly present empty filter parameter is excluded. Plain pagination alone is indexable. The public metadata mirrors these distinctions.

`robots.txt` allows `/`, disallows `/admin`, `/staff` and `/api/`, and lists the sitemap only when the production gate is enabled. It does not disallow quote/RFQ/filter pages, because their noindex instructions need to be crawlable. Robots exclusions are discovery policy; access control and private-response protections are separate server mechanisms. Environment changes affecting configured headers/layout metadata require redeployment.

**Source:** `src/lib/site-policy.mjs`; `next.config.mjs`; `src/app/robots.ts`; `src/app/sitemap.ts`; `src/app/(site)/[locale]/products/page.tsx`; `docs/seo-launch-2026-09-29.md`.

### Sitemap and structured data

The dynamic sitemap reads the actual public CMS projection. It includes both languages for home, About, Contact, Resources, the two industries, all catalogue pages, nonempty category pages and each published product. Entries include reciprocal locale alternatives; product entries include the real public product-image URL. It does not invent modification dates. Drafts, empty categories, internal SKUs, basket/RFQ/verification, private routes and query-filter combinations are excluded.

The shared layout emits linked `WebSite` and `Organization` entities for EL AMAL, with stable `#website`/`#organization` IDs, URL and languages. It does not invent address, phone, hours, local-office claims, social identities or certifications.

| Page family | Additional JSON-LD |
| --- | --- |
| Homepage | Shared WebSite and Organization graph |
| Catalogue/category | CollectionPage linked to the website; ItemList containing only displayed records; BreadcrumbList |
| Product in CMS mode | WebPage linked to website and Product; BreadcrumbList; Product with name, description, model, URL, actual image and recorded manufacturer |
| Demo product | WebPage and BreadcrumbList only; no real Product assertion |
| About | AboutPage plus BreadcrumbList |
| Contact | ContactPage plus BreadcrumbList |
| Resources | WebPage plus BreadcrumbList |
| Industry | Localized WebPage in addition to the shared site graph |

An ItemList's `numberOfItems` is the current displayed-page count, while positions continue from that page's real offset. Product schema links page and product identities. The current code does not serialize the technical specification table as `additionalProperty`; the details are readable HTML. No `Offer`, made-up zero price, `AggregateRating`, fake review, certification or authorized-distributor relationship is added. Manufacturer identity means who makes the instrument, not proof of EL AMAL's commercial authorization.

The WIKA relationship block appears on home/About only after approved English wording, Arabic wording and a safe HTTPS evidence URL are all supplied. It is otherwise absent. Ordinary search discoverability is the current goal; the presence of Product JSON-LD alone does not establish eligibility for a Google product rich result.

**Source:** `src/lib/seo-discovery.ts`; `src/lib/product-schema.ts`; `src/components/site-schema.tsx`; `src/components/wika-evidence.tsx`; `src/app/(site)/[locale]/[information]/page.tsx`; `src/app/(site)/[locale]/industries/[slug]/page.tsx`.

### What the final SEO audit actually proves

The saved final read-only crawl began on 29 September at 14:46 UTC. It records 342 public HTML pages, 342 sitemap URLs, 155 checked asset URLs and zero detected issues under its implemented rules. All 151 product pages were reached in each language. The 155 assets are 151 product PNGs, `/social-image`, the icon URL, the versioned favicon URL and the plain favicon URL; they are not 155 different product photographs.

`scripts/audit-live-seo.mjs` starts from the sitemap/homepages, follows allowed public route families, and checks HTTP behavior, canonicals, reciprocal alternatives, language/direction, titles/descriptions/H1, robots, sharing metadata and parseable JSON-LD. It checks referenced social/product/icon assets, private-route discovery exclusions and missing-route handling. A configured page cap reached prematurely is a failure; it does not silently label a partial crawl complete. The final record has no detected issues, not a guaranteed absence of every conceivable SEO problem.

It does not prove Google indexed the pages, ranking, traffic, rich results, full content accuracy, external technical-PDF availability at the later crawl date, accessibility, field Core Web Vitals, every structured-data recommendation or whole-site security. The original PDF identity verification is a separate catalogue evidence set. Search Console property verification/submission and representative URL inspections remain owner follow-through. If the final public domain changes, matching old-to-new redirects, `SITE_URL`, redeployment, full recrawl and replacement sitemap submission are needed.

**Source:** `artifacts/2026-09-29/completion/seo-final.json`; `scripts/audit-live-seo.mjs`; `docs/seo-launch-2026-09-29.md`; `catalogue/2026-09-27/datasheet-links.json`.

## 8. Performance: changes and measured limits

### Changes that reduced real work

The interface uses Next.js 16.3.5, React 19.2.8, Tailwind 4.3.3, TypeScript 5.9.3 and Motion 12.43.0, with Payload 3.90.2 for CMS. Most catalogue content is rendered on the server; interactive code is concentrated in navigation, basket/forms, introduction and the conditionally loaded desktop instrument.

Four material improvements were made against the actual CMS catalogue:

1. **Main image discovery.** The product detail photo changed from lazy loading to eager/high priority. A prominent initial image should not wait as if it were below the fold. Cards remain lazy.
2. **Smaller hydrated data.** Basket consumers receive only ID/model/name instead of every technical row. Recorded uncompressed product HTML fell from 140,383 to 60,600 bytes after related payload changes. This is one sampled response, not a universal page-size constant.
3. **No public theme-negotiation restart.** Payload's `Critical-CH` header was scoped to admin routes so supporting browsers do not restart public navigation for CMS theme negotiation.
4. **Font and catalogue-read work.** Newsreader requests only the regular 400 weight actually used. Noto Sans Arabic is one variable face rather than repeated weight declarations, with unconditional shared preload disabled. Independent product/category pagination starts concurrently, while each collection reads one page at a time.

All public fonts still use `next/font/google`, `display: swap` and bundled self-hosted output. A clean build needs font retrieval; the visitor does not make a runtime Google Fonts CSS request. The earlier raw font-file calculation was 248,880 bytes; the expected optimized English raw-file total was 47,080, a saving of 201,800 bytes. A fresh deployed English browser observation measured 47,680 transferred bytes, including transfer overhead. These values describe slightly different measurements and should not be presented as a discrepancy or an exact timing improvement.

Arabic still loads its required font faces when CSS matches Arabic content. Removing shared preload is not evidence of zero Arabic font cost or final Arabic performance acceptance. Current final Lighthouse samples are English; Arabic received rendering/no-overflow/no-script checks, not a documented matching final Arabic Lighthouse run.

Catalogue reads use request-scoped React `cache`, not a persistent cross-request catalogue cache. A new request sees publication changes. Product and category streams run together with total concurrency at most two; pagination within each stream remains sequential, preserves order and reads every page. Failure of either stream rejects the load; no partial plausible catalogue or demo fallback is returned. Five targeted regressions cover concurrent start, bounded pagination, both failure paths and later-request freshness.

**Source:** `package.json`; `src/app/(site)/[locale]/layout.tsx`; `src/components/product-image.tsx`; `next.config.mjs`; `src/lib/load-catalogue.ts`; `src/lib/read-catalogue-records.ts`; `tests/read-catalogue-records.test.mjs`; `docs/performance-completion.md`; `PROGRESS.md`.

### Current measured results

| Saved mobile lab sample | Performance | LCP | Total Blocking Time | CLS | Accessibility / Best Practices / SEO |
| --- | ---: | ---: | ---: | ---: | --- |
| English homepage, preceding font release, 14:36 UTC | 91 | 2.890s | 205.5ms | 0 | 100 / 100 / 100 |
| English actual product `/en/products/cms-120`, 14:38 UTC | 90 | 2.919s | 232ms | 0 | 100 / 100 / 100 |
| English homepage, final concurrent-read release, 14:50 UTC | 89 | 2.758s | 237.5ms | 0 | 100 / 100 / 100 |

For normal communication these round to homepage 89–91, final LCP 2.8s/TBT 240ms; product 90, LCP 2.9s/TBT 230ms. The final homepage result is 89, not 91. The product's most recent saved 90 is the preceding font-release sample; there is no separate final-product Lighthouse file after the loader change. A lower LCP in one run does not mean every metric or overall score improved.

Earlier actual-product performance was 57/LCP 5.8s/TBT 590ms before the image/payload work, then 84/LCP 3.4s/TBT 160ms. An earlier actual-home sample was 78/LCP 4.0s. The demo-era homepage 100/LCP 1.2s came from different content and conditions and must not be reused as the real catalogue's current result.

The intended steady 90+ performance bar is not yet demonstrated consistently. LCP below 2.5s remains unmet in the current samples. CLS was zero in those samples, but this does not prove all real sessions have zero shift. Total Blocking Time is a lab measure and must not be relabelled INP. No field INP or real-user 75th-percentile LCP/INP/CLS evidence is recorded. These local simulated mobile measurements are not a full field Core Web Vitals assessment.

Remaining performance work includes representative repeated EN/AR home/catalogue/detail measurements, Arabic font-discovery/shift checks, investigation of server/catalogue readiness and render-blocking work, and a streaming strategy that preserves no-script content if pursued. None should be claimed complete simply because a cloud build succeeded or one score reached 90.

**Source:** `artifacts/2026-09-29/completion/lighthouse-home.json`; `lighthouse-product.json`; `lighthouse-final-home.json`; `artifacts/2026-09-29/completion/final-browser.log`; `docs/performance-completion.md`; `PROGRESS.md`.

## 9. Accessibility and verification boundaries

Implemented accessibility measures include a skip link to the main content, landmark structure, real links/forms/buttons, visible focus, menu expanded-state relationships, localized labels/status/error messages, controlled focus in the basket form, text-based availability labels, image alternative text, RTL-aware layout, no-script catalogue reading and reduced-motion alternatives. Decorative gauge layers and arrows are hidden from assistive technology where appropriate. Phone/contact/footer links and main controls have deliberate touch target heights; controls generally use 44–54px minimum interactive heights.

Reduced-motion CSS turns off transitions/animation and smooth scrolling, hides the introduction/replay, resets hero transforms and removes the moving route needle. The hero component also avoids importing its Motion behavior when the live media preference requests reduced motion. No-JavaScript styles hide the introduction and expose the mobile nav links, while server-rendered product content and native search/pagination remain readable. This is progressive enhancement for content, not an assertion that interactive RFQ/basket submission works without JavaScript.

The recorded launch browser audit covered ten representative public/login views: English home (1440px), Arabic home (390px), English catalogue (1440px), Arabic catalogue page 2 (390px), English actual product (390px), Arabic actual product (320px), English RFQ (390px), Arabic basket (390px), English Contact (390px), and admin login (1440px). It also sampled the authenticated stock page. Automated axe results found zero violations in the selected rules after the public-notice/login landmark fixes. Manual-review items remained. Its configured public rule tags were WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice checks, so it is not evidence of comprehensive WCAG 2.2 conformance.

The same release evidence records the reduced-motion entrance as hidden, Skip to content as first keyboard focus, and an actual Arabic product readable with JavaScript disabled. Post-payload browser checks exercised basket add/quantity/reload/Arabic switch/remove, model search and menu Escape/focus restoration, then cleaned the test selection. The final completion browser log again records EN/AR home/detail samples without overflow or detected axe violations and an Arabic no-script product heading. Final private reports were also checked at 390px and 1440px, separately from the public route coverage.

A Lighthouse accessibility score of 100 is a result for the audited rules/sample, not an accessibility certification. Screen-reader task completion, high zoom/reflow, browser/device combinations, user testing, enabled real-submission error/recovery flows and final Arabic editorial review remain broader acceptance work. The originally requested Impeccable skill/suite was unavailable in the recorded project setup, so equivalent manual/source/browser work must not be labelled as actual execution of `/impeccable /audit`, `/colorize`, `/typeset`, `/animate` or `/polish`.

**Source:** `src/components/header.tsx`; `src/components/enquiry-preview.tsx`; `src/components/site-intro.tsx`; `src/app/(site)/[locale]/styles.css`; `artifacts/2026-09-29/launch/browser-audit.json`; `artifacts/2026-09-29/launch/check-browser.mjs`; `artifacts/2026-09-29/completion/final-browser.log`; `docs/kickoff-2026-09-17.md`; `docs/verification-2026-09-17.md`.

## 10. Analytics, reporting and remaining acceptance

### Analytics is not the same as the demand report

The kickoff's ANA01 required product events, server-confirmed leads and a protected demand CSV, with controlled event reconciliation and no contact data in analytics. The existing source/package/scripts/tests contain no identified Google Analytics/gtag/dataLayer integration, browser event collector or product-view/search/datasheet-click/basket-add analytics instrumentation. There is no recorded analytics-provider configuration or event-reconciliation acceptance evidence. Those behavioral events must remain explicitly unimplemented/unverified rather than being inferred from Vercel hosting, server logs or an SEO crawl.

The private demand report is implemented. Owner/sales users can see aggregated saved enquiries, requested units and genuinely verified customer enquiries, with protected CSV export. Verified counts require stored customer verification status and timestamp, and exclude staff/demo verification from the default customer cohort. These are database-derived demand counts, not an external server-confirmed lead event feed, conversion attribution, page-view analytics, sales revenue or an inventory-shortage report. The distinction preserves an honest status for the original ANA01 requirement: its reporting/export portion exists; behavioral/event collection and reconciliation are not evidenced as complete.

**Source:** `docs/kickoff-2026-09-17.md` ANA01/T11; `docs/demand-reporting.md`; `src/lib/demand-service.ts`; `src/lib/demand-report.ts`; `src/app/(staff)/staff/reports/page.tsx`; `package.json`; source search performed for this handbook.

### Work and inputs still outstanding

| Area | Remaining item | Why it matters |
| --- | --- | --- |
| Client identity/content | Final logo, approved company/factory photography, accurate business facts and final About/Contact copy | Present content emphasizes the process and does not establish missing company history/address/hours/services |
| Direct contact | Approved international phone and WhatsApp numbers | Conditional links remain absent until valid values exist |
| WIKA relationship | Exact bilingual wording plus official evidence/certificate/listing | No distributor/authorization claim should be invented |
| Catalogue acceptance | Client technical and Arabic review; exact offered variants where relevant | Family data and source-link checks do not certify each offered configuration |
| Real inventory | Exact SKU definitions, opening quantities and accepted reservation/expiry/freshness policy | Dated public 90/61 model labels cannot become counted stock |
| Customer delivery | Owned sender/domain, sending service, frequent scheduler authorization and actual delivery/recovery tests | Receiving inbox is already known; it alone cannot send confirmation mail |
| Attachments | PDF/Excel and larger-file private quarantine, malware scanning/storage plus acceptance | Current photo subset does not fulfill the original 10 MB multi-format proposal |
| Policies | Approved privacy/retention/legal wording and appropriate public policy pages | There are no current dedicated public policy routes |
| Analytics | Agreed privacy-safe product/search/download/basket events, confirmed-lead event design and reconciliation if retained | Protected reporting alone does not complete original behavioral analytics scope |
| Search | Final domain decision, Search Console ownership/sitemap submission and actual index observations | Technical indexability is not a ranking or indexing result |
| Performance | Consistent 90+, LCP target and field/Arabic measurements | Current final homepage is 89; LCP remains 2.8–2.9s in the cited samples |
| Accessibility/UX | Broader screen-reader, zoom, device, real form and final client walkthrough | Sampled automated checks cover only a subset of users/tasks |
| Operations | Automatic offsite backups and wider launch acceptance | A completed restore rehearsal does not schedule future backups |
| Monitoring | External monitoring deferred explicitly by Nour | Record as deferred; do not repeatedly request activation |
| Final acceptance | Nour's visual review and the client's operational/content launch decision | Agent measurements and source review are not owner approval |

No repeat request is needed for all 29 catalogue pages, the main-page stock scope or the receiving inbox: those inputs are already settled. The next phase should collect the still-missing inputs together, preserve the approved navy/white/orange direction, and resume from the existing application rather than rebuilding the catalogue.

**Source:** `docs/final-client-inputs.md`; `docs/phase-status.md`; `PROGRESS.md` current milestone; `docs/customer-intake.md`; `docs/private-enquiry-photos.md`; `docs/database-recovery.md`.

## 11. Reading historical documentation correctly

Several historical documents retain their original checkpoint statements. Their dates and later amendments matter:

- `docs/catalogue-publication-2026-09-28.md` and older sections of the catalogue README still say indexing is disabled, show an old favicon 404, and list operational features as future work. The 29 September code/final audit supersedes those statements; indexing is enabled for eligible public pages and favicon URLs returned 200.
- `artifacts/2026-09-29/completion/performance-report.md` is the font investigation snapshot and says no new Lighthouse score exists yet. `docs/performance-completion.md` and the later Lighthouse JSONs record actual deployment measurements. Use the final 89 homepage result, with the observed 89–91 range.
- Older progress sections cite 34, 53, 58, 65, 121, 122 or 137 tests and 70%/85% delivery estimates. The current source checkpoint records 142 unit checks and a roughly 90% full-scope estimate; neither is a quality, ranking or security guarantee.
- The original four-industry proposal is not the same as the later two-industry client implementation. The original 250-model allowance is not an unfulfilled claim that 250 real source models were received.
- Existing “verified catalogue” or “reviewed catalogue record” labels describe the application's publication checks, not final client acceptance of Arabic, suitability, exact variants or stock promises.
- The 159 verified document identities, 150 linked entries, 164 document references and 160 unique URLs measure different things. They should not be collapsed into one figure.

**Evidence priority:** current source and final deployment evidence establish implemented behavior; the newest explicit user/client scope changes establish requested scope; original briefs establish remaining acceptance requirements where not superseded; older milestone prose is history.

## Appendix A. Published product route index

All 151 English/Arabic product route pairs and their model-group labels are listed in the companion [catalogue route index](catalogue-route-index.md), extracted from the final saved crawl. This keeps the main handbook readable while retaining every published product URL. See section 2 for all other public route families and exact pagination ranges.

## Appendix B. Source and evidence index

| Topic | Primary implementation/evidence |
| --- | --- |
| Current release authority | `PROGRESS.md` current milestone; application `7f73267`; `artifacts/2026-09-29/completion/final-deployment.json` |
| Initial and later scope | `docs/kickoff-2026-09-17.md`; `docs/client-requirements-2026-09-24.md`; `docs/final-client-inputs.md` |
| Public page templates | `src/app/(site)/[locale]/page.tsx`; `products/page.tsx`; `products/[slug]/page.tsx`; `categories/[slug]/page.tsx`; `industries/[slug]/page.tsx`; `[information]/page.tsx` |
| Locale shell/navigation | `src/app/(site)/[locale]/layout.tsx`; `src/components/header.tsx`; `src/components/business-contact.tsx` |
| Design and motion | `src/app/(site)/[locale]/styles.css`; `src/components/hero-instrument.tsx`; `interactive-instrument.tsx`; `site-intro.tsx`; `instrument.tsx` |
| Catalogue/publication | `catalogue/2026-09-27/publication.json`; `datasheet-links.json`; `source-manifest.json`; `docs/catalogue-publication-2026-09-28.md` |
| Public data boundary | `src/lib/load-catalogue.ts`; `read-catalogue-records.ts`; `public-catalogue.ts`; `catalogue-details.ts`; `access.ts` |
| Search and result UX | `src/lib/catalogue.ts`; `src/components/catalogue-view.tsx`; `src/content/product-options.ts` |
| Basket and RFQ | `src/lib/basket.ts`; `src/components/basket-provider.tsx`; `quote-basket.tsx`; `enquiry-preview.tsx`; `direct-rfq.tsx`; `customer-enquiry-submit.tsx` |
| Verification/photo UI | `src/components/verify-enquiry.tsx`; `enquiry-photo-upload.tsx`; `docs/private-enquiry-photos.md` |
| Metadata and SEO policy | `src/lib/page-metadata.ts`; `site-policy.mjs`; `seo-discovery.ts`; `product-schema.ts`; `src/components/site-schema.tsx`; `next.config.mjs` |
| Discovery endpoints | `src/app/sitemap.ts`; `robots.ts`; `social-image/route.tsx`; `icon.svg`; `favicon.ico` |
| Full SEO crawl | `scripts/audit-live-seo.mjs`; `artifacts/2026-09-29/completion/seo-final.json`; `docs/seo-launch-2026-09-29.md` |
| Final performance | `artifacts/2026-09-29/completion/lighthouse-final-home.json`; `lighthouse-home.json`; `lighthouse-product.json`; `docs/performance-completion.md` |
| Browser/accessibility scope | `artifacts/2026-09-29/launch/browser-audit.json`; `check-browser.mjs`; `artifacts/2026-09-29/completion/final-browser.log` |
| Reporting versus analytics | `docs/demand-reporting.md`; `src/lib/demand-report.ts`; `demand-service.ts`; `docs/kickoff-2026-09-17.md` ANA01/T11 |
| Remaining acceptance | `docs/phase-status.md`; `docs/final-client-inputs.md`; `PROGRESS.md` current milestone |

Artifact files are local saved evidence and are ignored by Git. Preserve them through the project's private backup process when handing the project to a new machine. A source checkout alone may not contain them.

