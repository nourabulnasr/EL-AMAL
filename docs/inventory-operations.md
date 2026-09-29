# Private stock and reservation operations

Open `/staff/inventory` after signing in to Payload administration. The dashboard link opens the same page. The stock screen uses the current private SKU definitions, never model-level catalogue availability. A newly created SKU has a zero balance until warehouse staff or the owner records a documented physical receipt.

## Responsibilities

| Role | Allowed actions |
| --- | --- |
| Owner | Define SKUs; receipt, adjustment, hold, release, dispatch, reconciliation; read audit history |
| Warehouse | Receipt, adjustment, dispatch, reconciliation; read private stock history |
| Sales | Hold, release, reconciliation; read private stock history |
| Catalogue editor / anonymous | No inventory reads or writes |

Only the owner can create or deactivate a SKU. Its code, product, manufacturer part number and configuration are immutable from creation, preventing an edit from relabelling existing stock or racing the first receipt. Create a new SKU for a corrected or different physical identity and deactivate the previous definition. Each SKU must describe a genuinely orderable configuration and link to its catalogue product. Review its manufacturer part number and configuration before creation. Model-level availability labels are not quantities and are never imported as stock.

## Daily workflow

1. Find the exact SKU. Check its configuration and current balance.
2. For a delivery, select **Record receipt**, enter the physical whole-unit quantity, and put the supplier receipt or warehouse document reference in the reason.
3. For a correction, select **Record adjustment** and enter a signed difference. For example, correcting ten units to eight means `-2`. An adjustment cannot make stock negative or consume units committed to unexpired holds. Corrections add audit events; they do not rewrite old entries.
4. To allocate units, sales or the owner selects **Create hold**, a verified open customer enquiry, the matching requested line, quantity, and an explicit expiry in local time. The expiry must be in the future and within 30 days. The system converts it to UTC. No default commercial hold period is imposed.
5. Check the exact SKU configuration and the customer's requested range before creating the hold. Catalogue enquiry lines are matched by product identity. Direct model requests match the catalogue model exactly, ignoring case; other direct model names require a reviewed matching request before stock can be held.
6. **Release hold** makes the full held quantity available. **Dispatch hold** removes the full held quantity from physical stock. Include the dispatch document number in the reason. Partial dispatch is intentionally unsupported; create appropriately sized holds for separate shipments. Dispatch after expiry is rejected.
7. **Reconcile ledger** verifies the physical movement total against reservations, materializes up to 100 due expiry events, and records the operator and reason. It never silently changes a balance to match a count. Investigate mismatches before additional stock changes.

The screen shows up to 100 SKU search results, the latest 100 matching verified enquiries, 100 reservations with active holds first, and the latest 100 ledger entries. Refine SKU/enquiry searches as necessary. All historical records can be browsed through the read-only Payload collections.

## Retries and expired holds

Every command has a unique request key and a fingerprint bound to its actor and exact normalized details. A repeat returns the original result. Reusing an accepted key with different details or another actor returns a conflict. The UI keeps uncertain actions in the current tab's session storage and retries the original payload; it does not invent a new key after a timeout. A definite validation or permission rejection unlocks the form.

An expired hold stops consuming availability immediately, even when the scheduler is delayed. The worker or next stock action materializes one immutable expiry event. System expiry records have `actorRole=system`, a null staff actor, a fixed explanation and a timestamp; staff events retain the actual staff ID and role. A unique terminal-event index prevents multiple releases/expirations/dispatches for a reservation.

## Engineering and recovery

Private endpoint: `GET` / `POST /api/staff/inventory`. GET accepts optional `skuId`, `skuSearch`, and `enquirySearch`; it does not expose customer contact details. POST requires same-origin JSON, authenticated Payload staff, and the action-specific role. The service revalidates the persisted staff role inside its transaction. Direct Payload REST/admin create/update/delete operations on both inventory collections are denied, and hooks prevent even trusted local API changes. Privileged database maintenance remains an operator responsibility.

Each mutation holds a PostgreSQL transaction lock on its request key and SKU. Holds additionally lock the enquiry so allocations across different SKUs cannot exceed the selected line. The reservation, stock movement, and audit details commit together on one connection. A dispatched quantity remains counted against the enquiry line, so the same requested units cannot be allocated again after shipment. Inactive SKUs cannot receive stock or new holds; existing holds can still be released/dispatched, and documented corrections remain possible.

The scheduler calls `expireInventoryHolds(payload,{deadlineAt,maxItems})`. The helper bounds the batch to 100 expiry events, skips a busy SKU and checks the deadline between transactions. Database statement timeout is eight seconds and lock timeout is three seconds; a query already in flight may finish after the soft deadline. The worker has no public inventory endpoint. Scheduler authentication is owned by the existing operations runner.

Application-level reconciliation compares on-hand movements, open reservation totals and ledger reservation deltas. A discrepancy blocks stock mutations with an explicit error. Investigate using the ledger and reservation snapshots; do not edit or delete history to make the screen agree. Back up the database before privileged repair. No stock data or opening balance is created during deployment.

## Regression command

After registering the collections, generating types and applying the reviewed additive migration **to the isolated development database only**:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=384 --v8-pool-size=1'
node --env-file=.env.local --env-file=.env.development.local --experimental-strip-types scripts/check-inventory.ts
```

The development environment must set `CMS_DATABASE_CHECK=development`. The script creates an empty isolated schema cloned from the migrated development structure, including its indexes, checks and foreign keys. It then creates uniquely named temporary staff, product, category, SKU and verified enquiry fixtures inside that schema. It tests retries, concurrency, overselling, enquiry-line allocation, lifecycle changes, drift reconciliation and actual Payload collection permissions. A `finally` block removes exact fixtures and drops only that invocation's isolated schema, including on test failure. No worker-wide scan touches the real development tables. If the process is forcibly killed, find the `inventory_test_` schema belonging to the interrupted run and reconcile its leftovers before rerunning; never bulk-delete stock tables.

Unit/HTTP/access checks need no database:

```powershell
node --experimental-strip-types tests/inventory.test.mjs
```
