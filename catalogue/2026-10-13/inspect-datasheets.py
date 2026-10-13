"""Inspect downloaded official PDFs; retain bounded factual identity evidence."""
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
cards = json.loads((HERE / 'official-extraction.json').read_text(encoding='utf-8'))
downloads = json.loads((HERE / 'datasheet-download-evidence.json').read_text(encoding='utf-8'))
entries = downloads if isinstance(downloads, list) else downloads.get('downloads', downloads.get('documents', downloads.get('results', [])))
by_code = {}
for entry in entries:
    url = entry['url']
    name = url.split('/')[-1]
    source = ROOT / 'docs/source/wika-2026-10-13/datasheets' / name
    raw = source.read_bytes()
    assert raw.startswith(b'%PDF-')
    assert entry['status'] == 200
    assert hashlib.sha256(raw).hexdigest() == entry['sha256']
    reader = PdfReader(source)
    text = [(p.extract_text() or '') for p in reader.pages]
    source.with_suffix('.text.json').write_text(json.dumps(text, ensure_ascii=False), encoding='utf-8')
    code = entry['code']
    assert code in re.sub(r'\s+', '', ''.join(text[:3])), code
    models = sorted(set(m.strip() for card in cards if code.replace('.', '') in re.sub(r'\s|\.', '', card['printedDatasheetIds']) for m in card['model'].split(',')))
    model_checks = [{'model': m, 'found': any(re.search(r'(?<![A-Za-z0-9])'+re.escape(m)+r'(?![A-Za-z0-9])', t) for t in text)} for m in models]
    by_code[code] = {**entry, 'sha256': hashlib.sha256(raw).hexdigest(), 'status': 'verified' if any(m['found'] for m in model_checks) else 'identity-review-needed', 'pages': len(text), 'codeMatchesFirstThreePages': True, 'modelChecks': model_checks, 'firstPageSummary': re.sub(r'\s+', ' ', text[0])[:2200]}
    print(code, len(text), model_checks, flush=True)
report_cards = []
for card in cards:
    codes = re.findall(r'[A-Z]{2}\s?\d{2}\.\d{2}', card['printedDatasheetIds'])
    codes = [re.sub(r'\s+', '', c) for c in codes]
    report_cards.append({'model': card['model'], 'codes': codes, 'unresolvedCodes': [c for c in codes if by_code.get(c, {}).get('status') != 'verified']})
(HERE / 'datasheet-links.json').write_text(json.dumps({'verifiedAt':'2026-10-13','policy':'Manufacturer-discovered HTTPS URL, HTTP 200, PDF signature, SHA256, printed code and model identity in downloaded PDF. Brochure family variants omitted by current PDFs remain disclosed in modelChecks.','byCode':by_code,'cards':report_cards}, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
