const fs = require('fs');
const content = fs.readFileSync('src/users/users.service.ts', 'utf8');

const prefix = content.split('    // Also update the Department table to set hodId')[0];
const append = `    // Also update the Department table to set hodId
    await this.prisma.department.updateMany({
      where: { 
        name: { equals: dto.departmentName, mode: 'insensitive' },
        organizationId 
      },
      data: { hodId: user.id }
    });

    return { id: user.id, email: user.email, name: user.fullName, departmentName: user.departmentName };
  }

  // ─── Get HODs ─────────────────────────────────────────────────────────────
  async getHods(organizationId: string) {
    const hodRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: 'HOD' } },
    });
    if (!hodRole) return [];

    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId: hodRole.id, revokedAt: null, user: { deletedAt: null } },
      include: {
        user: { select: { id: true, email: true, fullName: true, employeeCode: true, departmentName: true, status: true, createdAt: true } },
      },
    });

    return userRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.fullName,
      employeeCode: ur.user.employeeCode,
      departmentName: ur.user.departmentName,
      status: ur.user.status,
      role: 'HOD',
      createdAt: ur.user.createdAt,
    }));
  }

  // ─── Create Employee ────────────────────────────────────────────────────────
  async createEmployee(dto: import('./dto/create-employee-user.dto').CreateEmployeeUserDto, hodId: string, organizationId: string) {
    const hod = await this.prisma.user.findFirst({ where: { id: hodId, organizationId } });
    if (!hod || !hod.departmentName) throw new NotFoundException('HOD or department not found');

    const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: 'EMPLOYEE' } },
      update: {},
      create: { organizationId, name: 'EMPLOYEE', description: 'Department Employee', isSystem: true },
    });

    const passwordHash = await require('bcrypt').hash(dto.password, 10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const employeeCode = \`EMP-\${randomNum}\`;

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        fullName: dto.name,
        employeeCode,
        departmentName: dto.departmentName,
        designation: dto.designation,
        passwordHash,
        status: 'ACTIVE',
        createdById: hodId,
        userRoles: { create: { roleId: role.id, assignedById: hodId } },
      },
    });

    return { id: user.id, email: user.email, name: user.fullName, departmentName: user.departmentName };
  }

  // ─── Get My Employees (for HOD) ─────────────────────────────────────────────
  async getMyEmployees(hodId: string, organizationId: string) {
    const hod = await this.prisma.user.findFirst({ where: { id: hodId, organizationId } });
    if (!hod || !hod.departmentName) throw new NotFoundException('HOD or department not found');

    const employeeRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: 'EMPLOYEE' } },
    });
    if (!employeeRole) return [];

    const userRoles = await this.prisma.userRole.findMany({
      where: { 
        roleId: employeeRole.id, 
        revokedAt: null, 
        user: { 
          deletedAt: null, 
          OR: [
            { departmentName: hod.departmentName },
            { createdById: hod.id }
          ]
        } 
      },
      include: {
        user: { select: { id: true, email: true, fullName: true, employeeCode: true, departmentName: true, designation: true, status: true, createdAt: true } },
      },
    });

    return userRoles.map((ur) => ({
      id: ur.user.id,
      email: ur.user.email,
      name: ur.user.fullName,
      employeeCode: ur.user.employeeCode,
      departmentName: ur.user.departmentName,
      designation: ur.user.designation,
      status: ur.user.status,
      role: 'EMPLOYEE',
      createdAt: ur.user.createdAt,
    }));
  }
}
`;

fs.writeFileSync('src/users/users.service.ts', prefix + append);
console.log("Fixed users.service.ts");
