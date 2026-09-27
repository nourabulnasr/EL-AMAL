"""Extract factual card text and original embedded product images from the matching WIKA PDF.
This preserves the embedded image pixels; it does not generate or retouch product imagery.
"""
import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader
import pdfplumber

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/source/wika-2026-09-27/product-portfolio.pdf"
OUTPUT = ROOT / "catalogue/2026-09-27"
IMAGES = ROOT / "public/images/products"
IMAGES.mkdir(parents=True, exist_ok=True)
reader = PdfReader(SOURCE)
index = json.loads((OUTPUT / "page-index.json").read_text(encoding="utf-8"))
missing_pages = {
    "in-stock-01": 35, "in-stock-02": 34, "in-stock-04": 36,
    "in-stock-06": 40, "in-stock-08": 42, "in-stock-17": 44,
    "out-of-stock-01": 18,
}

def norm(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())

def cleaned(value):
    return value.replace("\u00ad", "-").replace("■", "•").replace("T ypes", "Types").replace("T ype", "Type").replace("T emperature", "Temperature").strip()

records = []
with pdfplumber.open(SOURCE) as pdf:
    for photographed in index["pages"]:
        number = photographed["page"] or missing_pages[photographed["sourceId"]]
        page = pdf.pages[number - 1]
        rectangles = [dict(r) for r in page.rects if r["width"] > 145 and r["height"] > 25 and r["height"] < 150 and r["top"] > 70 and isinstance(r["non_stroking_color"], (tuple, list)) and len(r["non_stroking_color"]) == 4 and r["non_stroking_color"][0] > .75 and .35 < r["non_stroking_color"][1] < .9]
        headers = []
        for rectangle in sorted(rectangles, key=lambda r: (round(r["x0"]), r["top"])):
            if headers and abs(headers[-1]["x0"] - rectangle["x0"]) < 1 and abs(headers[-1]["bottom"] - rectangle["top"]) < .2:
                headers[-1]["bottom"] = rectangle["bottom"]
            else:
                headers.append(rectangle)
        extracted_images = {item.name.split(".")[0]: item for item in reader.pages[number - 1].images}
        for header in headers:
            x0, x1, top, bottom = header["x0"], header["x1"], header["top"], header["bottom"]
            title_chars = [c for c in page.chars if x0 <= (c["x0"] + c["x1"]) / 2 <= x1 and top <= c["top"] < bottom and c["size"] >= 9.9]
            title = cleaned(pdfplumber.utils.extract_text(title_chars, x_tolerance=1, y_tolerance=2))
            candidates = [c for c in photographed["cards"] if norm(c[0]) == norm(title)]
            if not candidates:
                candidates = [c for c in photographed["cards"] if norm(c[0]).replace("with", "") == norm(title).replace("with", "")]
            if not candidates:
                candidates = [c for c in photographed["cards"] if norm(c[0]) == norm(title.split("\n")[0])]
            if len(candidates) != 1:
                print("UNMATCHED", number, repr(title), flush=True)
                continue
            card = candidates[0]
            lines = [line["top"] for line in page.lines if abs(line["top"] - line["bottom"]) < .2 and bottom < line["top"] < 800 and abs(line["x0"] - x0) < 2]
            end = min(lines) if lines else min(bottom + 210, 795)
            # Pages 44/45 use rules between EVERY table row, not just card borders.
            # The printed data-sheet row is the reliable lower card boundary.
            data_words = [w for w in page.extract_words(x_tolerance=1, y_tolerance=2)
                          if w["text"] == "Data" and abs(w["x0"] - x0) < 5
                          and bottom < w["top"] < min(bottom + 230, 790)]
            if data_words:
                data_top = min(w["top"] for w in data_words)
                end = data_top + 9
            region = page.crop((x0, bottom, x1, end))
            left = region.crop((x0, bottom, x0 + 55.65, end))
            words = left.extract_words(x_tolerance=1, y_tolerance=2)
            label_lines = []
            for word in sorted(words, key=lambda w: (round(w["top"] / 2), w["x0"])):
                if label_lines and abs(word["top"] - label_lines[-1]["top"]) < 2:
                    label_lines[-1]["text"] += " " + word["text"]
                else:
                    label_lines.append({"top": word["top"], "text": word["text"]})
            rows = []
            for line in label_lines:
                text = cleaned(line["text"])
                if rows and (text.startswith("(") or text in ("(± % of span)", "output", "location", "feature", "temperature", "type")):
                    rows[-1]["label"] += " " + text
                else:
                    rows.append({"label": text, "top": line["top"]})
            for position, row in enumerate(rows):
                row_end = rows[position + 1]["top"] - .5 if position + 1 < len(rows) else end
                chars = [c for c in region.chars if (c["x0"] + c["x1"]) / 2 >= x0 + 55.65 and row["top"] - .5 <= c["top"] < row_end]
                row["value"] = cleaned(pdfplumber.utils.extract_text(chars, x_tolerance=1, y_tolerance=2))
            matches = [im for im in page.images if x0 - 8 <= (im["x0"] + im["x1"]) / 2 < x1 + 20 and im["top"] < top + 12 and im["bottom"] > top - 100 and im["bottom"] < bottom + 10 and min(im["srcsize"]) > 8 and im["srcsize"][0] * im["srcsize"][1] > 4000]
            matches.sort(key=lambda im: (im["x1"] - im["x0"]) * (im["bottom"] - im["top"]), reverse=True)
            image_data = None
            if matches:
                chosen = matches[0]
                original = extracted_images.get(chosen["name"])
                if original:
                    filename = "wika-" + re.sub(r"[^a-z0-9]+", "-", card[0].lower()).strip("-") + ".png"
                    pixels = original.image
                    if pixels.mode == "CMYK":
                        pixels = pixels.convert("RGB")
                    pixels.save(IMAGES / filename, format="PNG")
                    image_data = {"src": "/images/products/" + filename, "width": original.image.width, "height": original.image.height, "pdfImageName": chosen["name"]}
            if not image_data:
                print("MISSING IMAGE", number, card[0], flush=True)
            records.append({
                "model": card[0], "label": card[1], "sourceId": photographed["sourceId"],
                "page": number, "header": title,
                "availability": "in-stock" if photographed["sourceId"].startswith("in-stock") else "out-of-stock",
                "printedDatasheetIds": card[2], "image": image_data,
                "rows": rows, "rawSpecifications": cleaned(region.extract_text(x_tolerance=1, y_tolerance=2) or ""),
                "box": [x0, top, x1, end],
            })
        print("PAGE", photographed["sourceId"], number, "headers", len(headers), "expected", len(photographed["cards"]), flush=True)
(OUTPUT / "official-extraction.json").write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("TOTAL", len(records), "IMAGES", sum(bool(r["image"]) for r in records))
