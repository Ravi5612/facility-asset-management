const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = await prisma.department.findMany({ select: { id: true, name: true, code: true } });
  console.table(depts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
