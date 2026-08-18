const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { phone: { contains: '770404624' } },
        { phone: '+998770404624' },
        { isSuperAdmin: true },
      ],
    },
  });

  console.log('Found users:', users.map(u => ({ id: u.id, phone: u.phone, status: u.status, isSuperAdmin: u.isSuperAdmin })));

  for (const u of users) {
    const updated = await prisma.user.update({
      where: { id: u.id },
      data: {
        status: 'active',
        isSuperAdmin: true,
      },
    });
    console.log('SUCCESS_UNBLOCKED:', updated.phone, updated.status, updated.isSuperAdmin);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
