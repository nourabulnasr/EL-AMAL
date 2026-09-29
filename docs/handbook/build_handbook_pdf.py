"""Render the shared Markdown token tree to a navigable, print friendly handbook."""
import json, re, html
from pathlib import Path
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, LongTable, TableStyle, KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

ROOT=Path(__file__).resolve().parent
FONT=Path('C:/Windows/Fonts')
for name,file in [('Body','segoeui.ttf'),('BodyBold','segoeuib.ttf'),('BodyItalic','segoeuii.ttf'),('Display','georgia.ttf'),('Mono','consola.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(FONT/file)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='BodyBold',italic='BodyItalic',boldItalic='BodyBold')
INK=colors.HexColor('#16233B'); NAVY=colors.HexColor('#091540'); GRAY=colors.HexColor('#D9D9D9')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyText2',fontName='Body',fontSize=10.8,leading=15.5,textColor=INK,spaceAfter=7,splitLongWords=True,allowWidows=0,allowOrphans=0))
styles.add(ParagraphStyle(name='H1x',fontName='Display',fontSize=34,leading=39,textColor=colors.black,spaceAfter=23,keepWithNext=True))
styles.add(ParagraphStyle(name='H2x',fontName='Display',fontSize=22,leading=27,textColor=colors.black,spaceBefore=23,spaceAfter=12,keepWithNext=True))
styles.add(ParagraphStyle(name='H3x',fontName='BodyBold',fontSize=14,leading=19,textColor=colors.black,spaceBefore=17,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='H4x',fontName='BodyBold',fontSize=11.5,leading=16,textColor=colors.black,spaceBefore=12,spaceAfter=6,keepWithNext=True))
styles.add(ParagraphStyle(name='Listx',parent=styles['BodyText2'],leftIndent=15,firstLineIndent=-11,spaceAfter=5))
styles.add(ParagraphStyle(name='Codex',fontName='Mono',fontSize=8.2,leading=11.5,textColor=INK,backColor=colors.HexColor('#F2F4F7'),borderPadding=8,spaceBefore=4,spaceAfter=11,splitLongWords=True))
styles.add(ParagraphStyle(name='Cellx',fontName='Body',fontSize=9.1,leading=12.4,textColor=INK,splitLongWords=True,spaceAfter=0))
styles.add(ParagraphStyle(name='CellHead',parent=styles['Cellx'],fontName='BodyBold',textColor=colors.white))
styles.add(ParagraphStyle(name='Note',parent=styles['BodyText2'],fontSize=9,leading=13,textColor=colors.HexColor('#526076')))

def clean(s):
    return s.replace('\u2011','-').replace('\u2013','-').replace('\u2014',' - ').replace('\u00a0',' ')

def inline(tokens):
    result=''
    for t in tokens or []:
        kind=t.get('type');text=html.escape(clean(t.get('text','')))
        nested=inline(t.get('tokens')) if t.get('tokens') else text
        if kind=='strong': result+='<b>'+nested+'</b>'
        elif kind=='em': result+='<i>'+nested+'</i>'
        elif kind=='codespan': result+='<font name="Mono" size="9">'+text+'</font>'
        elif kind=='link':
            href=t.get('href','')
            if href.startswith(('https://','http://')): result+=f'<link href="{html.escape(href,quote=True)}" color="#174674">'+nested+'</link>'
            else: result+=nested
        elif kind=='br': result+='<br/>'
        else: result+=nested
    return result

class HeadingKeep(KeepTogether):
    """Keep a table heading with its opening rows, without moving a whole long table."""
    def __init__(self, flowables, *args, **kwargs):
        self.contains_long_table = any(isinstance(item, LongTable) and item.splitByRow for item in flowables)
        super().__init__(flowables, *args, **kwargs)
    def split(self, available_width, available_height):
        if self.contains_long_table and available_height >= 220:
            return self._content[:]
        return super().split(available_width, available_height)

class Handbook(BaseDocTemplate):
    def __init__(self,path):
        super().__init__(path,pagesize=(595.28,841.89),leftMargin=48,rightMargin=48,topMargin=50,bottomMargin=50,title='EL AMAL website delivery and administration handbook',author='EL AMAL project documentation',pageCompression=1)
        self.keepTogetherClass = HeadingKeep
        self.addPageTemplates(PageTemplate(id='normal',frames=[Frame(self.leftMargin,self.bottomMargin,self.width,self.height,id='body',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=self.page))
    def page(self,canvas,doc):
        canvas.saveState();canvas.setFont('Body',8);canvas.setFillColor(colors.HexColor('#506079'))
        if doc.page>1: canvas.drawString(48,817,'EL AMAL   /   Website delivery and administration handbook')
        canvas.drawString(48,29,'29 September 2026');canvas.drawRightString(547,29,str(doc.page));canvas.restoreState()
    def afterFlowable(self,f):
        if isinstance(f,Paragraph) and getattr(f,'chapter_key',None):
            self.canv.bookmarkPage(f.chapter_key)
            self.canv.addOutlineEntry(f.getPlainText(),f.chapter_key,level=f.chapter_level,closed=False)
            self.notify('TOCEntry',(f.chapter_level,f.getPlainText(),self.page,f.chapter_key))

tokens=json.loads((ROOT/'../../artifacts/handbook/handbook-tokens.json').read_text(encoding='utf8'))
toc=TableOfContents();toc.levelStyles=[ParagraphStyle(name='TOC0',fontName='BodyBold',fontSize=10.3,leading=14.5,spaceBefore=8,leftIndent=0,rightIndent=18,textColor=INK),ParagraphStyle(name='TOC1',fontName='Body',fontSize=9.6,leading=13,spaceBefore=3,leftIndent=14,rightIndent=18,textColor=INK)]
story=[];heading_counter=0

def paragraph(t,sty='BodyText2'):
    return Paragraph(inline(t.get('tokens')) or html.escape(clean(t.get('text',''))),styles[sty])

def render(items,inside_list=False):
    global heading_counter
    out=[]
    for t in items:
        kind=t.get('type')
        if kind in ('space','def'):continue
        if kind=='heading':
            depth=t['depth'];heading_counter+=1
            if t.get('text')=='Update after the handbook baseline':out.append(PageBreak())
            p=paragraph(t,{1:'H1x',2:'H2x',3:'H3x'}.get(depth,'H4x'))
            if depth in (2,3):
                p.chapter_key='chapter-'+str(heading_counter);p.chapter_level=depth-2
            if depth==1:
                out.extend([Spacer(1,45),p,Paragraph('Delivery record and practical staff guide',styles['H3x']),Paragraph('Prepared for Nour Abulnasr and the EL AMAL team',styles['BodyText2']),Paragraph('Status date 29 September 2026',styles['Note']),Spacer(1,23),Paragraph('What is live, how it works, how to operate it and what remains.',styles['BodyText2']),Spacer(1,18),Paragraph('Approximately 90 percent of the recorded scope is complete. The real catalogue is published. Customer email and several operational integrations still need activation.',styles['BodyText2']),PageBreak(),Paragraph('Contents',styles['H2x']),toc,PageBreak()])
            else:out.append(p)
        elif kind in ('paragraph','text'):out.append(paragraph(t))
        elif kind=='list':
            start=int(t.get('start') or 1)
            for n,item in enumerate(t['items']):
                prefix=str(start+n)+'. ' if t.get('ordered') else '\u2022 '
                children=item.get('tokens',[]);first=True
                for child in children:
                    if child.get('type') in ('paragraph','text'):
                        value=inline(child.get('tokens')) or html.escape(clean(child.get('text','')))
                        item_paragraph=Paragraph((prefix if first else '')+value,styles['Listx'])
                        if n==0 and len(t['items'])>1:item_paragraph.keepWithNext=True
                        out.append(item_paragraph);first=False
                    else:out.extend(render([child],True))
            out.append(Spacer(1,4))
        elif kind=='table':
            heads=t['header'];rows=t['rows'];count=len(heads);width=499.28
            if count==2:weights=[.32,.68]
            elif count==3:weights=[.30,.34,.36]
            elif count==4:weights=[.21,.24,.25,.30]
            elif count==5:weights=[.40,.15,.15,.15,.15]
            elif count==6:weights=[.32,.105,.105,.14,.07,.26]
            else:weights=[1/count]*count
            # Preserve compact role matrices; long prose remains in normal paragraphs elsewhere.
            print_heads=[dict(c,text='Score',tokens=[{'type':'text','text':'Score'}]) if c.get('text')=='Performance' else c for c in heads]
            data=[[paragraph(c,'CellHead') for c in print_heads]]+[[paragraph(c,'Cellx') for c in row] for row in rows]
            short_table=len(data)<=6 and sum(len(c.get('text','')) for row in [heads,*rows] for c in row)<3500
            table=LongTable(data,colWidths=[width*x for x in weights],repeatRows=1,hAlign='LEFT',splitByRow=0 if short_table else 1)
            table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F0F4F8')]),('GRID',(0,0),(-1,-1),.45,GRAY),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
            out.extend([table,Spacer(1,13)])
        elif kind=='code':
            if t.get('lang')=='mermaid':
                d=Drawing(499,205)
                lanes=[['Visitors','Public pages','Reviewed catalogue','Neon database'],['Staff','Admin and staff tools','Permission checks','Neon database'],['Customer requests','Guarded intake','Enquiry and queues','Gated until ready'],['Scheduler','Operations runner','Delivery queues','Email adapter gated']]
                for r,row in enumerate(lanes):
                    for c,label in enumerate(row):
                        x=c*126;y=165-r*51;gated=r==2 or (r==3 and c==3)
                        d.add(Rect(x,y,113,34,fillColor=colors.HexColor('#F0F3F7') if gated else NAVY,strokeColor=GRAY,strokeWidth=.4))
                        d.add(String(x+56.5,y+13,label,fontName='Body',fontSize=7.8,fillColor=INK if gated else colors.white,textAnchor='middle'))
                        if c<3:
                            d.add(Line(x+115,y+17,x+123,y+17,strokeColor=INK));d.add(Polygon([x+120,y+20,x+124,y+17,x+120,y+14],fillColor=INK,strokeColor=None))
                out.extend([d,Paragraph('Customer submission and email depend on activation. Reading the catalogue and authorized staff tools is already live.',styles['Note'])])
            else:out.append(Paragraph(html.escape(clean(t.get('text',''))).replace('\n','<br/>'),styles['Codex']))
        elif kind=='blockquote':out.extend(render(t.get('tokens',[])))
        elif kind=='hr':out.append(Spacer(1,9))
        elif kind=='html':out.append(Paragraph(html.escape(t.get('text','')),styles['BodyText2']))
        else:raise ValueError('Unhandled Markdown block '+str(kind))
    return out

story=render(tokens)
doc=Handbook(str(ROOT/'EL-AMAL-Website-Handbook.pdf'))
doc.multiBuild(story)
print(json.dumps({'pdf':str(ROOT/'EL-AMAL-Website-Handbook.pdf'),'pages':doc.page,'chapters':heading_counter}))
