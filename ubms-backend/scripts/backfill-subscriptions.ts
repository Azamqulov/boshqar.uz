import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillSubscriptions() {
  console.log('🔄 boshqar.uz — Mavjud barcha bizneslar uchun Subscription backfill migratsiyasi boshlandi...');

  try {
    const businesses = await prisma.business.findMany({
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        plan: true,
      },
    });

    console.log(`📊 Jami topilgan bizneslar soni: ${businesses.length} ta`);

    let createdCount = 0;
    let existingCount = 0;
    const now = new Date();
    const future90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days active grace period for existing businesses

    // Get fallback Free Plan if needed
    let fallbackPlan = await prisma.plan.findFirst({
      where: { name: { equals: 'Free', mode: 'insensitive' } },
    });
    if (!fallbackPlan) {
      fallbackPlan = await prisma.plan.findFirst({ orderBy: { priceMonthly: 'asc' } });
    }

    for (const biz of businesses) {
      if (!biz.subscriptions || biz.subscriptions.length === 0) {
        const planId = biz.planId || fallbackPlan?.id || '00000000-0000-0000-0000-000000000001';

        await prisma.$transaction([
          prisma.subscription.create({
            data: {
              businessId: biz.id,
              planId,
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: future90Days,
              cancelAtPeriodEnd: false,
            },
          }),
          prisma.business.update({
            where: { id: biz.id },
            data: {
              status: biz.status === 'suspended' || biz.status === 'cancelled' ? biz.status : 'active',
            },
          }),
        ]);

        console.log(`✅ [YANGI] Biznes "${biz.name}" (ID: ${biz.id}) uchun Subscription yaratildi (+90 kun faol).`);
        createdCount++;
      } else {
        existingCount++;
        console.log(`ℹ️ [MAVJUD] Biznes "${biz.name}" (ID: ${biz.id}) allaqachon subscription mavjud (Status: ${biz.subscriptions[0].status}).`);
      }
    }

    console.log('\n=============================================');
    console.log(`🎉 Migratsiya muvaffaqiyatli yakunlandi!`);
    console.log(`✨ Yangi yaratilgan subscriptionlar: ${createdCount} ta`);
    console.log(`👌 Allaqachon mavjud subscriptionlar: ${existingCount} ta`);
    console.log('=============================================\n');
  } catch (error) {
    console.error('❌ Migratsiya jarayonida xatolik yuz berdi:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfillSubscriptions();
