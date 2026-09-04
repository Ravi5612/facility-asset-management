import re

with open('src/assets/assets.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'const seatDeptMap = new Map<string, string>\(\);', r'', content)
content = re.sub(r'const inventory = await Promise\.resolve\(\[\]\)\(\{[\s\S]*?\}\);\s*inventory\.forEach\(inv => \{[\s\S]*?\}\);', r'', content)

with open('src/assets/assets.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
