import re

with open('src/assets/assets.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix user references
content = re.sub(r'select: \{ accessibleDepartments: true, fullName: true, email: true \}', r'include: { employee: { include: { department: true } } }', content)
content = re.sub(r'user\.accessibleDepartments', r'(user.employee?.department?.name ? [user.employee.department.name] : [])', content)

content = re.sub(r'select: \{ departmentName: true \}', r'include: { employee: { include: { department: true } } }', content)
content = re.sub(r'user\.departmentName', r'user.employee?.department?.name', content)

content = re.sub(r'select: \{ fullName: true \}', r'include: { employee: true }', content)
content = re.sub(r'user\.fullName', r'(user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : "")', content)

# Fix categories query (seatNumber removed, replaced by nothing or location if needed)
content = re.sub(r'seatNumber: true,', r'', content)
# It used `seatNumber` in `getCategories`, let's just make it return location name or undefined
content = re.sub(r'c\.assets\.filter\(a => a\.seatNumber\)\.length', r'c.assets?.filter(a => a.locationId).length || 0', content)
content = re.sub(r'c\.assets\.filter\(a => \!a\.seatNumber\)\.length', r'c.assets?.filter(a => !a.locationId).length || 0', content)
content = re.sub(r'include: \{ assets: true \}', r'include: { assets: { select: { locationId: true } } }', content)

# Fix currentAssignee in includes
content = re.sub(r'currentAssignee: \{ include: \{ user: true \} \}', r'assignments: { orderBy: { assignedAt: "desc" }, take: 1, include: { employee: true } }, location: true', content)

# Remove Inventory logic
# findFirst({ where: { seatNumber ... inventory ... } })
content = re.sub(r'const seatDeptMap = new Map<string, string>\(\);', r'', content)
content = re.sub(r'const inventory = await this\.prisma\.inventory\.findMany\(\{[\s\S]*?\}\);', r'', content)
content = re.sub(r'inventory\.forEach\(inv => \{[\s\S]*?\}\);', r'', content)

# Remove update of inventory at the bottom of assignAsset
content = re.sub(r'const existingInv = await this\.prisma\.inventory\.findFirst\(\{[\s\S]*?await this\.prisma\.inventory\.update\(\{[\s\S]*?\}\);[\s\S]*?\}\)', r'', content)

# Fix assignAsset currentAssigneeId logic
content = re.sub(r'currentAssigneeId: null,', r'', content)
content = re.sub(r'currentAssigneeId: dto\.assignToEmployeeId,', r'', content)
content = re.sub(r'seatNumber: null,', r'locationId: null,', content)
content = re.sub(r'floor: null,', r'', content)
content = re.sub(r'seatNumber: dto\.assignToSeatNumber,', r'locationId: dto.locationId,', content)
content = re.sub(r'floor: dto\.assignToFloor,', r'', content)
content = re.sub(r'a\.seatNumber', r'a.location?.name', content)
content = re.sub(r'asset\.seatNumber', r'asset.location?.name', content)
content = re.sub(r'asset\.floor', r'asset.location?.parentId', content)


# Fix getAssignedToMeAssets
content = re.sub(r'currentAssigneeId: employee\.id,', r'assignments: { some: { employeeId: employee.id, status: "ACTIVE" } },', content)

with open('src/assets/assets.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Assets fixed!")
