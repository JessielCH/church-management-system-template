const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test user accounts for all roles (mustChangePassword = false)...');

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

  // Create Ministries
  await prisma.ministry.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Alabanza y Adoración', description: 'Ministerio de música', leaderName: 'Líder Alabanza' },
      { name: 'Evangelismo', description: 'Alcance y misiones', leaderName: 'Pr. Carlos Mendoza' },
      { name: 'Jóvenes', description: 'Ministerio juvenil', leaderName: 'Ana Mendoza' },
    ],
  });

  // Create Sample Members
  await prisma.member.createMany({
    skipDuplicates: true,
    data: [
      { fullName: 'Pr. Carlos Mendoza', identityCard: '4589201 SC', phone: '+591 710 44321', email: 'carlos@ejemplo.org', ministry: 'Evangelismo', baptismStatus: 'BAPTIZED', status: 'ACTIVE' },
      { fullName: 'Carlos Rodríguez', identityCard: '3940129 SC', phone: '+591 700 12345', email: 'carlos.r@ejemplo.org', ministry: 'Alabanza y Adoración', baptismStatus: 'PENDING', status: 'ACTIVE' },
      { fullName: 'María Gómez', identityCard: '5120934 SC', phone: '+591 750 98765', email: 'maria@ejemplo.org', ministry: 'Jóvenes', baptismStatus: 'NOT_BAPTIZED', status: 'PENDING' },
    ],
  });

  // Create Events
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Culto de Oración y Enseñanza', date: new Date('2026-09-03T19:00:00Z'), location: 'Templo Principal', type: 'SERVICE' },
      { title: 'Culto Dominical Principal', date: new Date('2026-09-06T09:30:00Z'), location: 'Auditorio Principal', type: 'SERVICE' },
    ],
  });

  console.log('Database seeding completed successfully. Direct login enabled (no mandatory password change).');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
