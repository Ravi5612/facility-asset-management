const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { userRoles: { some: { role: { name: 'EMPLOYEE' } } } }
  });

  for (const user of users) {
    const dept = await prisma.department.findFirst({
      where: { name: { equals: user.departmentName, mode: 'insensitive' } }
    });
    
    if (!dept) {
      console.log('No department found for user', user.email);
      continue;
    }

    const exists = await prisma.employee.findUnique({ where: { id: user.id } });
    if (!exists) {
      await prisma.employee.create({
        data: {
          id: user.id,
          organizationId: user.organizationId,
          firstName: user.fullName.split(' ')[0] || 'Unknown',
          lastName: user.fullName.split(' ').slice(1).join(' ') || '',
          email: user.email,
          designation: user.designation || 'Employee',
          departmentId: dept.id,
          joiningDate: new Date(),
          employeeCode: user.employeeCode || `EMP-${Math.floor(Math.random()*9000)}`
        }
      });
      console.log('Created employee for', user.email);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
