const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning fake sample data and seeding ONLY the 5 authorized user accounts...');

  // 1. Clean up fake dummy records from tables
  await prisma.followUp.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.ministry.deleteMany({});
  await prisma.multimediaTicket.deleteMany({});

  // 2. Seed ONLY the 5 test user accounts
  const usersToSeed = [
    { username: 'pastor1', name: 'Pr. Carlos Mendoza', role: 'PASTOR', pass: 'pastor1' },
    { username: 'admin', name: 'Coordinador General', role: 'COORDINADOR', pass: 'admin123' },
    { username: 'secretaria1', name: 'Ana María Secretaria', role: 'SECRETARIA', pass: 'secretaria1' },
    { username: 'multimedia1', name: 'Equipo Multimedia', role: 'MULTIMEDIA', pass: 'multimedia1' },
    { username: 'lider1', name: 'Líder Alabanza', role: 'LEADER', pass: 'lider1' },
  ];

  for (const u of usersToSeed) {
    const hash = bcrypt.hashSync(u.pass, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        passwordHash: hash,
        role: u.role,
        name: u.name,
        mustChangePassword: false,
      },
      create: {
        username: u.username,
        name: u.name,
        passwordHash: hash,
        role: u.role,
        mustChangePassword: false,
      },
    });
  }

  console.log('Database cleaned. Only 5 test user accounts remain.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
