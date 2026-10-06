# EL AMAL website handbook

Consolidated revision: **6 October 2026**. This replaces the dated 29 September PDF/HTML with an updated handbook, integrating the current release rather than requiring readers to reconcile separate addenda. Application reference: production `63acd5b`; prepared quotation `c2e6262`. The document update changes no live application, database, account or integration.

The current PDF has **97 pages**, with about35,200 words in the editable source, clickable contents and21 top-level bookmarks. Document integrity and rendered-layout checks are recorded under `artifacts/handbook/`; they do not constitute client visual acceptance or a fresh website audit.

- [PDF handbook](EL-AMAL-Website-Handbook.pdf)
- [Browser handbook](EL-AMAL-Website-Handbook.html)
- [Combined editable source](EL-AMAL-Website-Handbook.md)
- [Current subcategory status and full-launch checklist](current-readiness.md)
- [All 151 product route pairs](catalogue-route-index.md)

The opening readiness chapter explains each delivered subcategory, implementation approach, reason, status, remaining work and owner. It includes the current hero/motion and performance evidence, SEO mechanics and indexing limits, security fixes and limits, quotation customer/admin steps, business inputs, and release order. Detailed catalogue/admin/inventory/reporting/backend/recovery procedures are retained and corrected. Historical measurements and the 29 September follow-up remain explicitly dated.

The site is live for catalogue browsing and review. Real public intake/email and the prepared quotation feature are not yet operational. Exact production SKU definitions, business content and final operational acceptance are distinct dependencies. A former approximate completion percentage is not presented as proof of readiness.

## Source and build

Edit chapter sources before rebuilding: `overview.md`, `current-readiness.md`, `frontend-chapters.md`, `admin-chapters.md`, `backend-chapters.md`, `remaining-and-reference.md`, `post-handbook-update.md`. The builder normalizes heading hierarchy and generates the combined Markdown and self-contained HTML; ReportLab creates the PDF with clickable contents, bookmarks, repeated table headers and page numbers. Keep the three generated formats together. PDF files are stored as binary in Git.

```text
node docs/handbook/build-handbook.mjs <bundled-node-package-directory>
python docs/handbook/build_handbook_pdf.py
python docs/handbook/check_handbook.py
```

Use the Codex-resolved Node/Python packages. The renderer uses ReportLab and Windows Segoe UI, Georgia and Consolas. The PDF checker inspects text bounds, required content, HTML anchors/local links and accidental private environment-value inclusion without printing secrets. Render with Poppler and inspect after changes. Document QA evidence is under ignored `artifacts/handbook/`. Application tests are not represented as newly run during a documentation-only revision.

The PDF and offline browser handbook are the delivered document formats. No new Word file or cloud document was created. This folder is excluded from Vercel upload by `.vercelignore`. Related release evidence: [Precision Revealed](../precision-release-2026-10-06.md) and [earlier 6 October ownership/security work](../operations-release-2026-10-06.md); consolidated status takes precedence over superseded statements in those chronological records.
