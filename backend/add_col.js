const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "profileImage" TEXT;');
    console.log("Column added successfully!");
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log("Column already exists.");
    } else {
      console.error(e);
    }
  } finally {
    await prisma.$disconnect();
  }
}
main();
