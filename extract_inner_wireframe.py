import os
import re
import json

def inspect_inner():
    path = 'docs/wireframe_pages/20_DesignSystem.html'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    m = re.search(r'<script type="__bundler/template">\s*"(.*?)"\s*</script>', text, re.DOTALL)
    if m:
        decoded = json.loads('"' + m.group(1) + '"')
        print(f"Decoded inner template length: {len(decoded)}")
        with open('docs/inner_DesignSystem.html', 'w', encoding='utf-8') as out:
            out.write(decoded)
        print("Saved to docs/inner_DesignSystem.html")
        print("\n--- SAMPLE CONTENT ---")
        print(decoded[:1500])

    path_resp = 'docs/wireframe_pages/31_ResponsiveLayouts.html'
    with open(path_resp, 'r', encoding='utf-8', errors='ignore') as f:
        text_resp = f.read()

    m_resp = re.search(r'<script type="__bundler/template">\s*"(.*?)"\s*</script>', text_resp, re.DOTALL)
    if m_resp:
        decoded_resp = json.loads('"' + m_resp.group(1) + '"')
        print(f"\nDecoded responsive layout length: {len(decoded_resp)}")
        with open('docs/inner_ResponsiveLayouts.html', 'w', encoding='utf-8') as out:
            out.write(decoded_resp)
        print("Saved to docs/inner_ResponsiveLayouts.html")
        print("\n--- SAMPLE RESPONSIVE CONTENT ---")
        print(decoded_resp[:1500])

if __name__ == '__main__':
    inspect_inner()
