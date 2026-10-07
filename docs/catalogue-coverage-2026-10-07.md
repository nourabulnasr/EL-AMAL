# Catalogue coverage check — 7 October 2026

All product cards on the main pages in both supplied folders are represented on the live website. The fresh reconciliation found no missing entries, duplicate live entries, unexpected live entries, or stock labels that disagree with the folder classification.

| Source folder | Original photos | Expected catalogue entries | Found live | Missing |
|---|---:|---:|---:|---:|
| In Stock products | 17 | 90 | 90 | 0 |
| out of stockk prodcuts | 12 | 61 | 61 | 0 |
| **Total** | **29** | **151** | **151** | **0** |

**Coverage: 100% of the 151 photographed main-page product cards/model groups.** Some printed cards contain several model references, and those references remain together in one website entry. This is not a count of individual warehouse units or exact configured SKUs. For example, DIH50 and DIH52 share one entry, as do PGS23.100 and PGS23.160.

## What was checked

1. Re-enumerated both original Desktop folders, including subfolders. All 29 source photos still match the intake manifest and preserved copies by SHA-256; there are no additional unindexed source photos.
2. Visually reviewed all 29 preserved photographs against their main-page model headings. All 151 indexed cards are accounted for; no omitted main-page product heading was found. Adjacent partially photographed pages and pen marks were handled according to Nour’s confirmed instruction: every model on the main page inherits its folder classification.
3. Retrieved every publicly accessible live product record and compared its model, external ID, English/Arabic name and description, instrument type, applications, datasheet URL, image metadata, specifications and stock metadata with the prepared publication data. Each indexed card maps to exactly one published live record.
4. Opened all 302 English/Arabic product detail URLs through public HTTP. Every page returned 200 and rendered the expected model, name, stock label, dated availability, manufacturer image, specification rows and technical-document links.
5. Checked all 14 catalogue listing pages: seven English and seven Arabic, with 24 cards per page and seven on the final page. Each language lists all 151 entries exactly once, with matching model names and stock labels.
6. Retrieved all 151 public image files and compared their bytes with the published local assets by SHA-256. All returned 200 and matched.
7. Checked searches for DIH52 and PGS23.160 in both languages. Each finds its corresponding grouped entry.
8. Investigated an initial audit-parser warning: React streams some card text into separate HTML segments. The actual browser showed DIH50/DIH52 and its correct stock label. Updated the read-only parser to resolve observed streamed fragment references without executing page scripts, verified it against the captured 24-card page, then reran the full audit with zero issues. No website change was required.

## Scope and dates

The automated live run started at 2026-10-07T18:40:00.838Z and finished at 2026-10-07T18:40:49.079Z.
Availability is the classification supplied on 27 September 2026, which the website displays as a dated update. This check does not recount physical warehouse stock or establish that availability has changed since then.
The visual review covered model-heading completeness. The automated specification checks establish that prepared specifications are stored and rendered consistently; they are not a new engineering certification of every range or product configuration. Technical-document links were checked for inclusion on the website, not freshly downloaded from every manufacturer destination.
All checks were read-only. No products, stock, staff accounts, private records or production settings were changed.

## Every photo and its live products

Each linked model below opens the English product page. Its Arabic counterpart uses the same path with `/ar/` instead of `/en/`.

### In Stock products

