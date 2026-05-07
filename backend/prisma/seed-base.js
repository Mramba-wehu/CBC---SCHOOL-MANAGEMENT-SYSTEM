const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📚 Seeding Base School Data...');

  const school = await prisma.school.upsert({
    where: { id: 'wehu-school-id' },
    update: {},
    create: {
      id: 'wehu-school-id',
      name: 'Wehu CBC School',
      email: 'info@wehu.ac.ke'
    }
  });

  const subjects = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'English Language', code: 'ENG' },
    { name: 'Kiswahili', code: 'KISW' },
    { name: 'Science and Technology', code: 'SCI' },
    { name: 'Social Studies', code: 'SOC' }
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: s
    });
  }

  console.log('✅ Base Data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
