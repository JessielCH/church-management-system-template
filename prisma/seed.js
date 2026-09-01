const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Multimedia Admin and Multimedia 1 & 2 accounts...');

  const usersToSeed = [
    { username: 'pastor1', name: 'Pr. Carlos Mendoza', role: 'PASTOR', pass: 'pastor1' },
    { username: 'admin', name: 'Coordinador General', role: 'COORDINADOR', pass: 'admin123' },
    { username: 'secretaria1', name: 'Ana María Secretaria', role: 'SECRETARIA', pass: 'secretaria1' },
    { username: 'multimedia_admin', name: 'Administrador Multimedia', role: 'MULTIMEDIA', pass: 'multimedia_admin' },
    { username: 'multimedia1', name: 'Multimedia Operador 1', role: 'MULTIMEDIA', pass: 'multimedia1' },
    { username: 'multimedia2', name: 'Multimedia Operador 2', role: 'MULTIMEDIA', pass: 'multimedia2' },
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

  console.log('Database user accounts updated with Multimedia Admin, Multimedia 1, and Multimedia 2.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
