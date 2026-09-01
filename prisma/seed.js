const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial church database records with bcrypt hashed passwords...');

  // Hash initial temporary admin password securely ($2a$10$...)
  const hashedAdminPassword = bcrypt.hashSync('admin123', 10);

  // Create Admin User with Username & bcrypt Hashed Password
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: hashedAdminPassword,
    },
    create: {
      username: 'admin',
      name: 'Pastor Principal',
      passwordHash: hashedAdminPassword,
      role: 'PASTOR',
      mustChangePassword: true,
    },
  });

  // Create Ministries
  await prisma.ministry.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Alabanza y Adoración', description: 'Ministerio de música', leaderName: 'Carlos Ruiz' },
      { name: 'Evangelismo', description: 'Alcance y misiones', leaderName: 'Pr. Ricardo Morales' },
      { name: 'Jóvenes', description: 'Ministerio juvenil', leaderName: 'Ana Mendoza' },
    ],
  });

  // Create Sample Members
  await prisma.member.createMany({
    skipDuplicates: true,
    data: [
      { fullName: 'Pr. Ricardo Morales', identityCard: '4589201 SC', phone: '+591 710 44321', email: 'ricardo@ejemplo.org', ministry: 'Evangelismo', baptismStatus: 'BAPTIZED', status: 'ACTIVE' },
      { fullName: 'Carlos Rodríguez', identityCard: '3940129 SC', phone: '+591 700 12345', email: 'carlos@ejemplo.org', ministry: 'Alabanza y Adoración', baptismStatus: 'PENDING', status: 'ACTIVE' },
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

  console.log('Database seeding completed successfully with bcrypt encryption.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
