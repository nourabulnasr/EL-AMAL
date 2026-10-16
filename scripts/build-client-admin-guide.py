"""Build the client PDF from the maintained guide and an optional dated aggregate snapshot."""
from pathlib import Path
import re, html, json
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import letter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/EL_AMAL_Client_Admin_Guide.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'docs/client-admin-guide.md'
SNAPSHOT = ROOT / 'artifacts/2026-10-16/finalization/live-admin-report.json'
NAVY, BLUE, ORANGE = colors.HexColor('#091540'), colors.HexColor('#315D8A'), colors.HexColor('#B45B13')
BODYFONT, BOLDFONT, DISPLAYFONT = 'Helvetica', 'Helvetica-Bold', 'Times-Roman'
for name, filename in [('GuideBody','arial.ttf'),('GuideBold','arialbd.ttf'),('GuideDisplay','georgia.ttf')]:
    p = Path('C:/Windows/Fonts') / filename
    if p.exists(): pdfmetrics.registerFont(TTFont(name,str(p)))
if 'GuideBody' in pdfmetrics.getRegisteredFontNames(): BODYFONT='GuideBody'
if 'GuideBold' in pdfmetrics.getRegisteredFontNames(): BOLDFONT='GuideBold'
if 'GuideDisplay' in pdfmetrics.getRegisteredFontNames(): DISPLAYFONT='GuideDisplay'
pdfmetrics.registerFontFamily(BODYFONT, normal=BODYFONT, bold=BOLDFONT, italic=BODYFONT, boldItalic=BOLDFONT)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='GuideTitle',fontName=DISPLAYFONT,fontSize=29,leading=33,spaceAfter=17,textColor=colors.black))
styles.add(ParagraphStyle(name='GuideHeading',fontName=DISPLAYFONT,fontSize=20,leading=24,spaceBefore=19,spaceAfter=9,keepWithNext=True,textColor=colors.black))
styles.add(ParagraphStyle(name='GuideSubheading',fontName=BOLDFONT,fontSize=12.5,leading=17,spaceBefore=12,spaceAfter=7,keepWithNext=True,textColor=colors.black))
styles.add(ParagraphStyle(name='GuideBody',fontName=BODYFONT,fontSize=10.7,leading=15.4,spaceAfter=9,textColor=colors.HexColor('#20283A'),allowWidows=0,allowOrphans=0))
styles.add(ParagraphStyle(name='GuideStep',parent=styles['GuideBody'],leftIndent=18,firstLineIndent=-18,spaceAfter=7))
styles.add(ParagraphStyle(name='GuideCell',parent=styles['GuideBody'],fontSize=9.3,leading=12.8,spaceAfter=0))
styles.add(ParagraphStyle(name='GuideCellSmall',parent=styles['GuideCell'],fontSize=8.4,leading=11.8))
styles.add(ParagraphStyle(name='GuideHeadCell',parent=styles['GuideCell'],fontName=BOLDFONT,textColor=colors.white))
styles.add(ParagraphStyle(name='GuideCaption',parent=styles['GuideBody'],fontSize=9,leading=12.5,textColor=BLUE,spaceAfter=12))

def rich(text):
    value=html.escape(text)
    value=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',value)
    def link(m):
        url=m.group(0).rstrip('.,')
        label=url
        label=label.replace('/admin/collections/','/admin/<br/>collections/')
        return '<a href="'+url+'" color="#315D8A"><u>'+label+'</u></a>'+m.group(0)[len(url):]
    return re.sub(r'https://[^\s<>]+',link,value)

def para(text,style='GuideBody'): return Paragraph(rich(text),styles[style])

def table(rows, widths=None, small=False):
    n=len(rows[0]); avail=letter[0]-100
    if widths is None:
        widths={2:[avail*.33,avail*.67],3:[avail*.19,avail*.44,avail*.37],6:[avail*.32]+[avail*.136]*5}.get(n,[avail/n]*n)
    cells=[[para(x,'GuideHeadCell' if i==0 else ('GuideCellSmall' if small else 'GuideCell')) for x in row] for i,row in enumerate(rows)]
    t=Table(cells,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#EDF3FA')]),('GRID',(0,0),(-1,-1),.45,colors.HexColor('#D9D9D9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5 if small else 7),('BOTTOMPADDING',(0,0),(-1,-1),5 if small else 7)]))
    return t

story=[]
lines=SOURCE.read_text(encoding='utf8').splitlines()
i=0
while i<len(lines):
    line=lines[i].strip()
    if not line: i+=1; continue
    if line.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            parts=[x.strip() for x in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+',x) for x in parts):rows.append(parts)
            i+=1
        story.extend([table(rows),Spacer(1,11)]);continue
    if line.startswith('# '):story.append(para(line[2:],'GuideTitle'))
    elif line.startswith('## '):story.append(para(line[3:],'GuideHeading'))
    elif line.startswith('### '):story.append(para(line[4:],'GuideSubheading'))
    elif re.match(r'^\d+\. ',line):story.append(para(line,'GuideStep'))
    else:story.append(para(line))
    i+=1

if SNAPSHOT.exists():
    data=json.loads(SNAPSHOT.read_text(encoding='utf8'))
    story.append(PageBreak())
    story.append(para('Product report example from the live website','GuideHeading'))
    story.append(para('Snapshot checked on 16 October 2026. Reporting dates: '+data['filters']['start']+' through '+data['filters']['end']+'. Both languages, all devices, all contexts, ordered by Product selections. This dated example shows how to read the report; open the live report for current results.'))
    story.append(para('The report contained '+str(data['productsMeasured'])+' measured products. DIH10, TC10-L and TC82 each had one qualifying selection. All rows had fewer than 30 visible sessions, so these numbers do not yet identify a reliable best seller.','GuideCaption'))
    rows=[['Model','Visible','Selected','CTR','Views','Basket']]
    for r in data['rows']:
        rows.append([r['model'],str(r['impressions']),str(r['selections']),'-' if r['ctr'] is None else str(r['ctr'])+'%',str(r['views']),str(r['basketAdds'])])
    story.append(table(rows,small=True))
    story.append(Spacer(1,10))
    story.append(para('Open https://www.al-amaleg.com/staff/products and choose Refresh now to see the latest figures. The screen also includes Datasheets. A product missing from this measured-activity table can still be published and available on the website.','GuideCaption'))

def chrome(canvas,doc):
    canvas.saveState()
    w,h=letter
    canvas.setFillColor(NAVY);canvas.rect(0,h-43,w,43,fill=1,stroke=0)
    canvas.setFillColor(colors.white);canvas.setFont(BOLDFONT,12);canvas.drawString(50,h-28,'EL AMAL')
    canvas.setFont(BODYFONT,9);canvas.drawRightString(w-50,h-28,'Administration and product interest')
    canvas.setFillColor(BLUE);canvas.setFont(BODYFONT,8.5)
    canvas.drawString(50,26,'Client operating guide  |  16 October 2026')
    canvas.drawRightString(w-50,26,str(doc.page))
    canvas.restoreState()

doc=SimpleDocTemplate(str(OUT),pagesize=letter,rightMargin=50,leftMargin=50,topMargin=65,bottomMargin=48,title='EL AMAL Admin Guide',author='Nour Abulnasr',subject='Client guide to administration, enquiries and product interest reports',pageCompression=1)
doc.build(story,onFirstPage=chrome,onLaterPages=chrome)
print(str(OUT))
