"""Check generated handbook text, bounds, links and accidental secret inclusion."""
import json,re
from pathlib import Path
from pypdf import PdfReader
import pdfplumber

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[1]
reader=PdfReader(ROOT/'EL-AMAL-Website-Handbook.pdf')
page_texts=[p.extract_text() or '' for p in reader.pages]
issues=[]
with pdfplumber.open(ROOT/'EL-AMAL-Website-Handbook.pdf') as pdf:
    for i,p in enumerate(pdf.pages,1):
        words=p.extract_words()
        bad=[w['text'] for w in words if w['x0']<40 or w['x1']>p.width-39 or w['top']<13 or w['bottom']>p.height-13]
        if bad:issues.append({'page':i,'outsideContentBounds':bad[:8]})
        if len(page_texts[i-1])<90:issues.append({'page':i,'sparse':True})
text='\n'.join(page_texts)
combined='\n'.join((ROOT/name).read_text(encoding='utf8') for name in ['EL-AMAL-Website-Handbook.md','EL-AMAL-Website-Handbook.html'])+'\n'+text
secret_hits=[]
for file in REPO.glob('.env*'):
    for line in file.read_text(encoding='utf8',errors='replace').splitlines():
        match=re.match(r'([A-Z_0-9]+)=(.*)$',line)
        if not match:continue
        key,value=match.groups();value=value.strip().strip('"').strip("'")
        if len(value)<10 or not re.search(r'PASSWORD|SECRET|TOKEN|API_KEY|DATABASE_URL|ENCRYPTION_KEY',key):continue
        if value in combined:secret_hits.append(key)
if secret_hits:issues.append({'secretFieldNames':sorted(set(secret_hits))})
for required in ['151','342','142','64 MiB','2 MiB','90','Neon','private','Catalogue Details','Download CSV']:
    if required not in text:issues.append({'missingText':required})
html=(ROOT/'EL-AMAL-Website-Handbook.html').read_text(encoding='utf8')
ids=set(re.findall(r'id="([^"]+)"',html));anchors=re.findall(r'href="#([^"]+)"',html)
for anchor in anchors:
    if anchor not in ids:issues.append({'missingAnchor':anchor})
for link in re.findall(r'href="([^"#]+)"',html):
    if not re.match(r'^[a-z]+:',link) and not (ROOT/link).exists():issues.append({'missingLocalLink':link})
report={'pages':len(reader.pages),'words':len(text.split()),'bookmarks':len(reader.outline),'internalAnchors':len(anchors),'issues':issues,'pageCharacterCounts':[len(t) for t in page_texts]}
(REPO/'artifacts/handbook/document-check.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='pageCharacterCounts'}))
if issues:raise SystemExit(1)
