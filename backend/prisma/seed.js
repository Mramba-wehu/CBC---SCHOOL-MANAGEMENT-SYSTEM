const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CBC Curriculum Data (Kenya KICD)...');

  // Helper to find subject ID by code
  const getSubjectId = async (code) => {
    const s = await prisma.subject.findUnique({ where: { code } });
    return s.id;
  };

  const mathId = await getSubjectId('MATH');
  const engId = await getSubjectId('ENG');

  // --- MATHEMATICS GRADE 1 ---
  const mathG1 = await prisma.strand.create({
    data: {
      name: 'Numbers',
      subjectId: mathId,
      gradeLevel: 1,
      orderIndex: 1,
      subStrands: {
        create: [
          {
            name: 'Number Concept',
            orderIndex: 1,
            learningOutcomes: {
              create: [
                { description: 'Sort and group objects based on one attribute.', orderIndex: 1 },
                { description: 'Pair and match objects to compare collections.', orderIndex: 2 },
              ]
            }
          },
          {
            name: 'Whole Numbers',
            orderIndex: 2,
            learningOutcomes: {
              create: [
                { description: 'Rote count numbers 1 to 50.', orderIndex: 1 },
                { description: 'Represent numbers 1 to 20 using concrete objects.', orderIndex: 2 },
              ]
            }
          }
        ]
      }
    }
  });

  // --- MATHEMATICS GRADE 4 ---
  const mathG4 = await prisma.strand.create({
    data: {
      name: 'Whole Numbers',
      subjectId: mathId,
      gradeLevel: 4,
      orderIndex: 1,
      subStrands: {
        create: [
          {
            name: 'Numbers up to 10,000',
            orderIndex: 1,
            learningOutcomes: {
              create: [
                { description: 'Read and write numbers up to 10,000 in symbols.', orderIndex: 1 },
                { description: 'Identify place value of digits up to 10,000.', orderIndex: 2 },
                { description: 'Round off numbers to the nearest tens and hundreds.', orderIndex: 3 },
              ]
            }
          }
        ]
      }
    }
  });

  // --- ENGLISH GRADE 1 ---
  const engG1 = await prisma.strand.create({
    data: {
      name: 'Listening and Speaking',
      subjectId: engId,
      gradeLevel: 1,
      orderIndex: 1,
      subStrands: {
        create: [
          {
            name: 'Greeting and Parting',
            orderIndex: 1,
            learningOutcomes: {
              create: [
                { description: 'Use appropriate greetings and parting words.', orderIndex: 1 },
                { description: 'Introduce self and others politely.', orderIndex: 2 },
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ CBC Curriculum (G1, G4) seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
