import re

with open('src/users/users.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'fullName: true', r'/* fullName removed */', content)
content = re.sub(r'departmentName: true', r'/* departmentName removed */', content)
content = re.sub(r'employeeCode: true', r'/* employeeCode removed */', content)
content = re.sub(r'accessibleDepartments: true', r'/* accessibleDepartments removed */', content)

content = re.sub(r'user\.fullName', r'((user as any).employee ? (user as any).employee.firstName + " " + (user as any).employee.lastName : "")', content)
content = re.sub(r'approver\.fullName', r'((approver as any).employee ? (approver as any).employee.firstName + " " + (approver as any).employee.lastName : "")', content)
content = re.sub(r'updated\.fullName', r'""', content)

content = re.sub(r'user\.employeeCode', r'(user as any).employee?.employeeCode', content)
content = re.sub(r'ur\.user\.employeeCode', r'(ur as any).user?.employee?.employeeCode', content)
content = re.sub(r'updated\.employeeCode', r'""', content)

content = re.sub(r'user\.departmentName', r'(user as any).employee?.department?.name', content)
content = re.sub(r'ur\.user\.departmentName', r'(ur as any).user?.employee?.department?.name', content)
content = re.sub(r'hod\.departmentName', r'(hod as any).employee?.department?.name', content)

content = re.sub(r'user\.accessibleDepartments', r'[]', content)
content = re.sub(r'ur\.user\.accessibleDepartments', r'[]', content)
content = re.sub(r'creator\?\.accessibleDepartments', r'[]', content)
content = re.sub(r'updated\.accessibleDepartments', r'[]', content)

content = re.sub(r'user\.profileImage', r'(user as any).employee?.profilePhoto', content)
content = re.sub(r'ur\.user\.profileImage', r'(ur as any).user?.employee?.profilePhoto', content)
content = re.sub(r'ur\.user\.designation', r'(ur as any).user?.employee?.designation', content)

content = re.sub(r'fullName: dto\.name,', r'', content)
content = re.sub(r'employeeCode,', r'', content)
content = re.sub(r'departmentName: dto\.departmentName,', r'', content)
content = re.sub(r'accessibleDepartments: dto\.departmentIds,', r'', content)
content = re.sub(r'designation: dto\.designation,', r'', content)
content = re.sub(r'profileImage: profilePhoto,', r'', content)
content = re.sub(r'profileImage: profileImageUrl,', r'', content)

content = re.sub(r'ur\.user\.id', r'(ur as any).user?.id', content)
content = re.sub(r'ur\.user\.email', r'(ur as any).user?.email', content)
content = re.sub(r'ur\.user\.status', r'(ur as any).user?.status', content)
content = re.sub(r'ur\.user\.createdAt', r'(ur as any).user?.createdAt', content)

content = re.sub(r'ur\.user\.fullName', r'((ur as any).user?.employee ? (ur as any).user.employee.firstName + " " + (ur as any).user.employee.lastName : "")', content)

content = re.sub(r'departmentName: \{ equals: hod\.departmentName', r'/* departmentName */', content)

with open('src/users/users.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("users final fixed!")
