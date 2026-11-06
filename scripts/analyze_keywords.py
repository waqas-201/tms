import json

path = r'C:\Users\ALICOM4\.t3\userdata\providers\antigravity\ac0a3dfd6dddb20962cecff6ee5fe65e19d3923be20e52c5ab52ff877f7e4c32\antigravity-acp\brain\d66c0843-49f0-4986-84cc-1efa84928ce6\scratch\consultation_keywords.json'

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

c = data['clusters']
sorted_c = sorted(c, key=lambda x: x.get('size', 0), reverse=True)

print(f"Total Consultation Keywords: {data['total']}")
print(f"Total Consultation Clusters: {len(sorted_c)}")
print("\n--- TOP CONSULTATION CLUSTERS ---")
for i, cl in enumerate(sorted_c[:25], 1):
    label = cl.get('label')
    size = cl.get('size')
    members = cl.get('members', [])
    print(f"{i:2d}. [{size:2d} kws] {label}")
    for m in members[:4]:
        print(f"     - {m}")
