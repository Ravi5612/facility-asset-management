const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst();
  console.log('Org ID:', org.id);

  let itDept = await prisma.department.findFirst({ where: { name: 'IT' } });
  if (!itDept) {
    itDept = await prisma.department.findFirst({ where: { name: { contains: 'IT' } } });
  }
  console.log('IT Dept ID:', itDept?.id, 'Name:', itDept?.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
