import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Deleting old admin...');
  
  // Find old user
  const oldUser = await prisma.user.findFirst({
    where: { email: 'admin@gate2desk.com' }
  });

  if (oldUser) {
    // Delete UserRole first (Foreign Key constraint)
    await prisma.userRole.deleteMany({
      where: { userId: oldUser.id }
    });
    // Delete User
    await prisma.user.delete({
      where: { id: oldUser.id }
    });
    console.log('✅ Old admin deleted.');
  }

  console.log('🌱 Seeding NEW Super Admin...');

  // 1. Get or Create Organization
  const org = await prisma.organization.upsert({
    where: { code: 'DRIT' },
    update: {},
    create: {
      name: 'DR IT Group',
      code: 'DRIT',
      status: 'ACTIVE',
    },
  });

  // 2. Get or Create Role
  const role = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: 'SUPER_ADMIN',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'SUPER_ADMIN',
      description: 'Super Administrator with all permissions',
      isSystem: true,
    },
  });

  // 3. Create NEW Super Admin User
  const passwordHash = await bcrypt.hash('superadmin', 10);
  
  const existingNewUser = await prisma.user.findFirst({
    where: { email: 'superadmin@gmail.com' },
  });

  if (!existingNewUser) {
    const newUser = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: 'superadmin@gmail.com',
        passwordHash,
        status: 'ACTIVE',
      },
    });

    // Link Role
    await prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: role.id,
        assignedById: newUser.id,
      },
    });

    console.log('✅ NEW Super Admin created successfully!');
    console.log('Email: superadmin@gmail.com');
    console.log('Password: superadmin');
  } else {
    console.log('⚠️ NEW Super Admin already exists!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
