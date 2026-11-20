#!/usr/bin/env python3
"""
Genera los PDF del CV (español e inglés) a partir de src/data/cv.json.
Uso:   npm run build:cv        (requiere:  pip install reportlab)
Salida: public/cv/CV-Elias-Torczuk-ES.pdf  y  public/cv/CV-Elias-Torczuk-EN.pdf
"""
import json
import os
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, 'src/data/cv.json'), encoding='utf-8'))
OUT = os.path.join(ROOT, 'public/cv')

NAVY, BLUE, GRAY, INK = HexColor('#1B3A7A'), HexColor('#2F5FB0'), HexColor('#6B7280'), HexColor('#111827')

def style(name, **kw):
    base = dict(fontName='Helvetica', fontSize=9.6, leading=12.6, textColor=INK, alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
    'name': style('name', fontName='Helvetica-Bold', fontSize=23, leading=26, textColor=NAVY),
    'headline': style('headline', fontSize=11.5, leading=14, textColor=BLUE),
    'meta': style('meta', fontSize=9, leading=12, textColor=GRAY),
    'h': style('h', fontName='Helvetica-Bold', fontSize=9.6, leading=12, textColor=NAVY, spaceBefore=9, spaceAfter=1),
    'body': style('body'),
    'item': style('item', leftIndent=9, bulletIndent=0),
    'proj': style('proj', fontSize=9.8, leading=12.6, spaceBefore=3),
}

def heading(text):
    return [Paragraph(escape(text).upper(), S['h']), HRFlowable(width='100%', thickness=0.8, color=BLUE, spaceBefore=2, spaceAfter=4)]

def link(text, url):
    return f'<link href="{url}" color="#2F5FB0">{escape(text)}</link>'

def build(lang):
    d, L = DATA[lang], DATA[lang]['labels']
    c = DATA['contact']
    path = os.path.join(OUT, f'CV-Elias-Torczuk-{lang.upper()}.pdf')
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=19 * mm, rightMargin=19 * mm, topMargin=15 * mm, bottomMargin=13 * mm,
                            title=f"{DATA['name']} — CV", author=DATA['name'], subject=d['headline'], lang=lang)
    st = []
    st += [Paragraph(escape(DATA['name']), S['name']), Paragraph(escape(d['headline']), S['headline']), Paragraph(escape(DATA['location']), S['meta']), Spacer(1, 3)]
    st.append(Paragraph(' · '.join([link(c['email'], 'mailto:' + c['email']), link(c['linkedin'], 'https://' + c['linkedin']),
                                    link(c['github'], 'https://' + c['github']), link(c['web'], 'https://' + c['web'])]), S['meta']))
    st += heading(L['about']) + [Paragraph(escape(d['about']), S['body'])]
    st += heading(L['interests']) + [Paragraph(escape(d['interests']), S['body'])]
    e = d['education']
    st += heading(L['education'])
    st.append(Paragraph(f"<b>{escape(e['title'])}</b> · <font color='#6B7280'>{escape(e['school'])} · {escape(e['period'])}</font>", S['body']))
    st.append(Paragraph(escape(e['text']), S['body']))
    st += heading(L['projects'])
    for p in d['projects']:
        st.append(KeepTogether([
            Paragraph(f"<font color='#1B3A7A'><b>{escape(p['name'])}</b></font> <font color='#6B7280'>— {escape(p['meta'])}</font>", S['proj']),
            Paragraph(escape(p['text']), S['item'], bulletText='•'),
        ]))
    st += heading(L['tech'])
    t = d['tech']
    rows = [[Paragraph(f"<font color='#1B3A7A'><b>{L[k]}</b></font>", S['body']), Paragraph(escape(t[k2]), S['body'])] for k, k2 in (('langs', 'languages'), ('frameworks', 'frameworks'), ('tools', 'tools'))]
    tb = Table(rows, colWidths=[28 * mm, None])
    tb.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 1), ('BOTTOMPADDING', (0, 0), (-1, -1), 1)]))
    st.append(tb)
    st += heading(L['languages'])
    for lg in d['languages']:
        st.append(Paragraph(f"<b>{escape(lg['name'])}</b> — <font color='#6B7280'>{escape(lg['level'])}</font>", S['body']))
    doc.build(st)
    print('✔', os.path.relpath(path, ROOT))

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for lg in ('es', 'en'):
        build(lg)