| Original photo filename | Entries | Live models |
|---|---:|---|
| WhatsApp Image 2026-09-27 at 7.31.34 PM (1).jpeg | 3 | [DIH10](https://el-amal-sigma.vercel.app/en/products/cms-1); [DIH50, DIH52](https://el-amal-sigma.vercel.app/en/products/cms-2); [TF-LCD](https://el-amal-sigma.vercel.app/en/products/cms-3) |
| WhatsApp Image 2026-09-27 at 7.31.34 PM.jpeg | 4 | [DI10](https://el-amal-sigma.vercel.app/en/products/cms-4); [DI30](https://el-amal-sigma.vercel.app/en/products/cms-6); [DI32-1](https://el-amal-sigma.vercel.app/en/products/cms-5); [DI35](https://el-amal-sigma.vercel.app/en/products/cms-7) |
| WhatsApp Image 2026-09-27 at 7.31.36 PM (1).jpeg | 5 | [TC10-K](https://el-amal-sigma.vercel.app/en/products/cms-8); [TC10-L](https://el-amal-sigma.vercel.app/en/products/cms-10); [TC12-A](https://el-amal-sigma.vercel.app/en/products/cms-9); [TC12-B](https://el-amal-sigma.vercel.app/en/products/cms-11); [TC12-M](https://el-amal-sigma.vercel.app/en/products/cms-12) |
| WhatsApp Image 2026-09-27 at 7.31.36 PM.jpeg | 6 | [TC10-A](https://el-amal-sigma.vercel.app/en/products/cms-13); [TC10-B](https://el-amal-sigma.vercel.app/en/products/cms-15); [TC10-C](https://el-amal-sigma.vercel.app/en/products/cms-17); [TC10-D](https://el-amal-sigma.vercel.app/en/products/cms-14); [TC10-F](https://el-amal-sigma.vercel.app/en/products/cms-16); [TC10-H](https://el-amal-sigma.vercel.app/en/products/cms-18) |
| WhatsApp Image 2026-09-27 at 7.31.37 PM (1).jpeg | 3 | [TC59-T](https://el-amal-sigma.vercel.app/en/products/cms-19); [TC59-E](https://el-amal-sigma.vercel.app/en/products/cms-20); [TC59-V](https://el-amal-sigma.vercel.app/en/products/cms-21) |
| WhatsApp Image 2026-09-27 at 7.31.37 PM (2).jpeg | 6 | [TCC](https://el-amal-sigma.vercel.app/en/products/cms-22); [TC80](https://el-amal-sigma.vercel.app/en/products/cms-24); [TC81](https://el-amal-sigma.vercel.app/en/products/cms-26); [TC82](https://el-amal-sigma.vercel.app/en/products/cms-23); [TC83](https://el-amal-sigma.vercel.app/en/products/cms-25); [TC84](https://el-amal-sigma.vercel.app/en/products/cms-27) |
| WhatsApp Image 2026-09-27 at 7.31.37 PM (3).jpeg | 4 | [TC90](https://el-amal-sigma.vercel.app/en/products/cms-28); [TC95](https://el-amal-sigma.vercel.app/en/products/cms-30); [TC96-R](https://el-amal-sigma.vercel.app/en/products/cms-31); [TC96-O](https://el-amal-sigma.vercel.app/en/products/cms-29) |
| WhatsApp Image 2026-09-27 at 7.31.37 PM (4).jpeg | 6 | [TR10-A](https://el-amal-sigma.vercel.app/en/products/cms-32); [TR10-B](https://el-amal-sigma.vercel.app/en/products/cms-34); [TR10-C](https://el-amal-sigma.vercel.app/en/products/cms-36); [TR10-D](https://el-amal-sigma.vercel.app/en/products/cms-33); [TR10-F](https://el-amal-sigma.vercel.app/en/products/cms-35); [TR10-H](https://el-amal-sigma.vercel.app/en/products/cms-37) |
| WhatsApp Image 2026-09-27 at 7.31.37 PM (5).jpeg | 6 | [TR11-A](https://el-amal-sigma.vercel.app/en/products/cms-38); [TR10-K](https://el-amal-sigma.vercel.app/en/products/cms-40); [TR10-L](https://el-amal-sigma.vercel.app/en/products/cms-43); [TR12-A](https://el-amal-sigma.vercel.app/en/products/cms-39); [TR12-B](https://el-amal-sigma.vercel.app/en/products/cms-41); [TR12-M](https://el-amal-sigma.vercel.app/en/products/cms-42) |
| WhatsApp Image 2026-09-27 at 7.31.37 PM.jpeg | 5 | [TC40](https://el-amal-sigma.vercel.app/en/products/cms-44); [TC46](https://el-amal-sigma.vercel.app/en/products/cms-46); [TC47](https://el-amal-sigma.vercel.app/en/products/cms-48); [TC50](https://el-amal-sigma.vercel.app/en/products/cms-45); [TC53](https://el-amal-sigma.vercel.app/en/products/cms-47) |
| WhatsApp Image 2026-09-27 at 7.31.38 PM (1).jpeg | 7 | [TR50](https://el-amal-sigma.vercel.app/en/products/cms-53); [TR53](https://el-amal-sigma.vercel.app/en/products/cms-49); [TR55](https://el-amal-sigma.vercel.app/en/products/cms-51); [TR60](https://el-amal-sigma.vercel.app/en/products/cms-54); [TR75](https://el-amal-sigma.vercel.app/en/products/cms-50); [TR81](https://el-amal-sigma.vercel.app/en/products/cms-52); [TR95](https://el-amal-sigma.vercel.app/en/products/cms-55) |
| WhatsApp Image 2026-09-27 at 7.31.38 PM (2).jpeg | 6 | [TF35](https://el-amal-sigma.vercel.app/en/products/cms-56); [TF37](https://el-amal-sigma.vercel.app/en/products/cms-58); [TF41](https://el-amal-sigma.vercel.app/en/products/cms-60); [TF-2000](https://el-amal-sigma.vercel.app/en/products/cms-57); [TF44](https://el-amal-sigma.vercel.app/en/products/cms-59); [TF45](https://el-amal-sigma.vercel.app/en/products/cms-61) |
| WhatsApp Image 2026-09-27 at 7.31.38 PM (3).jpeg | 6 | [T15](https://el-amal-sigma.vercel.app/en/products/cms-62); [T16](https://el-amal-sigma.vercel.app/en/products/cms-64); [T38](https://el-amal-sigma.vercel.app/en/products/cms-66); [T32](https://el-amal-sigma.vercel.app/en/products/cms-63); [T91](https://el-amal-sigma.vercel.app/en/products/cms-65); [TIF50, TIF52](https://el-amal-sigma.vercel.app/en/products/cms-67) |
| WhatsApp Image 2026-09-27 at 7.31.38 PM (4).jpeg | 6 | [TSD-30](https://el-amal-sigma.vercel.app/en/products/cms-68); [TFS35](https://el-amal-sigma.vercel.app/en/products/cms-70); [TFS135](https://el-amal-sigma.vercel.app/en/products/cms-72); [TXS, TXA](https://el-amal-sigma.vercel.app/en/products/cms-69); [TCS, TCA](https://el-amal-sigma.vercel.app/en/products/cms-71); [TWG, TAG](https://el-amal-sigma.vercel.app/en/products/cms-73) |
| WhatsApp Image 2026-09-27 at 7.31.38 PM (5).jpeg | 5 | [SC15](https://el-amal-sigma.vercel.app/en/products/cms-74); [SB15](https://el-amal-sigma.vercel.app/en/products/cms-76); [TGS55](https://el-amal-sigma.vercel.app/en/products/cms-75); [TGS73](https://el-amal-sigma.vercel.app/en/products/cms-77); [70 with 8xx](https://el-amal-sigma.vercel.app/en/products/cms-78) |
| WhatsApp Image 2026-09-27 at 7.31.38 PM (6).jpeg | 5 | [CS4R](https://el-amal-sigma.vercel.app/en/products/cms-79); [CS6S, CS6H, CS6L](https://el-amal-sigma.vercel.app/en/products/cms-81); [TND](https://el-amal-sigma.vercel.app/en/products/cms-80); [IR80](https://el-amal-sigma.vercel.app/en/products/cms-82); [PP82](https://el-amal-sigma.vercel.app/en/products/cms-83) |
| WhatsApp Image 2026-09-27 at 7.31.38 PM.jpeg | 7 | [TFT35](https://el-amal-sigma.vercel.app/en/products/cms-88); [TR36](https://el-amal-sigma.vercel.app/en/products/cms-84); [TR31](https://el-amal-sigma.vercel.app/en/products/cms-86); [TR33](https://el-amal-sigma.vercel.app/en/products/cms-89); [TR34](https://el-amal-sigma.vercel.app/en/products/cms-85); [TR40](https://el-amal-sigma.vercel.app/en/products/cms-87); [TR41](https://el-amal-sigma.vercel.app/en/products/cms-90) |

### out of stockk prodcuts

| Original photo filename | Entries | Live models |
|---|---:|---|
| WhatsApp Image 2026-09-27 at 7.26.18 PM.jpeg | 6 | [O-10](https://el-amal-sigma.vercel.app/en/products/cms-91); [MH-4](https://el-amal-sigma.vercel.app/en/products/cms-93); [MH-4-CAN](https://el-amal-sigma.vercel.app/en/products/cms-95); [MH-3-HY](https://el-amal-sigma.vercel.app/en/products/cms-92); [MG-1](https://el-amal-sigma.vercel.app/en/products/cms-94); [R-1](https://el-amal-sigma.vercel.app/en/products/cms-96) |
| WhatsApp Image 2026-09-27 at 7.26.21 PM (1).jpeg | 4 | [DPGT43](https://el-amal-sigma.vercel.app/en/products/cms-97); [DPGT43HP](https://el-amal-sigma.vercel.app/en/products/cms-99); [DPGT40](https://el-amal-sigma.vercel.app/en/products/cms-98); [APGT43](https://el-amal-sigma.vercel.app/en/products/cms-100) |
| WhatsApp Image 2026-09-27 at 7.26.21 PM (2).jpeg | 6 | [PGS21](https://el-amal-sigma.vercel.app/en/products/cms-101); [PGS25](https://el-amal-sigma.vercel.app/en/products/cms-103); [PGS21.100, PGS21.160](https://el-amal-sigma.vercel.app/en/products/cms-105); [PGS23.100, PGS23.160](https://el-amal-sigma.vercel.app/en/products/cms-102); [PGS23.063](https://el-amal-sigma.vercel.app/en/products/cms-104); [PGS43.100, PGS43.160](https://el-amal-sigma.vercel.app/en/products/cms-106) |
| WhatsApp Image 2026-09-27 at 7.26.21 PM (3).jpeg | 7 | [432.36, 432.56 with 8xx](https://el-amal-sigma.vercel.app/en/products/cms-111); [532.53 with 8xx](https://el-amal-sigma.vercel.app/en/products/cms-107); [632.51 with 8xx](https://el-amal-sigma.vercel.app/en/products/cms-109); [DPGS40](https://el-amal-sigma.vercel.app/en/products/cms-112); [DPGS40TA](https://el-amal-sigma.vercel.app/en/products/cms-108); [DPGS43](https://el-amal-sigma.vercel.app/en/products/cms-110); [DPGS43HP](https://el-amal-sigma.vercel.app/en/products/cms-113) |
| WhatsApp Image 2026-09-27 at 7.26.21 PM.jpeg | 6 | [PGT21](https://el-amal-sigma.vercel.app/en/products/cms-114); [PGT23.063](https://el-amal-sigma.vercel.app/en/products/cms-116); [PGT23.100, PGT23.160](https://el-amal-sigma.vercel.app/en/products/cms-118); [PGT43](https://el-amal-sigma.vercel.app/en/products/cms-115); [PGT43HP](https://el-amal-sigma.vercel.app/en/products/cms-117); [PGT63HP](https://el-amal-sigma.vercel.app/en/products/cms-119) |
| WhatsApp Image 2026-09-27 at 7.26.22 PM (1).jpeg | 5 | [PSM01](https://el-amal-sigma.vercel.app/en/products/cms-120); [PSM02](https://el-amal-sigma.vercel.app/en/products/cms-122); [PSM-520](https://el-amal-sigma.vercel.app/en/products/cms-121); [PSM-550](https://el-amal-sigma.vercel.app/en/products/cms-123); [PSM-700](https://el-amal-sigma.vercel.app/en/products/cms-124) |
| WhatsApp Image 2026-09-27 at 7.26.22 PM (2).jpeg | 6 | [PXS, PXA](https://el-amal-sigma.vercel.app/en/products/cms-125); [PCS, PCA](https://el-amal-sigma.vercel.app/en/products/cms-127); [MW, MA](https://el-amal-sigma.vercel.app/en/products/cms-129); [BWX, BA](https://el-amal-sigma.vercel.app/en/products/cms-126); [DW, DA](https://el-amal-sigma.vercel.app/en/products/cms-128); [APW, APA](https://el-amal-sigma.vercel.app/en/products/cms-130) |
| WhatsApp Image 2026-09-27 at 7.26.22 PM (3).jpeg | 4 | [DSS26M](https://el-amal-sigma.vercel.app/en/products/cms-131); [DSS34M](https://el-amal-sigma.vercel.app/en/products/cms-133); [DSS26T](https://el-amal-sigma.vercel.app/en/products/cms-132); [DSS34T](https://el-amal-sigma.vercel.app/en/products/cms-134) |
| WhatsApp Image 2026-09-27 at 7.26.22 PM (4).jpeg | 6 | [IV1](https://el-amal-sigma.vercel.app/en/products/cms-135); [IV2](https://el-amal-sigma.vercel.app/en/products/cms-138); [IV3, IV5](https://el-amal-sigma.vercel.app/en/products/cms-139); [IVM](https://el-amal-sigma.vercel.app/en/products/cms-136); [IBM, IBF](https://el-amal-sigma.vercel.app/en/products/cms-137); [910.10, 910.11](https://el-amal-sigma.vercel.app/en/products/cms-140) |
| WhatsApp Image 2026-09-27 at 7.26.22 PM (5).jpeg | 5 | [BV](https://el-amal-sigma.vercel.app/en/products/cms-141); [HPNV](https://el-amal-sigma.vercel.app/en/products/cms-143); [910.12](https://el-amal-sigma.vercel.app/en/products/cms-145); [910.15](https://el-amal-sigma.vercel.app/en/products/cms-142); [HPFA](https://el-amal-sigma.vercel.app/en/products/cms-144) |
| WhatsApp Image 2026-09-27 at 7.26.22 PM (6).jpeg | 3 | [A-AI-1, A-IAI-1](https://el-amal-sigma.vercel.app/en/products/cms-146); [M12 x 1 cable](https://el-amal-sigma.vercel.app/en/products/cms-148); [904](https://el-amal-sigma.vercel.app/en/products/cms-147) |
| WhatsApp Image 2026-09-27 at 7.26.22 PM.jpeg | 3 | [PSD-4](https://el-amal-sigma.vercel.app/en/products/cms-149); [PSD-4-ECO](https://el-amal-sigma.vercel.app/en/products/cms-151); [A-1200](https://el-amal-sigma.vercel.app/en/products/cms-150) |

## Reproduce this check

From the repository root, run:

```powershell
node scripts/audit-catalogue-coverage.mjs
```

This script reads only the original catalogue folders, local publication files, and unauthenticated public EL AMAL URLs. It uses three concurrent reads and never loads environment files or writes to the website. It exits nonzero on discrepancies.
The detailed machine-readable evidence is saved locally at `artifacts/2026-10-07/catalogue-coverage/report.json`. The original photos and transient evidence remain excluded from Git; this report and the reusable audit code are tracked.
