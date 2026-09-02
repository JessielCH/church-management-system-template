const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding user accounts with exact usernames as names (no fake names)...');

  const usersToSeed = [
    { username: 'pastor1', name: 'pastor1', role: 'PASTOR', pass: 'pastor1' },
    { username: 'admin', name: 'admin', role: 'COORDINADOR', pass: 'admin123' },
    { username: 'secretaria1', name: 'secretaria1', role: 'SECRETARIA', pass: 'secretaria1' },
    { username: 'multimedia_admin', name: 'multimedia_admin', role: 'MULTIMEDIA', pass: 'multimedia_admin' },
    { username: 'multimedia1', name: 'multimedia1', role: 'MULTIMEDIA', pass: 'multimedia1' },
    { username: 'multimedia2', name: 'multimedia2', role: 'MULTIMEDIA', pass: 'multimedia2' },
    { username: 'lider1', name: 'lider1', role: 'LEADER', pass: 'lider1' },
  ];

  for (const u of usersToSeed) {
    const hash = bcrypt.hashSync(u.pass, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        passwordHash: hash,
        role: u.role,
        name: u.name,
        mustChangePassword: true,
      },
      create: {
        username: u.username,
        name: u.name,
        passwordHash: hash,
        role: u.role,
        mustChangePassword: true,
      },
    });
  }

  // Seed Biblical Verses into Verse table in Supabase
  console.log('Seeding Biblical Verses into Supabase database...');
  await prisma.verse.deleteMany({});
  await prisma.verse.createMany({
    data: [
      {
        text: '«Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo en el Señor no es en vano.»',
        reference: '1 Corintios 15:58',
      },
      {
        text: '«Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.»',
        reference: 'Colosenses 3:23',
      },
      {
        text: '«Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar.»',
        reference: 'Salmos 23:1-2',
      },
    ],
  });

  console.log('Database user accounts and Biblical verses updated in Supabase.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
