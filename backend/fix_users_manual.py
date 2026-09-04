import re

with open('src/users/users.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix create calls: remove fullName, employeeCode, departmentName, accessibleDepartments, profileImage
text = re.sub(r'fullName: dto\.name,\n\s*employeeCode, // Save the generated code\n\s*accessibleDepartments: dto\.departmentIds,', r'', text)
text = re.sub(r'fullName: dto\.name,\n\s*employeeCode,', r'', text)
text = re.sub(r'departmentName: dto\.departmentName,\n\s*designation: dto\.designation,', r'', text)
text = re.sub(r'profileImage: profileImageUrl,', r'', text)
text = re.sub(r'profileImage: profilePhoto,', r'', text)

# Fix findFirst creator, hod
text = re.sub(r'const creator = await this\.prisma\.user\.findFirst\(\{ where: \{ id: creatorId, organizationId \} \}\);', r'const creator = await this.prisma.user.findFirst({ where: { id: creatorId, organizationId }, include: { employee: { include: { department: true } } } });', text)
text = re.sub(r'const hod = await this\.prisma\.user\.findFirst\(\{ where: \{ id: hodId, organizationId \} \}\);', r'const hod = await this.prisma.user.findFirst({ where: { id: hodId, organizationId }, include: { employee: { include: { department: true } } } });', text)

# Fix userRoles.findMany select
text = re.sub(r'include: \{\s*user: \{\s*select: \{ id: true, email: true, fullName: true, employeeCode: true, departmentName: true, status: true, createdAt: true, profileImage: true \}\s*\}\s*\},', r'include: { user: { include: { employee: { include: { department: true } } } } },', text)
text = re.sub(r'include: \{\s*user: \{\s*select: \{ id: true, email: true, fullName: true, employeeCode: true, departmentName: true, designation: true, status: true, createdAt: true, profileImage: true \}\s*\}\s*\},', r'include: { user: { include: { employee: { include: { department: true } } } } },', text)
text = re.sub(r'select: \{ id: true, email: true, fullName: true, employeeCode: true, accessibleDepartments: true, status: true, createdAt: true, profileImage: true \}', r'include: { employee: { include: { department: true } } }', text)

# Fix returns and ur.user mappings using (user as any) safely
text = re.sub(r'name: user\.fullName,', r'name: (user as any).employee ? `${(user as any).employee.firstName} ${(user as any).employee.lastName}` : "",', text)
text = re.sub(r'employeeCode: user\.employeeCode,', r'employeeCode: (user as any).employee?.employeeCode,', text)
text = re.sub(r'departments: user\.accessibleDepartments,', r'departments: (user as any).employee?.department ? [(user as any).employee.department.name] : [],', text)
text = re.sub(r'departmentName: user\.departmentName', r'departmentName: (user as any).employee?.department?.name', text)
text = re.sub(r'profileImage: user\.profileImage,', r'profileImage: (user as any).employee?.profilePhoto,', text)

text = re.sub(r'name: ur\.user\.fullName,', r'name: (ur as any).user.employee ? `${(ur as any).user.employee.firstName} ${(ur as any).user.employee.lastName}` : "",', text)
text = re.sub(r'employeeCode: ur\.user\.employeeCode,', r'employeeCode: (ur as any).user.employee?.employeeCode,', text)
text = re.sub(r'departmentName: ur\.user\.departmentName,', r'departmentName: (ur as any).user.employee?.department?.name,', text)
text = re.sub(r'designation: ur\.user\.designation,', r'designation: (ur as any).user.employee?.designation,', text)
text = re.sub(r'profileImage: ur\.user\.profileImage,', r'profileImage: (ur as any).user.employee?.profilePhoto,', text)

# Other single mappings
text = re.sub(r'creator\?\.accessibleDepartments', r'((creator as any)?.employee?.department ? [(creator as any).employee.department.name] : [])', text)
text = re.sub(r'!hod\.departmentName', r'!(hod as any).employee?.department?.name', text)
text = re.sub(r'hod\.departmentName', r'(hod as any).employee?.department?.name', text)
text = re.sub(r'departmentId: hod\.employee\.departmentId', r'employee: { departmentId: (hod as any).employee.departmentId }', text)
text = re.sub(r'user\.profileImage', r'(user as any).employee?.profilePhoto', text)

with open('src/users/users.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done python")
