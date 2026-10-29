# Technical Advisor and Owner Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add evidence-backed technical catalogue filters, make the existing-quotation upload journey unmistakable, and give the owner one clear operational starting point.

**Architecture:** Derive a small allowlisted facet index from existing public catalogue specifications at read time, then apply it in the existing server-rendered catalogue pipeline. Keep the quotation security boundary intact by rendering only a locked preview before verification. Add a protected staff index that links existing authoritative collections and reports instead of copying customer data.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, Payload CMS 3, Node test runner, CSS.

**Spec:** `docs/superpowers/specs/2026-10-29-technical-advisor-owner-workflow-design.md`

## Global Constraints

- Never invent a product specification or show unsupported options as inventory facts.
- English and Arabic must have equivalent functionality and labels.
- Filter URLs are non-indexable and canonicalize to a clean catalogue route.
- No additional client-side filtering library or heavy animation dependency.
- File upload remains unavailable until email verification.
- Staff and customer data stay server-side and role-protected.
- Preserve the current navy, lighter blue, white, and orange visual system.
- Respect `prefers-reduced-motion` and keyboard navigation.

## Review Focus

- Repeated, unknown, empty, or malicious facet query values are ignored safely.
- Multiple values within one facet use OR; different facets use AND.
- A product with no recognized technical facets remains visible until a technical facet is selected.
- Pagination and removal links preserve every unrelated active filter and reset page when criteria change.
- Arabic labels and RTL layout remain readable on mobile and at 200% zoom.

---

### Task 1: Verified technical-facet engine

**Files:**
- Create: `src/lib/technical-facets.ts`
- Create: `tests/technical-facets.test.mjs`
- Modify: `src/lib/catalogue.ts`
- Modify: `src/lib/seo-discovery.ts`

**Interfaces:**
- Produces: `parseTechnicalFilters`, `getProductTechnicalFacets`, `buildTechnicalFacetGroups`, `matchesTechnicalFilters`, and `technicalFilterParams`.
- Consumes: public `Product` objects and their reviewed `details.specifications`.

- [ ] Write failing tests for allowlisting, pressure/temperature/accessory extraction, OR/AND semantics, counts, and stable query serialization.
- [ ] Run the focused test and confirm failures are caused by the missing module/API.
- [ ] Implement the smallest category-aware parser/index and integrate it with `searchProducts` and `cataloguePath`.
- [ ] Run focused and existing catalogue/filter tests until green.
- [ ] Commit the facet engine and tests.

### Task 2: Server-rendered Technical Advisor interface and SEO policy

**Files:**
- Create: `src/components/technical-advisor.tsx`
- Modify: `src/components/catalogue-view.tsx`
- Modify: `src/components/catalogue-discovery.css`
- Modify: `src/app/(site)/[locale]/products/page.tsx`
- Test: `tests/technical-advisor.test.mjs`
- Test: `tests/seo-technical-filters.test.mjs`

**Interfaces:**
- Consumes: Task 1's parsed filter object, facet groups, and serializer.
- Produces: bilingual accessible form markup and query-aware metadata behavior.

- [ ] Write failing behavior tests for bilingual labels, category-aware groups, active filter removal, canonical metadata, and noindex policy.
- [ ] Run tests and confirm expected RED results.
- [ ] Implement the native form/details advisor, active chips, preserved query state, and metadata integration.
- [ ] Add responsive editorial styling with visible focus and reduced-motion handling.
- [ ] Run focused tests, typecheck, and existing catalogue tests.
- [ ] Commit the advisor interface.

### Task 3: Existing-quotation upload discovery

**Files:**
- Modify: `src/components/existing-quotation.tsx`
- Modify: `src/components/quotation.css`
- Test: `tests/existing-quotation-discovery.test.mjs`

**Interfaces:**
- Preserves: the current verified upload route and `CustomerEnquirySubmit` behavior.
- Produces: a visible, non-interactive locked file preview before confirmation.

- [ ] Write a failing test for supported formats, the email-confirmation lock explanation, and absence of an early file input.
- [ ] Run and confirm RED.
- [ ] Add the bilingual locked preview and accessible styling.
- [ ] Run focused enquiry/quotation tests.
- [ ] Commit the quotation discovery change.

### Task 4: Owner operational index

**Files:**
- Create: `src/app/(staff)/staff/page.tsx`
- Modify: `src/app/(staff)/staff/layout.tsx`
- Modify: `src/app/(staff)/staff/staff.css`
- Test: `tests/staff-workspace.test.mjs`

**Interfaces:**
- Consumes: existing Payload session authentication and current protected collection/report routes.
- Produces: one role-protected `/staff` index with accurate workflow guidance and direct links.

- [ ] Write failing tests for unauthenticated sign-in behavior, role checks, and operational destinations.
- [ ] Run and confirm RED.
- [ ] Implement the server-authenticated index without duplicating customer records.
- [ ] Run focused staff/security tests.
- [ ] Commit the owner workspace.

### Task 5: Verification, documentation, and handoff

**Files:**
- Modify: `docs/final-client-inputs.md`
- Modify: `PROGRESS.md`
- Modify: project memory/status file required by repository instructions.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: evidence-backed release status and an exact client-only dependency list.

- [ ] Run all focused tests, full serial test suite, typecheck, and production build.
- [ ] Check English/Arabic catalogue, RFQ, and staff pages at desktop/mobile widths with keyboard and reduced motion.
- [ ] Review the diff for security, privacy, SEO duplication, and accidental unrelated-file staging.
- [ ] Update status/handoff documents with verified facts and deferred human inputs.
- [ ] Commit and push the milestone branch; do not publish production before visual review.
