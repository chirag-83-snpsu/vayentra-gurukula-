import os
import re
import json
import gzip
import base64
import zipfile
import xml.etree.ElementTree as ET

def extract_docx_text(path):
    if not os.path.exists(path):
        return []
    with zipfile.ZipFile(path) as z:
        tree = ET.fromstring(z.read('word/document.xml'))
        paras = []
        for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            t = ''.join(p.itertext()).strip()
            if t:
                paras.append(t)
        return paras

def parse_screen_stories():
    paras = extract_docx_text('docs/Vayentra SRS Addendum v1.2 - Security, Operations, Technical Academy, Screen Stories.docx')
    stories = []
    current_story = {}
    for p in paras:
        if re.match(r'^(PS-\d{2})\b', p):
            if current_story:
                stories.append(current_story)
            current_story = {'id': p.split()[0], 'title': p, 'lines': []}
        elif current_story:
            current_story['lines'].append(p)
    if current_story:
        stories.append(current_story)
    return stories

def extract_wireframe_titles():
    path = 'docs/Vayentra Designer Pack Wireframes.html'
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    titles = re.findall(r'title="([^"]+)"', content)
    return list(dict.fromkeys(titles))

if __name__ == '__main__':
    with open('parsed_summary.txt', 'w', encoding='utf-8') as out:
        wireframe_titles = extract_wireframe_titles()
        out.write(f"=== WIREFRAME BOARDS ({len(wireframe_titles)}) ===\n")
        for t in wireframe_titles:
            out.write(f"- {t}\n")
        
        stories = parse_screen_stories()
        out.write(f"\n=== SCREEN STORIES ({len(stories)}) ===\n")
        for s in stories:
            out.write(f"\n[{s['id']}] {s['title']}\n")
            out.write("  " + " | ".join(s['lines'][:5]) + "\n")
            
    print("Done! Parsed summary saved.")
