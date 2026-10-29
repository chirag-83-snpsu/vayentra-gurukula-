import json

with open('docs/wireframe_summary.json', 'r', encoding='utf-8') as f:
    boards = json.load(f)

print(f"Total wireframe boards extracted: {len(boards)}")

device_counts = {}
for b in boards:
    d = b['device_type']
    device_counts[d] = device_counts.get(d, 0) + 1

print("\n--- VIEWPORT BREAKDOWN ---")
for k, v in device_counts.items():
    print(f"{k}: {v} screens")

print("\n--- MOBILE VIEWPORTS (390x844 iPhone/Android viewport standard) ---")
for b in boards:
    if 'Mobile' in b['device_type']:
        print(f"  [{b['index']:02d}] {b['title']:<22} | {b['dimensions']} | Heading: {b['board_heading']}")

print("\n--- TABLET / KIOSK / PRINT VIEWPORTS (768px-800px & A4 794x1123) ---")
for b in boards:
    if 'Tablet' in b['device_type']:
        print(f"  [{b['index']:02d}] {b['title']:<22} | {b['dimensions']} | Heading: {b['board_heading']}")

print("\n--- DESKTOP VIEWPORTS (1200px - 1280px wide) ---")
for b in boards:
    if 'Desktop' in b['device_type']:
        print(f"  [{b['index']:02d}] {b['title']:<22} | {b['dimensions']} | Heading: {b['board_heading']}")
