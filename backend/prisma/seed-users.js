const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  console.log('👤 Seeding System Users...');

  // 1. Create Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@wehu.ac.ke' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'admin@wehu.ac.ke',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  // 2. Create Principal
  await prisma.user.upsert({
    where: { email: 'principal@wehu.ac.ke' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'principal@wehu.ac.ke',
      passwordHash: hashedPassword,
      role: 'PRINCIPAL',
      isActive: true,
      staffProfile: {
        create: {
          firstName: 'Maina',
          lastName: 'Karanja',
          phone: '+254700000001'
        }
      }
    }
  });

  // 3. Create Teacher
  await prisma.user.upsert({
    where: { email: 'teacher@wehu.ac.ke' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'teacher@wehu.ac.ke',
      passwordHash: hashedPassword,
      role: 'SUBJECT_TEACHER',
      isActive: true,
      staffProfile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Kamau',
          phone: '+254700000002'
        }
      }
    }
  });

  // 4. Create Parent
  await prisma.user.upsert({
    where: { email: 'parent@wehu.ac.ke' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'parent@wehu.ac.ke',
      passwordHash: hashedPassword,
      role: 'PARENT',
      isActive: true,
      parentProfile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+254700000003',
          relationship: 'Father'
        }
      }
    }
  });

  console.log('✅ System Users seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
