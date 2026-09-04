import re

with open('src/users/users.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix getMyDepartments
content = re.sub(
    r'select: \{ accessibleDepartments: true, fullName: true, email: true \},',
    r'include: { employee: true },',
    content
)
content = re.sub(
    r'departments: user.accessibleDepartments,',
    r'departments: [], // DEPRECATED',
    content
)
content = re.sub(
    r'assignedTo: user.fullName \|\| user.email,',
    r'assignedTo: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email,',
    content
)

# Fix createSubAdmin
content = re.sub(
    r'const codeExists = await this.prisma.user.findUnique\(\{\s*where: \{ employeeCode \},\s*\}\);',
    r'const codeExists = await this.prisma.employee.findUnique({ where: { employeeCode } });',
    content
)
content = re.sub(
    r'fullName: dto\.name,\s*employeeCode, // Save the generated code\s*accessibleDepartments: dto\.departmentIds,',
    r'',
    content
)
content = re.sub(
    r'profileImage: profileImageUrl,\s*userRoles: \{',
    r'userRoles: {',
    content
)

# In createSubAdmin we must add employee creation if we dropped the fields.
# We'll just append it after user creation.
create_subadmin_replace = r'''
    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        passwordHash,
        status: 'ACTIVE',
        createdById: creatorId,
        userRoles: { create: { roleId: role.id, assignedById: creatorId } },
        employee: {
          create: {
            organizationId,
            employeeCode,
            firstName: dto.name.split(' ')[0],
            lastName: dto.name.split(' ').slice(1).join(' ') || '',
            designation: 'Sub-Admin',
            departmentId: dto.departmentIds[0], // fallback
            profilePhoto: profileImageUrl,
          }
        }
      },
      include: { employee: true }
    });
'''
content = re.sub(r'const user = await this\.prisma\.user\.create\(\{[\s\S]*?createdById: creatorId,\s*userRoles: \{ create: \{ roleId: role\.id, assignedById: creatorId \} \},\s*\},\s*\}\);', create_subadmin_replace, content)


content = re.sub(r'name: user\.fullName,', r'name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : "",', content)
content = re.sub(r'employeeCode: user\.employeeCode,', r'employeeCode: user.employee?.employeeCode,', content)
content = re.sub(r'departments: user\.accessibleDepartments,', r'departments: [],', content)
content = re.sub(r'profileImage: user\.profileImage,', r'profileImage: user.employee?.profilePhoto,', content)

# Fix getSubAdmins
content = re.sub(
    r'user: \{ select: \{ id: true, email: true, fullName: true, employeeCode: true, accessibleDepartments: true, status: true, createdAt: true, profileImage: true \} \}',
    r'user: { include: { employee: true } }',
    content
)
content = re.sub(r'name: ur\.user\.fullName,', r'name: ur.user.employee ? `${ur.user.employee.firstName} ${ur.user.employee.lastName}` : "",', content)
content = re.sub(r'employeeCode: ur\.user\.employeeCode,', r'employeeCode: ur.user.employee?.employeeCode,', content)
content = re.sub(r'departments: ur\.user\.accessibleDepartments,', r'departments: [],', content)

# Fix updateSubAdmin
content = re.sub(r'\.\.\.\(dto\.name && \{ fullName: dto\.name \}\),', r'', content)
content = re.sub(r'\.\.\.\(dto\.departmentIds && \{ accessibleDepartments: dto\.departmentIds \}\),', r'', content)
content = re.sub(r'name: updated\.fullName,', r'name: dto.name || "",', content)
content = re.sub(r'departments: updated\.accessibleDepartments,', r'departments: [],', content)
content = re.sub(r'employeeCode: updated\.employeeCode,', r'employeeCode: "",', content)

# Fix createHod
content = re.sub(r'const allowedDepts = creator\?\.accessibleDepartments \|\| \[\];', r'const allowedDepts = creator?.employee?.departmentId ? [creator.employee.departmentId] : [];', content)

create_hod_user_replace = r'''
    const department = await this.prisma.department.findFirst({
      where: { name: { equals: dto.departmentName, mode: 'insensitive' }, organizationId }
    });

    if (!department) {
      throw new NotFoundException(`Department "${dto.departmentName}" not found. HOD not created.`);
    }

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        passwordHash,
        status: 'ACTIVE',
        createdById: creatorId,
        userRoles: { create: { roleId: role.id, assignedById: creatorId } },
        employee: {
          create: {
            organizationId,
            employeeCode,
            firstName: dto.name.split(' ')[0],
            lastName: dto.name.split(' ').slice(1).join(' ') || '',
            designation: 'Head of Department',
            departmentId: department.id,
            profilePhoto: profileImageUrl,
            joiningDate: new Date()
          }
        }
      },
      include: { employee: { include: { department: true } } }
    });
'''
content = re.sub(r'const user = await this\.prisma\.user\.create\(\{[\s\S]*?employeeCode[\s\S]*?\}\);\s*\}\);', create_hod_user_replace, content)

content = re.sub(r'departmentName: user\.departmentName', r'departmentName: user.employee?.department?.name', content)


# getHods
content = re.sub(
    r'user: \{ select: \{ id: true, email: true, fullName: true, employeeCode: true, departmentName: true, status: true, createdAt: true, profileImage: true \} \}',
    r'user: { include: { employee: { include: { department: true } } } }',
    content
)
content = re.sub(r'departmentName: ur\.user\.departmentName,', r'departmentName: ur.user.employee?.department?.name,', content)

# updateHod
# similar empty replacements
content = re.sub(r'name: updated\.fullName,', r'name: "",', content)

# createEmployee
content = re.sub(r'if \(\!hod \|\| \!hod\.departmentName\)', r'if (!hod || !hod.employee?.departmentId)', content)
content = re.sub(r'fullName: dto\.name,\s*employeeCode,\s*departmentName: dto\.departmentName,\s*designation: dto\.designation,', r'', content)
content = re.sub(r'profileImage: profilePhoto,', r'', content)

# getMyEmployees
content = re.sub(r'departmentName: \{ equals: hod\.departmentName, mode: \'insensitive\' \}', r'departmentId: hod.employee.departmentId', content)
content = re.sub(r'user: \{ select: \{ id: true, email: true, fullName: true, employeeCode: true, departmentName: true, designation: true, status: true, createdAt: true, profileImage: true \} \}', r'user: { include: { employee: { include: { department: true } } } }', content)
content = re.sub(r'designation: ur\.user\.designation,', r'designation: ur.user.employee?.designation,', content)
content = re.sub(r'profileImage: ur\.user\.profileImage,', r'profileImage: ur.user.employee?.profilePhoto,', content)


# updateMyProfile
content = re.sub(r'let profileImageUrl = user\.profileImage;', r'let profileImageUrl = user.employee?.profilePhoto;', content)
content = re.sub(r'await this\.prisma\.user\.update\(\{ where: \{ id: user\.id \}, data: \{ profileImage: profileImageUrl \} \}\);', r'await this.prisma.employee.update({ where: { id: user.employeeId! }, data: { profilePhoto: profileImageUrl } });', content)
content = re.sub(r'if \(profileImageUrl !== user\.profileImage\)', r'if (profileImageUrl !== user.employee?.profilePhoto)', content)

with open('src/users/users.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
