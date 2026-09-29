# EL AMAL website handbook

This is the detailed 29 September 2026 delivery record and operating manual requested by Nour. It records application release `7f73267` before subsequent development resumes. It explains the existing implementation, evidence, exact admin workflows and remaining work; it does not certify final client acceptance or disclose credentials.

The final PDF contains86 pages:85 baseline pages and one dated update recording the verified permission corrections deployed as `b3408a5`. The source contains about31,800 words. PDF files are explicitly stored as binary in Git so line-ending conversion cannot damage their internal offsets.

- [PDF handbook](EL-AMAL-Website-Handbook.pdf)
- [Browser handbook](EL-AMAL-Website-Handbook.html)
- [Combined editable Markdown](EL-AMAL-Website-Handbook.md)
- [All 151 product route pairs](catalogue-route-index.md)
- [Changes after this baseline](post-handbook-update.md)

The five baseline chapter source files are `overview.md`, `frontend-chapters.md`, `admin-chapters.md`, `backend-chapters.md` and `remaining-and-reference.md`. The dated `post-handbook-update.md` is included as a final chapter in every generated format. Update the relevant source before rebuilding. Dated baseline evidence is not silently replaced when production changes.

## Rebuild and check

Use the Node and Python runtimes resolved by Codex workspace dependencies. `build-handbook.mjs` takes the bundled Node package directory and uses its `marked` package; `build_handbook_pdf.py` uses bundled ReportLab plus the Windows Segoe UI, Georgia and Consolas fonts. The PDF has real text, bookmarks, clickable contents, repeated table headers and page numbers. The browser version is self-contained and works offline; only its website/source links need a connection. Keep the PDF and Markdown beside the HTML for its download links.

```text
node docs/handbook/build-handbook.mjs <bundled-node-package-directory>
python docs/handbook/build_handbook_pdf.py
python docs/handbook/check_handbook.py
node docs/handbook/check_handbook_browser.mjs <bundled-node-package-directory>
```

Render the PDF with bundled Poppler and inspect pages after meaningful changes. `check_handbook.py` checks content bounds, local links, anchors, expected coverage and accidental private environment-value inclusion without printing values. Browser verification uses an isolated headless Edge profile at 1440px and 390px. QA artifacts and token intermediates are saved under ignored `artifacts/handbook/`.

The bundled Windows environment has no LibreOffice renderer or registered Word automation. The verified PDF and HTML are the final document formats; no unverified Word file is presented as complete. This documentation folder is excluded from Vercel upload by `.vercelignore`.
