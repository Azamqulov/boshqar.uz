const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const businesses = await prisma.business.findMany({
    include: {
      plan: true,
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 2 },
    },
  });

  console.log(
    JSON.stringify(
      businesses.map((b) => ({
        id: b.id,
        name: b.name,
        plan: b.plan?.name,
        subs: b.subscriptions.map((s) => ({
          status: s.status,
          start: s.currentPeriodStart,
          end: s.currentPeriodEnd,
        })),
      })),
      null,
      2,
    ),
  );
  await prisma.$disconnect();
}

run();
