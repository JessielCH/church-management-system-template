const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Forcing all users to mustChangePassword = true');
  await prisma.user.updateMany({
    data: {
      mustChangePassword: true
    }
  });
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
