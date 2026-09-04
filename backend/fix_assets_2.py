import re

with open('src/assets/assets.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# user.departmentName
content = re.sub(
    r'user\.departmentName',
    r'user.employee?.department?.name',
    content
)

# findUnique user includes
content = re.sub(
    r'const user = await this\.prisma\.user\.findUnique\(\{ where: \{ id: userId \}, include: \{ employee: true \} \}\);',
    r'const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });',
    content
)
content = re.sub(
    r'const user = await this\.prisma\.user\.findUnique\(\{ where: \{ id: userId \} \}\);',
    r'const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });',
    content
)
content = re.sub(
    r'const approver = await this\.prisma\.user\.findUnique\(\{ where: \{ id: adminId \} \}\);',
    r'const approver = await this.prisma.user.findUnique({ where: { id: adminId }, include: { employee: { include: { department: true } } } });',
    content
)
content = re.sub(
    r'approver\.fullName',
    r'(approver.employee ? `${approver.employee.firstName} ${approver.employee.lastName}` : "")',
    content
)

# location missing in category include
content = re.sub(
    r'include: \{ assets: \{ select: \{ locationId: true \} \} \}',
    r'include: { assets: { select: { locationId: true } } }',
    content
)
# wait, line 83 and 105: c.assets?.filter(a => a.locationId).length (wait, the error was property location does not exist)
# wait, line 83: c.assets.filter(a => a.location).length (wait, did I substitute seatNumber to location?.name?)
# Ah, I replaced `a.seatNumber` with `a.location?.name`. But location was not included in `assets`.
content = re.sub(r'a\.location\?\.name', r'a.locationId', content)


# "An object literal cannot have multiple properties with the same name." in getDepartmentAssets include: { assignments: ..., location: true, assignments: ... }
# I probably added assignments twice.
content = re.sub(r'assignments: \{ orderBy: \{ assignedAt: "desc" \}, take: 1, include: \{ employee: true \} \}, location: true,\s*assignments: \{', r'assignments: {', content)


# fullName in getDepartmentAssets
content = re.sub(r'select: \{ fullName: true \}', r'include: { employee: true }', content)
content = re.sub(r'u\.fullName', r'(u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : "")', content)

# inventory queries
content = re.sub(
    r'const seatDeptMap = new Map<string, string>\(\);\n\s*const inventory = await this\.prisma\.inventory\.findMany\(\{\n\s*where: \{ departmentName \}\n\s*\}\);\n\s*inventory\.forEach\(inv => \{\n\s*if \(inv\.seatNumber\) seatDeptMap\.set\(inv\.seatNumber, inv\.departmentName\);\n\s*\}\);',
    r'',
    content
)
content = re.sub(
    r'const inventory = await this\.prisma\.inventory\.findMany\(\{\n\s*where: \{ departmentName \}\n\s*\}\);\n\s*inventory\.forEach\(inv => \{\n\s*if \(inv\.seatNumber\) seatDeptMap\.set\(inv\.seatNumber, inv\.departmentName\);\n\s*\}\);',
    r'',
    content
)

# assignAsset inventory update block
content = re.sub(
    r'const existingInv = await this\.prisma\.inventory\.findFirst\(\{[\s\S]*?if \(dto\.assignToSeatNumber\) \{[\s\S]*?await this\.prisma\.inventory\.update\(\{[\s\S]*?\}\);[\s\S]*?\}',
    r'',
    content
)

content = re.sub(r'currentAssigneeId: null,', r'', content)
content = re.sub(r'currentAssigneeId: dto\.assignToEmployeeId,', r'', content)

with open('src/assets/assets.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Assets fixed 2!")
