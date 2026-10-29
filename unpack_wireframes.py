import os
import re
import json
import gzip
import base64

def unpack_with_mapping():
    src = 'docs/Vayentra Designer Pack Wireframes.html'
    tmpl_src = 'docs/extracted_template.html'

    with open(src, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    with open(tmpl_src, 'r', encoding='utf-8', errors='ignore') as f:
        tmpl = f.read()

    # Extract iframes with uuid from src="about:blank#<uuid>"
    iframe_matches = re.findall(r'<section class="board"><h2>([^<]+)</h2><iframe src="about:blank#([^"]+)" title="([^"]+)" width="([^"]+)" height="([^"]+)"', tmpl)
    print(f"Matched {len(iframe_matches)} boards in template")

    iframe_map = {}
    for h2, uuid_str, title, w, h in iframe_matches:
        w_int = int(w)
        h_int = int(h)
        iframe_map[uuid_str] = {
            'board_heading': h2,
            'title': title,
            'width': w_int,
            'height': h_int,
            'aspect_ratio': f"{w}x{h}",
            'device_type': 'Mobile (390px)' if w == '390' else ('Tablet (768px-800px)' if w in ['768', '794', '800'] else 'Desktop (1200px+)')
        }

    # Extract manifest
    manifest_match = re.search(r'<script type="__bundler/manifest">\s*(\{.*?\})\s*</script>', html, re.DOTALL)
    manifest = json.loads(manifest_match.group(1))

    # Extract page order
    page_order_match = re.search(r'<script type="__bundler/page_order">\s*(\[.*?\])\s*</script>', html, re.DOTALL)
    page_order = json.loads(page_order_match.group(1))

    out_dir = 'docs/wireframe_pages'
    os.makedirs(out_dir, exist_ok=True)

    summary_list = []

    for idx, pid in enumerate(page_order):
        if pid in manifest:
            item = manifest[pid]
            data_b64 = item.get('data', '')
            compressed = item.get('compressed', False)
            raw_bytes = base64.b64decode(data_b64)
            content = gzip.decompress(raw_bytes).decode('utf-8', errors='ignore') if compressed else raw_bytes.decode('utf-8', errors='ignore')

            meta = iframe_map.get(pid, {
                'board_heading': f"Board {idx+1}",
                'title': f"Screen_{idx+1}",
                'width': 0,
                'height': 0,
                'aspect_ratio': 'unknown',
                'device_type': 'unknown'
            })

            clean_title = re.sub(r'[^a-zA-Z0-9_\-]', '_', meta['title'])
            filename = f"{idx+1:02d}_{clean_title}.html"
            filepath = os.path.join(out_dir, filename)

            with open(filepath, 'w', encoding='utf-8') as pf:
                pf.write(content)

            colors = list(set(re.findall(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b', content)))[:10]
            fonts = list(set(re.findall(r'font-family:\s*([^;]+);', content)))

            summary_list.append({
                'index': idx + 1,
                'id': pid,
                'board_heading': meta['board_heading'],
                'title': meta['title'],
                'device_type': meta['device_type'],
                'dimensions': f"{meta['width']}x{meta['height']}",
                'width': meta['width'],
                'height': meta['height'],
                'filename': filename,
                'bytes': len(content),
                'sample_colors': [f"#{c}" for c in colors],
                'fonts': fonts
            })

    with open('docs/wireframe_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary_list, f, indent=2)

    print(f"Successfully processed and categorized all {len(summary_list)} wireframe boards!")

if __name__ == '__main__':
    unpack_with_mapping()
