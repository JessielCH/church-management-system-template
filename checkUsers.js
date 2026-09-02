const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:');
  console.log(users.map(u => u.username));
}
main().finally(() => prisma.$disconnect());
