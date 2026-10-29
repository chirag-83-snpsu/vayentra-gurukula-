import os
import re
import zipfile
import xml.etree.ElementTree as ET

def dump_docx(path):
    print("==========================================")
    print("DUMPING:", path)
    if not os.path.exists(path):
        print("Not found")
        return
    with zipfile.ZipFile(path) as z:
        tree = ET.fromstring(z.read('word/document.xml'))
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        paras = []
        for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            t = ''.join(p.itertext()).strip()
            if t:
                paras.append(t)
        print(f"Total paragraphs: {len(paras)}")
        print("--- First 20 paragraphs ---")
        for p in paras[:20]:
            print(p)
        return paras

def inspect_wireframes():
    path = 'docs/Vayentra Designer Pack Wireframes.html'
    if not os.path.exists(path):
        return
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    print("Wireframes file size:", len(content))
    # look for scripts
    scripts = re.findall(r'<script.*?</script>', content, re.DOTALL)
    print("Number of script tags:", len(scripts))
    for i, s in enumerate(scripts):
        print(f"Script {i} length: {len(s)}")
        print(s[:300] + " ... " + s[-200:])

if __name__ == '__main__':
    inspect_wireframes()
    dump_docx('docs/Vayentra SRS Addendum v1.2 - Security, Operations, Technical Academy, Screen Stories.docx')
    dump_docx('docs/Vayentra_Learning_Platform_Requirements_V2.docx')
    dump_docx('docs/Vayentra_UI_UX_SRS_V1.docx')
    dump_docx('docs/Vayentra_Backend_Schema_SRS_V1.docx')
