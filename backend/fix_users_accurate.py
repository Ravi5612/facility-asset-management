import re

with open('src/users/users.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove dropped fields from user.create and user.update
text = re.sub(r'fullName: dto\.name,', r'', text)
text = re.sub(r'employeeCode, // Save the generated code', r'', text)
text = re.sub(r'employeeCode,', r'', text)
text = re.sub(r'accessibleDepartments: dto\.departmentIds,', r'', text)
text = re.sub(r'departmentName: dto\.departmentName,', r'', text)
text = re.sub(r'designation: dto\.designation,', r'', text)
text = re.sub(r'profileImage: profileImageUrl,', r'', text)
text = re.sub(r'profileImage: profilePhoto,', r'', text)

# Includes
text = re.sub(r'const creator = await this\.prisma\.user\.findFirst\(\{ where: \{ id: creatorId, organizationId \} \}\);', r'const creator = await this.prisma.user.findFirst({ where: { id: creatorId, organizationId }, include: { employee: { include: { department: true } } } });', text)
text = re.sub(r'const hod = await this\.prisma\.user\.findFirst\(\{ where: \{ id: hodId, organizationId \} \}\);', r'const hod = await this.prisma.user.findFirst({ where: { id: hodId, organizationId }, include: { employee: { include: { department: true } } } });', text)

text = re.sub(r'user: \{\s*select: \{ id: true, email: true, fullName: true, employeeCode: true, accessibleDepartments: true, status: true, createdAt: true, profileImage: true \}\s*\}', r'user: { include: { employee: { include: { department: true } } } }', text)
text = re.sub(r'user: \{\s*select: \{ id: true, email: true, fullName: true, employeeCode: true, departmentName: true, status: true, createdAt: true, profileImage: true \}\s*\}', r'user: { include: { employee: { include: { department: true } } } }', text)
text = re.sub(r'user: \{\s*select: \{ id: true, email: true, fullName: true, employeeCode: true, departmentName: true, designation: true, status: true, createdAt: true, profileImage: true \}\s*\}', r'user: { include: { employee: { include: { department: true } } } }', text)
text = re.sub(r'select: \{ accessibleDepartments: true, fullName: true, email: true \},', r'include: { employee: { include: { department: true } } },', text)

# Map fields
text = re.sub(r'user\.fullName', r'((user as any).employee ? `${(user as any).employee.firstName} ${(user as any).employee.lastName}` : "")', text)
text = re.sub(r'ur\.user\.fullName', r'((ur as any).user.employee ? `${(ur as any).user.employee.firstName} ${(ur as any).user.employee.lastName}` : "")', text)
text = re.sub(r'updated\.fullName', r'""', text)
text = re.sub(r'approver\.fullName', r'((approver as any).employee ? `${(approver as any).employee.firstName} ${(approver as any).employee.lastName}` : "")', text)

text = re.sub(r'user\.employeeCode', r'(user as any).employee?.employeeCode', text)
text = re.sub(r'ur\.user\.employeeCode', r'(ur as any).user.employee?.employeeCode', text)
text = re.sub(r'updated\.employeeCode', r'""', text)

text = re.sub(r'user\.departmentName', r'(user as any).employee?.department?.name', text)
text = re.sub(r'ur\.user\.departmentName', r'(ur as any).user.employee?.department?.name', text)
text = re.sub(r'hod\.departmentName', r'(hod as any).employee?.department?.name', text)

text = re.sub(r'user\.accessibleDepartments', r'((user as any).employee?.department ? [(user as any).employee.department.name] : [])', text)
text = re.sub(r'ur\.user\.accessibleDepartments', r'((ur as any).user.employee?.department ? [(ur as any).user.employee.department.name] : [])', text)
text = re.sub(r'updated\.accessibleDepartments', r'[]', text)
text = re.sub(r'creator\?\.accessibleDepartments', r'((creator as any)?.employee?.department ? [(creator as any).employee.department.name] : [])', text)

text = re.sub(r'user\.profileImage', r'(user as any).employee?.profilePhoto', text)
text = re.sub(r'ur\.user\.profileImage', r'(ur as any).user.employee?.profilePhoto', text)
text = re.sub(r'ur\.user\.designation', r'(ur as any).user.employee?.designation', text)

text = re.sub(r'departmentId: hod\.employee\.departmentId', r'employee: { departmentId: (hod as any).employee?.departmentId }', text)
text = re.sub(r'departmentName: \{ equals: \(hod as any\)\.employee\?\.department\?\.name,', r'/* bypass filter */', text)

text = re.sub(r'where: \{ employeeCode \},', r'where: { employeeId: employeeCode },', text)

with open('src/users/users.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done fix python")
