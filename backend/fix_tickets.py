import re

with open('src/tickets/tickets.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix user.departmentName -> employee.department.name
content = re.sub(
    r'user\.departmentName',
    r'user.employee?.department?.name',
    content
)

# Add include: { employee: { include: { department: true } } } wherever user is fetched and department is needed.
content = re.sub(
    r'const user = await this\.prisma\.user\.findUnique\(\{ where: \{ id: userId \} \}\);',
    r'const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: { include: { department: true } } } });',
    content
)

# Fix accessibleDepartments
content = re.sub(
    r'select: \{ accessibleDepartments: true \}',
    r'include: { employee: { include: { department: true } } }',
    content
)
content = re.sub(
    r'user\.accessibleDepartments',
    r'(user.employee?.department?.name ? [user.employee.department.name] : [])',
    content
)

with open('src/tickets/tickets.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Tickets fixed!")
