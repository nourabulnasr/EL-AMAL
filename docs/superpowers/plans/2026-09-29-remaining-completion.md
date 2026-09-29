# Remaining website work

Continue the approved EL AMAL design and existing architecture. The client has authorized completing unfinished work and updating the live client review website. Catalogue entries and operational quantities remain distinct. No guessed sender identity, quantities, business facts, or service subscription.

## Implementation

- [x] Close inventory gaps: partial dispatch/release, blocked balances, optional explicit stock review policy, append-only audit and concurrent request safety.
- [x] Add private, bounded sales-demand aggregates and CSV exports. Only owner/sales may read them. Exclude personal/customer-entered free text from reports.
- [x] Reduce demonstrated public page costs without changing the approved intro/design or delaying publication changes.
- [x] Establish a standard encrypted PostgreSQL backup and an isolated restore rehearsal; document recovery boundaries and operator steps.
- [ ] Discover/provision real monitoring and a frequent worker scheduler if available within existing/free service authorization; keep genuine ownership/setup dependencies explicit.
- [x] Integrate additive schema changes, regression checks, type checking and cloud build. Review permissions and failure paths, deploy, and verify live pages and private guards.
- [x] Update progress, client inputs, operational runbooks and source control with measured outcomes and outstanding work.

Service outcome: Checkly monitoring was explicitly deferred by Nour. The verified free Inngest plan requires account terms acceptance; no resource was created and email remains inactive without owned sender verification. These integration tasks remain open, not mocked.

## Verification

Run heavy tasks serially because the laptop has limited available memory. Local failures caused by host resource exhaustion do not count as application test outcomes. Prefer disposable development schemas for mutation tests and hosted build checks for the final build. Never restore over an existing production/development database. Keep backup contents and encryption keys out of Git and tool output.

## Ownership

Parallel domain workers: inventory, reporting and public performance. Primary agent owns shared layout/config/types/migrations, service setup, backups, release and final status. Reports are under ignored artifacts/2026-09-29/completion/; permanent runbooks are under docs/.
