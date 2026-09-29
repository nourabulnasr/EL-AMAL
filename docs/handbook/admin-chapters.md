# EL AMAL administration and staff operations handbook

Evidence date: 29 September 2026. These chapters describe the checked-in application at documentation checkpoint `f751ef5ee4f14378af3c1868936bf012b8dabb8f`, whose progress record identifies application release `7f7326704305012e9637702b3112b5c85f554833` as live. Procedures were checked against collection definitions, staff components, service logic and the installed Payload implementation. This documentation task did not change application records or perform the examples in production. The field and action names below are source-verified English labels; they are not a new browser walkthrough or visual approval.

## 1. What is ready to use, and what remains inactive

Administration is at [EL AMAL admin](https://el-amal-sigma.vercel.app/admin). The live catalogue contains 151 model or model-group entries. Its dated folder-derived labels are 90 in stock and 61 out of stock, reported on 27 September 2026. Those figures describe catalogue families. They are not counted warehouse units and are not 151 orderable configurations.

The latest recorded production check found **zero exact SKU definitions**. Until the owner defines real configurations and a warehouse/owner records documented opening receipts, an empty stock screen is the expected result. It does not mean the company has no physical stock. No one should convert the 90 catalogue labels into quantities.

Catalogue management, private stock operations, saved-enquiry administration and demand reporting are implemented. Public customer submission, real customer email sending and staff password-recovery delivery remain disabled pending activation prerequisites. A verified sending identity/provider and frequent mail worker still need to be established; the existing daily maintenance run is not a frequent email scheduler. Do not promise that **Forgot password?**, submission, verification or notification emails work today. External monitoring was explicitly deferred by Nour.

Staff can read existing saved data where their roles allow. A blank report is legitimate when no matching enquiries exist. Ordinary staff cannot manually create a customer enquiry or mark one verified through the admin panel. This protects customer history and email-verification evidence.

The public catalogue image workflow and the private customer-photo workflow are separate. There is no general **Media** library in the current Payload configuration. Product photos live in deployed website files; private enquiry photos are encrypted database records.

## 2. Finding the right screen

Use the same production host for every route below. On a local development server, the paths are the same but the database may be different. Never use a development account or development data as evidence about production.

| Purpose | Exact route | Navigation or screen text |
| --- | --- | --- |
| Sign in | `/admin/login` | `Email`, `Password`, `Login` |
| Admin dashboard | `/admin` | Dashboard links include `Open stock control` and `Open demand reports` |
| Products | `/admin/collections/products` | Product documents are identified by `Model` |
| Categories | `/admin/collections/categories` | Category documents are identified by `Key` |
| Exact SKU definitions | `/admin/collections/skus` | Staff header link: `SKU definitions`; records identified by `Sku Code` |
| Saved enquiries | `/admin/collections/enquiries` | Staff header: `Enquiries`; records identified by `Reference` |
| Staff accounts | `/admin/collections/staff` | Records identified by email |
| Stock actions | `/staff/inventory` | `Stock control` |
| Demand report | `/staff/reports` | Page heading: `What customers request.` |
| Immutable hold records | `/admin/collections/inventory-reservations` | `Inventory Reservations`, within `Stock control` |
| Immutable movement records | `/admin/collections/inventory-movements` | `Inventory Movements`, within `Stock control` |
| Staff notification state | `/admin/collections/notifications` | `Notification queue` |
| Customer confirmation mail state | `/admin/collections/verification-emails` | `Verification email queue` |
| Owner maintenance summary | `/admin/collections/delivery-operations` | `Delivery operations` |
| Private customer photos | `/admin/collections/enquiry-attachments` | `Enquiry photos`; list-cell action: `Download photo` |

Payload uses `/admin/collections/<collection>/create` for a new document and `/admin/collections/<collection>/<id>` for an existing one. Use **Create New** only where the role permits creation. For stock, create entries through **Stock control**, never through either inventory collection.

Most collection and field labels are generated from their code names. For example, the actual generated labels are **Sku Code**, **External Id** and **Datasheet Url**, rather than acronym-normalized wording. The `skus` collection has no explicit plural label; the installed Payload formatter generates the awkward **Skuses**. The custom **SKU definitions** navigation link and `/admin/collections/skus` route are unambiguous. English and Arabic product values appear together under **English** and **Arabic** fields; this is not a separate language-selector workflow.

The staff header shows links for stock, reports, SKU definitions and enquiries without hiding every inaccessible destination. A visible link does not grant permission. The destination and its API enforce access.

### Sign-in procedure

1. Open the production `/admin/login` page and use the account assigned to you.
2. Enter **Email** and **Password**, then choose **Login**. Do not post credentials into a report, chat, ticket or Git file.
3. Open the needed collection or the dashboard's stock/report link.
4. When finished on a shared computer, use the account's logout control. Closing a browser tab is not proof of logout.

The configured login lock is five unsuccessful attempts followed by a ten-minute lock window. Authentication token expiration is two hours; session refresh can affect what the user experiences. These are source configuration values, not a guarantee that every session lasts exactly two hours. If locked out, stop repeated guessing, check the correct environment and ask the owner for account help. Email recovery is currently unavailable.

## 3. Roles: who can actually do what

Roles are stored as the exact values `owner`, `catalogue-editor`, `sales` and `warehouse`. Owner is the most privileged account. Assign staff by responsibility rather than sharing the owner login.

| Operation | Owner | Catalogue editor | Sales | Warehouse |
| --- | --- | --- | --- | --- |
| Enter administration | Yes | Yes | Yes | Yes |
| Read products, categories and SKU definitions | Yes | Yes | Yes | Yes |
| Create/edit categories and product drafts | Yes | Yes | No | No |
| Publish product content or save a change that remains published | Yes, with required review evidence | No | No | No |
| Unpublish a product through permitted update | Yes | Yes | No | No |
| Set product reviewer, review date and rights confirmation | Yes | No | No | No |
| Create an exact SKU or change its active flag | Yes | No | No | No |
| Change an existing SKU's identity | No; create another SKU | No | No | No |
| Read stock balances, reservations and stock ledger | Yes | No | Yes | Yes |
| Record receipt or adjustment | Yes | No | No | Yes |
| Create or release a hold | Yes | No | Yes | No |
| Dispatch a hold | Yes | No | No | Yes |
| Block/unblock units or confirm a physical count | Yes | No | No | Yes |
| Reconcile ledger | Yes | No | Yes | Yes |
| Read enquiries; edit workflow status/internal notes | Yes | No | Yes | No |
| Read notification and verification-email queues | Yes | No | Yes | No |
| View demand report/download its CSV | Yes | No | Yes | No |
| Read/download eligible private enquiry photos | Yes | No | Yes | No |
| Read Delivery operations collection | Yes | No | No | No |
| Create/update staff accounts | Yes | No | No | No |
| Read staff accounts | All | Own record | Own record | Own record |

Normal admin/API deletion is denied for staff, categories, products, SKUs and enquiries. Stock history and customer-photo records also have no ordinary create/update/delete path. Hidden verification and request-limit collections are not available for staff administration, including the owner.

**Permission details that matter:** catalogue editors can read SKU definitions but cannot read warehouse quantities. Warehouse staff can see hold references and SKU snapshots in stock control but do not receive customer names, emails or the enquiry selector. A stock/report service rechecks the user's persisted staff role inside its database transaction; an outdated browser view is not authority to perform an action.

The ordinary staff create/update rule is owner-only, but Payload's separate default account-**unlock** permission is broader: this project does not override its default check for an authenticated user in the admin staff collection. Do not describe account unlocking as owner-only or treat this matrix as an independent security certification. An owner should handle lockout incidents operationally until that separate permission receives explicit review.

## 4. Maintaining categories

A category is a public grouping such as pressure, temperature or accessories. It organizes models; it contains no inventory count.

| Field label | Meaning and requirement |
| --- | --- |
| `Key` | Required unique category identifier used in public category URLs and filtering |
| `Name` → `English`, `Arabic` | Required names for both languages |
| `Description` → `English`, `Arabic` | Required explanatory copy for both languages |

1. As owner or catalogue editor, open `/admin/collections/categories`.
2. Open the existing category by **Key**. Use **Create New** only when a genuinely new category is needed.
3. For a new category, agree a stable, readable URL-safe **Key**. The field is unique text; the application does not generate a safe slug for you.
4. Fill both **Name** values and both **Description** values. Keep technical meaning aligned across languages.
5. Choose **Save**. Categories do not have a product-style draft/publication workflow.
6. Check the public category page in both languages after the save. A category appears in the public catalogue only when it has at least one eligible published product.

Changing a category's name/description can affect published pages immediately. Changing **Key** changes the public grouping identifier and can break previously shared category links; no automatic redirect is configured in this collection. There is no category delete button authorized by the application. When retiring a grouping, review product assignments and URL consequences with the owner rather than assuming deletion or hiding is available.

Implementation: `Categories` in `src/cms/collections.ts` controls editing. `toPublicCatalogue` in `src/lib/public-catalogue.ts` includes only categories used by eligible published products. This prevents empty navigation groups from appearing as if they contain catalogue stock.

## 5. Product catalogue: draft, review, publish and correct

A **Product** is a catalogue model/family. A **SKU** is a specific orderable configuration of that model. The product's public page explains the family and its supported options; its availability label does not reserve a unit or promise every configuration is stocked.

### Product fields

| Exact label | What to enter; who controls it |
| --- | --- |
| `Catalogue Details` | Structured JSON for reviewed manufacturer image, bilingual technical rows, dated family availability and datasheets. See the next section. |
| `External Id` | Required unique stable catalogue/import identifier. Retain an existing identifier when correcting content; do not manufacture a second record for the same imported entry. |
| `Model` | Required manufacturer model or printed model-group label. Preserve the real designation. |
| `Category` | Required relationship to an existing category. |
| `Name` → `English`, `Arabic` | Required human-readable model name in both languages. |
| `Description` → `English`, `Arabic` | Required technical introduction in both languages. |
| `Instrument Type` | Optional filter value: `Pressure gauges`, `Pressure transmitters`, `Pressure switches`, `Temperature instruments`, or `Valves & accessories`. |
| `Applications` | Optional multiple selections: `Oil & gas`, `General industry`. Choose only applications supported by manufacturer evidence. |
| `Datasheet Url` | Optional HTTPS link to the actual manufacturer document. The URL validator does not prove that the PDF is correct or licensed. |
| `Source Ref` | Required evidence pointer for the submitted facts and asset source. Visible to authenticated staff, excluded from normal anonymous field access. |
| `Reviewed By` | Owner-set relationship to the staff reviewer. Readable in normal field access by owner/catalogue editor. |
| `Reviewed At` | Owner-set review date. Publication requires a parseable date. |
| `Rights Confirmed` | Owner-set checkbox confirming rights have been reviewed; defaults false. |

Review fields record an operator decision. Their presence is not proof that a manufacturer or legal reviewer approved the content. The application verifies required values; a person must verify their truth.

### Creating or updating a draft

1. Open `/admin/collections/products`. Search for the **Model** first so an existing family is not duplicated.
2. Open the record to correct it, or choose **Create New** for a new approved catalogue entry.
3. Enter the stable **External Id**, exact **Model**, **Category**, both **Name** values and both **Description** values.
4. Choose evidence-supported **Instrument Type** and **Applications**. Preserve manufacturer codes, units, signs, ranges and configuration caveats when translating.
5. Add **Source Ref**, verified document links and the reviewed **Catalogue Details** content. If an image file is new, use the file-preparation process in section 6 first.
6. Choose **Save Draft**. Payload's draft action can save incomplete required fields, but invalid non-null Catalogue Details still fails its custom validation. A successful draft save is not a successful publication review.
7. Record what the owner still needs to verify. There is no implemented editorial approval inbox or automatic review email; arrange review through the team's existing process.

Saving draft edits to a product that already has a published version does not replace its public version. The public loader reads `draft:false`. Draft and public content can therefore differ deliberately while a correction is being reviewed.

### Publishing reviewed content

1. The owner opens the draft and reviews English and Arabic content, model identity, images, technical rows, dates, links and asset rights against the evidence.
2. Set **Reviewed By**, **Reviewed At** and **Rights Confirmed** accurately.
3. Confirm that both language names/descriptions and **Source Ref** are filled. These are explicit publication requirements.
4. Choose **Publish** or **Publish changes**, as appropriate to the document state.
5. Check the actual public product page in both English and Arabic, including the image, specification rows, availability date and datasheet links. The public detail route uses `/en/products/cms-<numeric product id>` or `/ar/products/cms-<numeric product id>`; it does not use the typed model name as the slug.
6. Treat Nour's review as visual acceptance. A successful save, valid JSON or correct HTTP response does not provide visual acceptance on his behalf.

Two independent gates apply: the product save hook restricts publication to owners with required review evidence, and the public projection excludes unpublished/unreviewed records. A fresh public request reads current published records without substituting demonstration data if the real catalogue fails.

### Removing or correcting public content

For a factual correction, edit and save a draft, then repeat owner review and publication. For immediate withdrawal, **Unpublish** changes the product to draft and removes it from the eligible public catalogue. The code permits owner or catalogue editor updates and blocks only the published state for nonowners, so catalogue editors can unpublish; this is a current permission, not an owner-only rule.

Products cannot be deleted through normal admin access. Unpublishing does not delete an old enquiry snapshot, rewrite demand history, release a stock hold or deactivate an SKU. If any of those business actions are needed, handle them deliberately in their own screens.

## 6. Product photos, specifications, datasheets and availability

### What the Catalogue Details editor accepts

**Catalogue Details** is a JSON editor, not a media picker or separate specification form. Preserve its structure and obtain technical help if JSON editing is unfamiliar. It accepts these fields:

| JSON path | Contract |
| --- | --- |
| `manufacturer` | Must be exactly `WIKA`; another manufacturer's content is not supported by this schema yet. |
| `image.src` | Local `/images/products/<filename>` path. Allowed extensions: `jpg`, `jpeg`, `png`, `webp`, `avif`. No remote image URL here. |
| `image.width`, `image.height` | Whole pixel dimensions between 1 and 10,000. These must describe the actual asset. |
| `image.alt.en`, `image.alt.ar` | Nonempty descriptive alternative text in both languages, maximum 300 characters each. |
| `image.sourceUrl` | Credential-free HTTPS evidence URL identifying the image source. |
| `specifications` | Array of up to 80 rows. Each row contains `label.en`, `label.ar` (up to 200 characters) and `value.en`, `value.ar` (up to 4,000 characters). |
| `availability` | Exactly `in-stock`, `out-of-stock` or `check`. |
| `availabilityReportedAt` | Real non-future date written `YYYY-MM-DD`. It dates the family-level report. |
| `datasheets` | Up to 20 entries, each containing a nonempty `title` (up to 200 characters) and a credential-free HTTPS `url`. |

The parser normalizes the allowed fields and strips unknown keys. Do not put credentials, private customer details, prices, warehouse counts or experimental properties in this object. The schema permits empty specification/datasheet arrays and permits Catalogue Details to be absent; passing its validation therefore does not by itself prove a complete product page.

### Adding or replacing a catalogue image

1. Confirm the exact model/family, source and permission to reuse the image. Use real approved manufacturer material for this catalogue.
2. Prepare a supported raster file with accurate dimensions and English/Arabic alternative text.
3. Have the technical maintainer add the asset to `public/images/products/` through the reviewed source/deployment process. This is not done through an admin **Upload** button, because no catalogue Media collection exists.
4. Verify the deployed `/images/products/<filename>` actually opens. A valid path string in JSON does not create the file or check that it exists.
5. Update `image` inside **Catalogue Details** in a product draft, preserving the other reviewed fields.
6. Follow owner review/publication, then inspect both public language pages.

This release intentionally keeps public manufacturer assets with website source files. It gives reproducible deployed assets but means nontechnical staff need a maintainer for new image files. Private enquiry photos cannot be copied into this role automatically; they are customer information with a separate access/retention policy.

### Updating technical rows or datasheets

1. Open the source manufacturer material for the exact model and check its revision and applicability.
2. Update the English and Arabic specification rows together. Retain minus signs, decimal values, units and model-family qualifiers.
3. Set the correct HTTPS document URL and a clear title. The older top-level **Datasheet Url** and the **Catalogue Details** `datasheets` array both exist; inspect the resulting product page so links remain consistent.
4. Keep source evidence in **Source Ref** and image provenance in `image.sourceUrl` as appropriate.
5. Save a draft and obtain owner publication review. Opening a PDF and confirming the correct model is a content check beyond URL syntax validation.

### Updating family-level availability

1. Obtain a dated business statement about that catalogue family/group.
2. In a product draft, update `availability` and `availabilityReportedAt` together.
3. Use `check` when confirmation is required; use a real date, never a future date or a rolling date that suggests a fresh warehouse count.
4. Review and publish through the owner workflow.

This does not alter SKU stock. Receiving, blocking, dispatching or confirming exact stock also does not update these public labels. A future policy that maps exact configurations to public family availability is still required before they can be linked safely.

## 7. Creating and maintaining exact SKU definitions

An SKU distinguishes the actual supplied configuration: for example a specific manufacturer part number, measuring range, connection and other order-defining attributes. Those attributes vary by instrument. A generic family name is insufficient where the warehouse holds several variants.

| Field label | Meaning |
| --- | --- |
| `Sku Code` | Required unique internal SKU code |
| `Product` | Required link to the catalogue product/family |
| `Manufacturer Part Number` | Optional schema field; record the actual number when available |
| `Configuration` | Required JSON describing the exact orderable configuration |
| `Active` | Checkbox, default true; controls new receipts and holds |

1. Owner: open **SKU definitions** or `/admin/collections/skus`.
2. Check whether the same configuration already exists.
3. Choose **Create New** and fill **Sku Code**, **Product**, known **Manufacturer Part Number** and **Configuration** using actual warehouse/purchasing evidence.
4. Review the values before saving. The code does not impose a measurement-specific schema inside Configuration or prove commercial completeness for you.
5. Save the definition. It starts with zero on-hand units. It does not copy the product's `in-stock` label into a count.
6. Use **Stock control** to record a documented receipt/opening quantity separately.

The SKU code, product relationship, manufacturer part number and configuration are immutable **from creation**, even before the first receipt. Correcting a mistaken identity means creating a new accurate SKU and deactivating the old definition. It is not safe to relabel existing units. A relationship object and its same numeric product ID are treated as the same identity; JSON object key order alone is not a changed configuration.

To retire an SKU, the owner opens it, clears **Active** and saves. Inactive SKUs remain in history. They cannot receive new stock or new holds, but existing holds can still be dispatched/released and documented adjustments, blocking/unblocking, counts and reconciliation remain possible. Deactivation does not automatically cancel a hold, remove stock or reassign units to the replacement SKU.

## 8. Working the enquiry inbox

Use `/admin/collections/enquiries` as owner or sales. The default list columns are **Reference**, **Company**, **Status**, **Source** and **Created At**. Opening a record shows submitted customer details and item snapshots. This is private customer information; keep exports/screenshots within the authorized business workflow.

### Read-only submitted facts

**Reference**, **Locale**, **Source**, **Name**, **Email**, **Company**, **Notes**, **Items**, **Verification Status**, **Verified At** and **Delivery Status** are immutable through ordinary admin updates. Inside **Items**, each submitted line retains **Product Id**, **Model**, **Name En**, **Name Ar**, **Quantity** and **Range**. Submitted quantities are whole numbers from 1 to 9,999; an enquiry can contain up to 100 lines. The hidden request/fingerprint fields support duplicate protection and are not everyday staff controls.

Changing the current product catalogue does not rewrite these snapshots. That is intentional: staff and reports need to know what the customer actually asked at submission time.

### The two editable fields

| Field | Values/use |
| --- | --- |
| `Status` | `new`, `reviewing`, `awaiting-customer`, `quoted`, `closed` |
| `Internal Notes` | Staff's operational notes, up to 10,000 characters |

The statuses are workflow labels. The code allows a permitted staff member to select any listed status; it does not enforce a staged sales approval sequence. Setting **quoted** does not generate a price, quotation PDF or email. Setting **closed** does not release holds or erase demand history.

### Suggested staff procedure

1. Open the enquiry and verify **Source**, **Verification Status** and **Verified At** before treating it as a confirmed customer request.
2. `Source = cms`, `Verification Status = verified` and a saved **Verified At** timestamp are required for stock allocation. `test-verified` is a test state, not genuine customer verification; demo-source records remain demo even if other fields appear verified.
3. Read the requested model, quantity and range. Compare the request with the actual manufacturer's options and the customer's accompanying notes/photos.
4. Change **Status** to `reviewing` while investigating and add concise **Internal Notes** describing actions and unresolved facts.
5. If clarification is needed, use `awaiting-customer` and record what is missing. Communication outside the website remains a separate authorized business action; the status does not send it automatically.
6. Once a quotation has actually been prepared through the agreed business process, use `quoted`. For a finished request, use `closed` and record the outcome.
7. Review any related holds separately before closing. A new hold cannot be created against a closed enquiry, but existing hold release/dispatch operates on the hold and does not automatically stop when the enquiry closes.

There is no staff **Create New enquiry** workflow and no editable button that honestly converts an unverified enquiry to verified. If the customer's original immutable line is wrong, document the correction and arrange a correct new request through an authorized workflow once intake is active. Do not rewrite historical quantities to make a stock allocation fit.

### Delivery state: use the queue, not the legacy field

The enquiry's **Delivery Status** currently has only the value `not-configured`, and staff cannot change it. This is a legacy field, not the current notification delivery ledger. Open **Notification queue** and inspect **Status**, **Attempts**, **Next Attempt At**, **Sent At**, **Provider Message Id** and **Last Error** for the matching **Reference**.

Notification statuses are `disabled`, `pending`, `processing`, `sent`, `failed`. Confirmation-mail queue statuses are `pending`, `processing`, `sent`, `failed`, `cancelled`. Both collections are read-only for owner/sales. A `sent` queue status means the provider accepted the message; it does not prove arrival in the recipient inbox or a completed sale. Do not reset attempts or manufacture a new date through database edits to force delivery.

The Enquiries collection currently contains the old description “Email delivery and stock reservation are not active yet.” Its stock-reservation statement is stale. Stock control is implemented, while current production email/intake activation remains off for the separate prerequisites explained above.

### Viewing a customer's technical photo

1. As owner/sales, open **Enquiry photos** at `/admin/collections/enquiry-attachments`.
2. Match **Enquiry** or **Reference** to the request being investigated. The default list shows filename, enquiry, byte count, expiry and download action.
3. Select **Download photo**. The protected endpoint downloads a file named `technical-photo.jpg` or `technical-photo.png`; the submitted filename remains metadata in the admin record.
4. Handle the downloaded file as private customer information. The application does not control retention of copies that staff download.

The implemented upload workflow accepts up to three reconstructed JPEG/PNG files per genuinely verified enquiry, each up to 2 MiB, and limits source decoding to eight million pixels. Live application access ends after 30 days. Expiry denies download immediately; physical cleanup depends on the retention worker. No PDF, Excel, SVG, video or general-document upload/scanning workflow is active. In the current disabled-intake state, do not promise a customer that they can complete verification/upload today.

## 9. Reading stock control before changing anything

Open `/staff/inventory` with an owner, sales or warehouse account. Begin in **Choose the exact SKU**:

1. Type a code or model in **Find a SKU or model**. The search refreshes automatically after a short delay.
2. Select the exact entry from **SKU**. Inactive entries are marked `(inactive)`.
3. Expand **Review configuration for …**. Confirm the configuration before allocating or recording units.
4. Read **On hand**, **Held**, **Blocked**, **Available** and the ledger-consistency message.
5. Review **Physical count review** and its last explicit confirmation time.
6. Use **Refresh balance** when another colleague may have made changes.

| Balance | Plain-language meaning |
| --- | --- |
| On hand | Physical units represented by receipts, adjustments and dispatch movements |
| Held | Unconsumed units allocated by unexpired active reservations |
| Blocked | Physical units kept out of allocation, for example during inspection |
| Available | On hand minus active held units minus blocked units |

Expired holds stop reducing **Available** immediately. An expiry ledger entry can follow later; the screen explains any pending expired units. Counting those units as available is intentional and does not mean they were dispatched.

The screen displays up to 100 matching SKUs, the latest 100 matching eligible enquiries, up to 100 reservations with active holds first, and the latest 100 ledger entries. Refine searches rather than assuming an item does not exist outside those bounds. Older reservations and movements are available in the corresponding read-only admin collections.

The stock view does not show a manufacturer part number as a separate visible value; it shows the code, linked model and Configuration JSON. If the part number is needed for a check, open the SKU definition too. The saved hold snapshot contains code, product ID, model and configuration; it does not add a separate part-number field.

### Rules shared by every stock action

In **Record a stock action**, choose the action under **Action**, complete its specific fields and fill **Reason or supporting document reference**. That reason is required, trimmed, nonempty and limited to 1,000 characters. Prefer concrete receiving/dispatch/count/inspection references that another staff member can trace.

Quantities are whole units. Ordinary action quantities are 1–999,999; adjustments may be negative but cannot be zero. Physical confirmation accepts 0–999,999,999. The maximum supported on-hand balance is 999,999,999. There is no fractional-unit, unit-conversion or valuation feature in this ledger.

The successful response states the saved action and its **Audit entry** number. Read the changed balance and the latest audit row after each action. A reasoned entry is permanent: correct mistakes with another authorized movement, not by editing/deleting old entries.

### If an action times out

Do not repeatedly start new copies of the action. The screen retains the original command and unique request key in the current tab's session storage, tied to the staff account. **Confirm an unfinished action** shows **Retry original action**. Use that button without changing the retained details; an accepted repeat returns the original movement and says no duplicate was created.

A definite client/permission validation rejection clears the pending command so the form can be corrected. Network/server uncertainty retains it because the transaction might already have committed. If the tab/session storage was lost, check the audit trail before recreating the operation. A different actor or altered details cannot reuse the same accepted request key.

## 10. Stock procedures, one action at a time

All figures in the examples below are invented training arithmetic. Do not enter them as EL AMAL's actual opening stock.

### Record a receipt — owner or warehouse

1. Confirm the exact physical SKU and receiving document; the SKU must be active.
2. Select **Record receipt** in **Action**.
3. Enter the number of units physically received in **Quantity**.
4. Fill **Reason or supporting document reference**, such as the actual supplier receipt reference and receiving explanation.
5. Choose **Record receipt** and verify the increased **On hand** and corresponding audit entry.

Example: receiving five units adds five to On hand and Available when no other action occurs. Creating an SKU alone does not do this. For initial loading, agree and document the physical opening count with the owner before recording receipts; do not invent supplier receipt numbers.

### Record an adjustment — owner or warehouse

1. Compare the actual counted quantity with the ledger and establish the cause of the discrepancy.
2. Select **Record adjustment**.
3. In **Signed change (use a negative number for a reduction)**, enter the difference, not the new total. If the ledger shows ten and the supported physical total is eight, enter `-2`.
4. Record the actual count/correction evidence in the reason.
5. Choose **Record adjustment** and review the resulting balance and audit trail.

An adjustment cannot make the balance negative or consume units already held or blocked. It does not silently cancel commitments. If the count conflict affects committed units, resolve the underlying hold/block situation with authorized staff and preserve the reason. Adjusting does not count as **Confirm physical count**; confirm separately after the correct total is established.

### Create a hold — owner or sales

1. Confirm the exact SKU configuration and current available balance. Review the physical-count policy message first.
2. Select **Create hold** and enter **Quantity**.
3. Use **Find a verified enquiry** to search the actual **Enquiry reference**, then select it from **Verified enquiry**.
4. Select **Requested line**. The list shows model, submitted quantity and range where supplied.
5. Compare that range and the required connection/options to the SKU configuration yourself. The application checks the catalogue product identity, or case-insensitive exact model name for a `customer-specified` request; it does not understand range compatibility, substitute models or technical equivalence.
6. Choose the agreed **Hold expires (your local time)** value. It must be in the future and within 30 days. The browser converts this local time to UTC. Check the computer's timezone; this field is not automatically forced to Cairo time.
7. Add the reason/agreement reference and select **Create hold**.
8. Record the generated hold reference and check the **Reservations** table. The original quantity, expiry and configuration snapshot are retained.

A hold increases Held and decreases Available while leaving On hand unchanged. It requires a genuinely verified, open, CMS customer enquiry with a saved verification time. A test or demo record does not qualify. Across all SKUs allocated to the line, active held quantity plus already dispatched quantity cannot exceed the submitted line quantity.

The 30-day maximum is a technical bound, not a default commercial promise. There is no automatic 48-hour hold, automatic allocation or substitution. There is no edit-expiry button. If an expiry needs changing, review and release the remaining hold, then create a new hold with a new explicit expiry if the request and availability still permit it.

### Release all or part of a hold — owner or sales

1. Select the SKU, then **Release hold**.
2. Select the right **Active reservation**, checking its remaining units and enquiry reference.
3. In **Quantity to release**, enter the number actually being freed. It may be less than the remaining hold; it cannot exceed it.
4. Enter the reason, then select **Release hold**.
5. Verify Held decreased, Available increased and On hand stayed unchanged. Check the reservation's **Released** total.

A partial release leaves the remainder held until the original expiry. Releasing the final remaining unit closes the reservation. A released unit may be allocated again to the enquiry if total outstanding plus dispatched quantity permits it. Release is not a physical shipment or a stock write-off.

### Dispatch all or part of a hold — owner or warehouse

1. Confirm the actual physical shipment, exact configuration and dispatch document.
2. Select **Dispatch hold** and choose the correct **Active reservation**.
3. Enter only shipped units in **Quantity to dispatch**.
4. Include the dispatch document reference in **Reason or supporting document reference**.
5. Choose **Dispatch hold**, then verify On hand and Held both fell by the shipped amount and the reservation's **Dispatched** total increased.

Available usually stays unchanged for this operation because the dispatched units were already held. Remaining units stay held at the original expiry. Dispatching the final remaining unit closes the hold. After expiry, dispatch is rejected; review a new valid allocation before shipping rather than backdating the event.

Already dispatched quantities continue to count toward the original enquiry line after its remainder is released or expires. This prevents the same requested units being allocated twice. There is no standalone unreserved dispatch action, shipment reversal button, return authorization or credit-note module. A returned unit needs a documented stock process and an explicit decision about the customer's remaining requirement; do not assume a receipt reverses historical dispatch demand.

### Block stock — owner or warehouse

1. Confirm why specific available units must be unavailable for allocation, for example an actual inspection hold.
2. Select **Block stock** and enter **Quantity**.
3. Add the supporting reason/reference and choose **Block stock**.
4. Check Blocked increased and Available fell while On hand stayed unchanged.

You cannot block units that are already held or block more than Available. Blocking is an aggregate SKU balance, not a separate lot, serial-number or inspection-case record. Include enough detail in the reason to explain the business evidence.

### Unblock stock — owner or warehouse

1. Confirm the inspection/release decision.
2. Select **Unblock stock**, enter the quantity and record the evidence.
3. Choose **Unblock stock** and check Blocked decreased and Available increased. On hand stays unchanged.

The quantity cannot exceed the SKU's current blocked balance. Unblocking does not create units and does not create a customer hold.

### Confirm a physical count — owner or warehouse

1. Count **all** on-hand units for the exact SKU, including held and blocked units.
2. Compare the count with the displayed **On hand**. Investigate differences first; use a documented adjustment only when justified and permitted.
3. Select **Confirm physical count**.
4. Enter the full **Physical on-hand count**, including zero if zero is the verified count.
5. Enter the actual count/review reference and choose **Confirm physical count**.
6. Check the new confirmation timestamp under **Physical count review** and the audit row's **Physical count** value.

Confirmation records a review; it does not change balances. A mismatching count is rejected. Receipts, adjustments, dispatches and reconciliation do not pretend a full count took place.

### Reconcile ledger — owner, sales or warehouse

1. Select the SKU and read the consistency message.
2. If totals agree, select **Reconcile ledger**, enter the reason and run it to record a review and materialize up to 100 due expiry entries for that SKU.
3. Review **Stock audit trail** and the resulting balance.

Reconciliation compares movement totals against immutable reservations and consumption events. It does not compare against an unentered warehouse count or silently fix corrupted data. If the screen says **Ledger totals disagree**, the action form is disabled, including reconciliation. The service also rejects mutations on inconsistent history. Ask the owner/technical maintainer to investigate; simply clicking Reconcile is not a repair mechanism.

### Expired holds

An expired hold releases only its unconsumed remainder. Shipment and release totals already recorded stay intact. Availability stops counting the hold as soon as expiry is reached, even if the worker is delayed. The next stock action or maintenance worker can record its expiry event. Such events use actor role `system`, no staff actor and the fixed reason `Hold expiry reached; availability released automatically`.

The scheduler's expiry work is bounded and may skip a busy SKU. This does not extend the reservation's commercial validity. Neither an expired nor closed reservation can be selected for a new release/dispatch. A partially dispatched reservation can end in state **Expired** while its **Dispatched** column still correctly shows previously shipped units.

### Optional freshness policy

The stock screen always shows the latest explicit count confirmation. An optional environment setting, `INVENTORY_FRESHNESS_HOURS`, can require a recent count before **Create hold**. It accepts a whole number from 1 to 8,760 hours. There is no default and no admin text box that sets this policy.

When unset, the screen says the interval has not been configured and permits manual-review allocation. When configured, unconfirmed/stale stock blocks new holds until the owner/warehouse confirms a count. An invalid setting blocks new holds with a service error. Existing hold dispatch/release and corrective actions remain available. Exactly reaching the configured age is stale. The owner must choose the real operating interval before a maintainer configures it; do not infer a 48-hour policy from an old proposal.

### Worked example: understand the arithmetic

Assume a training SKU has twelve physically received units and a real qualifying enquiry asks for six:

| Training action | On hand | Held | Blocked | Available |
| --- | ---: | ---: | ---: | ---: |
| Receive 12 | 12 | 0 | 0 | 12 |
| Block 2 for inspection | 12 | 0 | 2 | 10 |
| Hold 6 against the enquiry | 12 | 6 | 2 | 4 |
| Dispatch 2 from the hold | 10 | 4 | 2 | 4 |
| Release 1 from the hold | 10 | 3 | 2 | 5 |
| Remaining 3 expire | 10 | 0 | 2 | 8 |
| Unblock the inspected 2 | 10 | 0 | 0 | 10 |

The original hold remains six units: two dispatched, one released, three expired. The enquiry's already shipped quantity remains two. A physical count confirmation would enter ten, not Available at an earlier step. This is arithmetic illustration only, not a stock-loading instruction.

## 11. Demand reporting and CSV exports

Owners and sales open `/staff/reports` or **Open demand reports**. Warehouse and catalogue-editor accounts cannot access it. The report counts saved enquiry demand; it does not measure website visitors, sales revenue, stock shortages, quotation acceptance or purchases.

### Run a report

1. Under **Choose the view**, set **From** and **Through**. Dates are inclusive Cairo calendar dates, including daylight-saving handling. The default is the last 30 days including today.
2. Choose **Enquiry group**: **Customer enquiries**, **Verified customers**, **Unverified customers**, **Test verification only**, **Demo only**, or **All groups, shown separately**.
3. Optionally enter **Model contains** and **Range contains**. These are literal case-insensitive substring filters on the displayed privacy-safe labels.
4. Choose **Groups per page** (normal choices: 25, 50 or 100) and select **Apply filters**.
5. Read **Saved demand** totals and **Demand by model and range**. Use **Previous page**, **Next page** or **Reset filters** as needed.

The date range may contain at most 93 calendar days, must begin in 2000 or later, and cannot end in the future. **Model contains** accepts up to 120 characters and **Range contains** up to 160; control characters are rejected.

### Interpret the numbers correctly

| Label | Meaning |
| --- | --- |
| `Enquiries` | Distinct matching saved submissions in the selected view |
| `Requested units` | Sum of quantities on matching submitted lines |
| `Verified customer enquiries` | Distinct matching customer submissions with verified state and a stored verification timestamp |
| Table `Requests` | Distinct enquiries containing that model/range/group combination |
| Table `Units` | Sum of matching line quantities in that group |

Rows are sorted by requested units, highest first. An enquiry containing several different lines can appear in several rows. Add row Units when you mean units; do **not** sum row Requests and call the result distinct enquiries. Two matching lines from the same enquiry contribute their quantities but only one request to that same row.

Date filtering uses original submission time, while verification group uses the current saved verification state. Therefore a report for last week can change its verified/unverified split when a customer verifies later. Closed enquiries remain historical demand. A `verified` status without a verification timestamp belongs to unverified demand. `test-verified` is separate; demo-source records stay in the demo group. The default Customer enquiries view excludes test and demo records.

### Why some labels are generalized

For submitted catalogue lines, model names come from the original snapshot, not the current product record. Direct customer requests can contain arbitrary identifying text, so their model is shown as **Customer-specified model**. Searching the customer's typed model will not recover that hidden raw value in the report.

Only a narrow numeric measurement expression is displayed as a range, for example `0–10 bar` or `-20 to 80 °C`. Other free text becomes **Range requires staff review**; an empty range becomes **Range not specified**. The same range filtering applies to catalogue lines as well as direct requests. Similar expressions stay separate; the report does not convert psi to bar or merge equivalent units/ranges.

Open the private enquiry inbox when original details are needed. The report deliberately omits customer names, emails, company names, notes, attachments, request references and database IDs. It does not identify exact SKUs and cannot calculate a shortage from the public family availability labels.

### Download CSV

1. Apply and review the intended date/group/model/range filters first.
2. Choose **Download CSV** beside **Demand by model and range**.
3. Open the downloaded file in a trusted spreadsheet application. Its filename follows `el-amal-demand-YYYY-MM-DD-to-YYYY-MM-DD.csv`.
4. Check the period and filters before sharing. Even privacy-reduced aggregate demand remains private business information.

CSV exports every matching group across all pages, not just the visible page. Its exact columns are **From (Cairo)**, **Through (Cairo)**, **Model**, **Range**, **Enquiry group**, **Requests**, **Units**. It has a UTF-8 byte-order mark for Unicode/Arabic handling. Formula-leading text is escaped; a negative temperature range can intentionally begin with an apostrophe so a spreadsheet treats it as text.

The download button appears only for 1–2,000 matching groups. Above 2,000, narrow filters; the endpoint refuses an oversized export rather than truncating it. Independently, no report processes more than 20,000 source lines in its selected date period. That cap is checked before group/model/range filtering, so a shorter **date period** is needed when the source-line cap is exceeded. A no-data screen contains no demo/filler statistics.

### Technical contract and rationale

`GET /api/staff/demand-report` accepts `start`, `end`, `cohort`, `model`, `range`, `page`, `pageSize` and `format`. The cohort values are `customers`, `verified`, `unverified`, `test`, `demo`, `all`; format is `json` or `csv`. API page size can be 1–100 and page 1–20,000. Duplicate/unknown parameters, invalid dates and oversized filter strings are rejected.

The service performs a read-only repeatable-read database transaction with a persisted role check. It reads immutable enquiry snapshots and never joins current catalogue names, writes stock or sends mail. JSON, CSV and error responses carry private/no-store and noindex protections. Its eight-second statement timeout and source/export limits bound work and prevent apparently complete totals from silently containing partial data.

## 12. Staff account administration and recovery limits

### Add an account — owner

1. Open `/admin/collections/staff` and check that the intended account does not already exist.
2. Choose **Create New**.
3. Enter **Email**, **Password**, the matching **Confirm Password** where the authentication form requests it, and **Role**.
4. Choose one of `owner`, `catalogue-editor`, `sales`, `warehouse`. The default is `catalogue-editor`; do not leave it by accident if the person's role is different.
5. Use a unique password/passphrase of 15–128 characters. Repeated-character and several common long passwords are rejected. A simple increase in length alone is not a reason to share or reuse a password.
6. Save, then arrange secure credential handover through the team's chosen private process. The application does not currently provide a functioning welcome/invitation/recovery-email onboarding flow.
7. Have the staff member sign in and check only the capabilities required for their job.

### Change a role or password — owner

Open the existing account, verify the email identity, change **Role** or use **Change Password**, complete the required password confirmation and save. Normal staff updates, including ordinary password/profile changes, are owner-only in the collection access rules. Do not promise that a non-owner can save an ordinary self-service profile/password edit just because an **Account** screen is visible.

Newly set passwords must satisfy the current 15–128 character rule. Existing older passwords were not automatically changed by that rule. The project record states that the existing owner password has not been rotated; this handbook does not reproduce it or certify its strength.

Avoid changing the last available owner's role away from owner. The source does not implement a last-owner safeguard. If all owner access is lost, a trusted technical recovery operation is required; the public first-register endpoint is deliberately blocked.

### Removing access is not yet a normal disable switch

Staff records have no **Active**, **Disabled** or equivalent revocation field, and normal deletion is denied. Moving someone to catalogue editor still leaves administration and catalogue privileges; it is not a full revocation. A complete offboarding/session-revocation procedure needs an authorized technical operation and verification. Do not describe a role change as deleting an account or promise that every previous browser session was terminated.

### Forgot password and future activation

**Forgot password?** may appear as part of Payload's authentication interface, but the application route currently returns **Staff recovery unavailable** unless all recovery configuration is ready. Do not instruct staff to expect a reset email today.

After explicit activation and verification, the implemented recovery design uses same-origin JSON requests, request limits, neutral account-existence responses, a 30-minute reset-token expiry, a ten-minute minimum reissue interval and a database lock preventing concurrent successful reuse of the same reset token. The dedicated staff adapter sends directly through the configured provider; it is distinct from the scheduled customer confirmation/notification queues. Production activation remains pending, and no real email-delivery outcome was demonstrated by writing this handbook.

## 13. Common problems and what the operator should do

| Message or symptom | Meaning | Correct next step |
| --- | --- | --- |
| `Administration unavailable`, `Stock control unavailable` | CMS gate/configuration or service unavailable | Ask the technical maintainer to check the environment; do not create a new production database or owner. |
| Stock/report page asks you to sign in after login | Wrong role, missing/expired session or wrong host | Confirm the host and account; sign in with the authorized role. A visible navigation link does not override access. |
| No matching SKUs | No definitions exist or search is too narrow | Production's last check had zero real SKU definitions. Owner must define genuine configurations; do not infer units from catalogue labels. |
| Product publication rejected with `Only the owner can publish reviewed products.` | Account lacks owner role | Save a draft and have the owner review/publish. |
| `Publication requires reviewed English and Arabic content, source evidence and asset rights.` | Required publication evidence is incomplete | Check both language names/descriptions, Source Ref, reviewer, date and Rights Confirmed. |
| Catalogue Details validation error | Invalid JSON shape/path/dimensions/bilingual values/date/link | Correct the relevant field against section 6. A remote URL belongs in sourceUrl, not image.src. |
| Product image still missing after valid save | Image path exists only as text, or wrong deployed file | Verify the actual deployed asset with the maintainer; the JSON validator does not upload files. |
| Published product does not show a new draft edit | Draft and public versions are separate | Owner must review and publish the changes; do not repeatedly create duplicates. |
| SKU identity is immutable | Existing definition was relabelled | Restore its original identity; create a new accurate SKU and deactivate the old one if needed. |
| `Activate and review this exact SKU before receiving stock or creating a hold` | SKU is inactive | Owner reviews Active state. Do not reactivate merely to bypass a legitimate retirement. |
| No eligible enquiry in hold selector | Not CMS, not genuinely verified, missing timestamp, closed, outside latest 100, or search mismatch | Check the private enquiry record and refine reference search. Do not fake verification. |
| SKU does not match selected enquiry line | Different product identity or direct model text mismatch | Review the line and exact SKU. The software does not infer substitutes. |
| `Held and dispatched quantities would exceed this enquiry line` | Requested quantity already allocated/shipped across one or more SKUs | Review all holds/dispatches for the line; release only genuinely unneeded remaining holds. |
| `Insufficient available stock` | Hold quantity exceeds On hand − Held − Blocked | Recheck balance/configuration; obtain a real receipt or revise the allocation. |
| Action would consume held or blocked stock | Adjustment would undercut committed units | Investigate count and commitments with owner/sales/warehouse. Do not delete reservations. |
| `This action exceeds available or blocked stock` | Too much blocked or unblocked | Check current Available and Blocked balances; enter the actual supported quantity. |
| Physical count does not match ledger | Full physical total differs from computed On hand | Investigate and document a justified adjustment before confirming. |
| Current count required before a hold | Freshness policy exists and confirmation is stale/missing | Owner or warehouse counts and confirms; reconciliation is not a substitute. |
| Freshness policy invalid | Environment setting outside its allowed format/range | Owner chooses policy; technical maintainer corrects configuration. |
| Reservation already released/dispatched/expired | No live remaining hold | Refresh and inspect its original, shipped, released and expired columns; do not backdate. |
| Quantity exceeds remaining held units | Partial action is larger than the remainder | Refresh and enter only actual supported units. |
| Ledger totals disagree/reconciliation failed | History is internally inconsistent | Stop stock writes, preserve evidence and ask owner/maintainer to investigate with backup protection. |
| Uncertain action or temporary inventory failure | Request may have committed despite missing response | Use Retry original action with the retained request key. |
| Enquiry Delivery Status remains not-configured | Legacy immutable field | Consult the matching Notification queue; current real sending remains disabled. |
| Download photo returns Not found | Unauthorized, invalid ID, expired/unreadable photo or unqualified enquiry | Confirm owner/sales session and metadata; ask maintainer if still within retention. The response intentionally does not disclose which private condition occurred. |
| Report has no rows | No demand matches selected dates/groups/visible labels | Reset filters; include test/demo only if those are intentionally being investigated. |
| Report request count differs from sum of row Requests | Same enquiry occurs in several groups | Use Enquiries total for distinct submissions. |
| CSV button missing | No rows or more than 2,000 groups | Narrow filters when oversized; do not interpret absent export as lost data. |
| Too many enquiry lines | Date period exceeds source limit | Shorten date period; a model filter alone cannot avoid this pre-filter cap. |
| Staff recovery unavailable | Activation prerequisites absent | Owner-assisted account support; do not promise email delivery or expose reset links. |

## 14. How the stock implementation protects the business record

Every stock change is an append-only movement. A reservation preserves its original SKU snapshot, quantity, customer line, expiry, operator and reason. Partial releases/dispatches add movements rather than overwriting that original promise. The reservation's current state is calculated from these facts. That design supports later investigation of who received, held, shipped, freed or blocked units.

The service uses one PostgreSQL transaction/connection for its reads, locks and writes. A request-key lock prevents duplicate retry recording, an SKU lock prevents simultaneous stock changes from overselling the same balance, and a separate enquiry lock prevents different SKUs over-allocating the same requested line. A unique closure key permits one final reservation closure while allowing partial consumption records beforehand. Errors roll back the transaction.

All inventory collections deny ordinary create/update/delete access; hooks also reject trusted Payload local writes. Privileged raw database operators still have capabilities beyond these application restrictions. Investigation or repair must preserve a backup and the immutable business explanation; this is not authority to edit production history to make a number look right.

The private API is `GET`/`POST /api/staff/inventory`. Reads accept `skuId`, `skuSearch`, `enquirySearch`; writes require same-origin JSON, an authenticated staff session, an action-specific role, a unique UUID request key and the validated action fields. The browser manages that key automatically. A new accepted movement returns 201; an identical accepted retry returns 200. Old API release/dispatch callers without a quantity consume the full remaining hold; the current UI always asks for the explicit partial/full quantity.

This is a single aggregate balance per exact SKU. It is not a purchase-order, multi-warehouse, lot/serial, valuation, invoicing, payment or automated replenishment system. Those features cannot be inferred from a correct stock ledger.

## 15. Evidence, limitations and source index

The following current discrepancies are documented rather than silently corrected in application code:

- Enquiries admin helper text still says reservations are inactive; inventory functionality now exists.
- Enquiry **Delivery Status** remains an immutable legacy `not-configured` value. Notification/verification queues are the implementation's delivery state.
- No catalogue Media collection or product-upload screen exists. Product media requires reviewed deployed files and Catalogue Details JSON.
- SKU definitions are readable by all staff, including catalogue editors; stock quantities and movement history are restricted to owner/sales/warehouse.
- Product unpublication is permitted to catalogue editors. Owner-only publication does not mean every public-content change is owner-only: categories have direct editable content too.
- Account deletion/full disable and last-owner protection are not implemented. Payload's separate default unlock access is broader than owner-only account editing.
- The inventory view/snapshot does not provide a separate manufacturer-part-number value, although SKU definitions store one.
- Broad historical paragraphs in the older catalogue-publication and progress documents describe earlier disabled functionality. Use the current milestone and checked source for today's scope.
- New/changed staff passwords have a stronger rule, while a pre-existing password may still be weaker. This task did not rotate it or inspect secret values.

No live staff mutation, product edit, SKU creation, enquiry, photo upload, stock movement, email, reset, scheduled job or deployment was performed for these chapters. The examples establish how the source behaves, not actual EL AMAL stock or customer demand. Exact commercial stock definitions, opening quantities, expiry agreements, freshness policy and final visual/business acceptance still require the owner's actual inputs. Monitoring remains deferred.

| Source | Evidence supplied |
| --- | --- |
| `src/payload.config.ts` | Admin user collection, dashboard links, configured collections; absence of Media; PostgreSQL and email adapter integration |
| `src/cms/collections.ts` | Staff roles/auth, category/product/SKU fields, owner publication hook, access rules |
| `src/lib/access.ts` | Staff role helper and required product review evidence |
| `src/lib/sku-identity.ts` | Immutable SKU identity from creation |
| `src/lib/catalogue-details.ts` | Exact image/specification/availability/datasheet JSON validation |
| `src/content/product-options.ts` | Instrument/application option labels |
| `src/lib/public-catalogue.ts` | Explicit public projection, eligible categories/products and safe links |
| `src/lib/load-catalogue.ts` | Current published reads, request freshness and no demo fallback in CMS mode |
| `src/app/(site)/[locale]/products/[slug]/page.tsx` | Numeric CMS product identifier used as public route slug |
| `src/cms/enquiries.ts` | Immutable submitted facts, editable status/notes and stale helper/legacy delivery field |
| `src/cms/notifications.ts`, `src/cms/verification-emails.ts` | Queue labels, status values and owner/sales read-only access |
| `src/cms/delivery-operations.ts` | Owner-only maintenance collection |
| `src/cms/verification.ts` | Hidden server-only verification/request-limit records |
| `src/cms/attachments.ts`, `src/components/admin/attachment-download.tsx` | Enquiry photo metadata, protected download link and access |
| `src/lib/attachment-service.ts`, `src/lib/enquiry-attachments.ts` | Qualified photo storage/read, reconstruction, retention, quota and encryption |
| `src/app/(frontend)/api/staff/enquiry-attachments/[id]/route.ts` | Safe private download response and generic denial |
| `src/components/inventory-console.tsx` | Exact visible action/field labels, role action lists, pending retry and tables |
| `src/components/inventory-admin-link.tsx`, `src/app/(staff)/staff/layout.tsx` | Dashboard/staff navigation text and routes |
| `src/app/(staff)/staff/inventory/page.tsx` | Staff inventory entry gate |
| `src/cms/inventory.ts` | Read-only reservation/movement fields and append-only hooks |
| `src/lib/inventory.ts` | Action permissions, request validation, fingerprint and quantity bounds |
| `src/lib/inventory-service.ts` | Transaction locks, balance/expiry/partial actions, freshness, eligibility and reads |
| `src/lib/inventory-http.ts` | Inventory API guards, statuses and retry-safe errors |
| `src/app/(staff)/staff/reports/page.tsx`, `src/components/demand-report-view.tsx` | Report entry gate and exact filter/table/export labels |
| `src/lib/demand-report.ts` | Query validation, cohorts, privacy labels, arithmetic and CSV escaping |
| `src/lib/demand-service.ts`, `src/lib/demand-http.ts` | Persisted role check, snapshot-only report query, bounds and private responses |
| `src/lib/staff-security.ts`, `src/lib/staff-recovery.ts`, `src/lib/staff-reset-lock.ts`, `src/lib/staff-email.ts` | Password validation, recovery gate, concurrency and provider adapter |
| `src/app/(payload)/api/[...slug]/route.ts` | CMS gate, blocked first registration and dedicated recovery routing |
| `node_modules/payload/dist/utilities/formatLabels.js` and field/collection sanitizers | Generated field/collection labels verified from installed dependency |
| `node_modules/@payloadcms/translations/dist/languages/en.js` and UI SaveDraft/Select components | English standard buttons, raw select-option labels and draft action semantics |
| `node_modules/payload/dist/auth/defaultUnlockAccess.js`, `auth/operations/unlock.js` | Separate default staff unlock permission |
| `PROGRESS.md` current milestone | Recorded live release, catalogue counts, zero exact SKU definitions, inactive intake/recovery and deferred monitoring |
| `docs/inventory-operations.md`, `docs/demand-reporting.md`, `docs/private-enquiry-photos.md` | Supporting runbooks, cross-checked with implementation |
| `docs/catalogue-publication-2026-09-28.md` | Historical catalogue evidence and folder-derived availability interpretation; historical activation paragraph is superseded |

