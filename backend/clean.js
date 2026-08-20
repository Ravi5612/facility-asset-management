const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const superAdminRole = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
    if (superAdminRole) {
      const deletedRoles = await prisma.userRole.deleteMany({
        where: { roleId: { not: superAdminRole.id } }
      });
      console.log('Deleted ' + deletedRoles.count + ' UserRole records');
    }

    await prisma.department.updateMany({ data: { hodId: null } });
    const depts = await prisma.department.deleteMany({});
    console.log('Deleted ' + depts.count + ' departments');

    const nonSuperAdmins = await prisma.user.findMany({
      where: {
        userRoles: { none: { role: { name: 'SUPER_ADMIN' } } }
      }
    });

    let deletedCount = 0;
    for (const u of nonSuperAdmins) {
      await prisma.user.delete({ where: { id: u.id } });
      deletedCount++;
    }
    console.log('Deleted ' + deletedCount + ' users (HOD/EMPLOYEE/etc)');
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
