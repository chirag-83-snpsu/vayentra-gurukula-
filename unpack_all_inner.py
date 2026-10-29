import os
import re
import json

def unpack_all_inner_templates():
    pages_dir = 'docs/wireframe_pages'
    out_dir = 'docs/rendered_wireframes'
    os.makedirs(out_dir, exist_ok=True)

    files = sorted(os.listdir(pages_dir))
    print(f"Processing {len(files)} wireframe files...")

    extracted = 0
    for fname in files:
        if not fname.endswith('.html'):
            continue
        path = os.path.join(pages_dir, fname)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        m = re.search(r'<script type="__bundler/template">\s*"(.*?)"\s*</script>', content, re.DOTALL)
        if m:
            try:
                decoded = json.loads('"' + m.group(1) + '"')
                out_path = os.path.join(out_dir, fname)
                with open(out_path, 'w', encoding='utf-8') as out:
                    out.write(decoded)
                extracted += 1
            except Exception as e:
                print(f"Error decoding {fname}: {e}")

    print(f"Successfully decoded and saved {extracted} rendered wireframes to {out_dir}/")

if __name__ == '__main__':
    unpack_all_inner_templates()
