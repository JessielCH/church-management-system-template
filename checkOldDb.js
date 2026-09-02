const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.qsmpjzrrzzssiyhryliy:iebb.esperanza.lc@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    },
  },
});

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:');
  console.log(users.map(u => u.username));
}

main().finally(() => prisma.$disconnect());
