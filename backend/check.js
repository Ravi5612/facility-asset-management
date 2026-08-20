const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    include: { userRoles: { include: { role: true } } }
  });
  console.log(users.map(u => ({ id: u.id, email: u.email, dept: u.departmentName, roles: u.userRoles.map(r => r.role.name) })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
