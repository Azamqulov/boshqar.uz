const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const business = await prisma.business.findFirst({
    where: { name: 'A' },
  });

  if (!business) {
    console.log('Business not found');
    return;
  }

  const now = new Date();
  const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await prisma.subscription.create({
    data: {
      businessId: business.id,
      planId: business.planId,
      status: 'past_due',
      currentPeriodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: pastDate,
      cancelAtPeriodEnd: false,
    },
  });

  console.log('Business A subscription successfully expired (past_due)!');
  await prisma.$disconnect();
}

run();
