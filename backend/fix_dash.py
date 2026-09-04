import re

with open('src/employee-dashboard/employee-dashboard.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix include in findUnique Employee
content = re.sub(
    r'assetsAssigned: \{\s*include: \{ category: true \}\s*\},',
    r'assetAssignments: { include: { asset: { include: { category: true } } } },',
    content
)

# Fix map in format logic
content = re.sub(
    r'department: employee\.department\.name,',
    r'department: employee.department ? employee.department.name : "",',
    content
)
content = re.sub(
    r'assets: employee\.assetsAssigned\.map',
    r'assets: employee.assetAssignments.map(aa => aa.asset).map',
    content
)


with open('src/employee-dashboard/employee-dashboard.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Dashboard fixed!")
