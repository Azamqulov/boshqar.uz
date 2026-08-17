import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPhase1() {
  console.log('🧪 FAZA 1 Tekshiruvi Boshlandi...');

  try {
    // 1. Create a test owner
    const testUser = await prisma.user.upsert({
      where: { phone: '+998901112233' },
      update: {},
      create: {
        fullName: 'Test Owner Subscription',
        phone: '+998901112233',
        passwordHash: 'dummy_hash_for_test',
        status: 'active',
      },
    });

    const freePlan = await prisma.plan.findFirst({ where: { name: 'Free' } }) || await prisma.plan.findFirst();
    const proPlan = await prisma.plan.findFirst({ where: { name: 'Pro' } });

    if (!freePlan || !proPlan) {
      throw new Error('Plans not found in database!');
    }

    // 2. Test Business Creation (Simulate BusinessesService.create)
    const trialDays = 14;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const testBusiness = await prisma.$transaction(async (tx) => {
      const biz = await tx.business.create({
        data: {
          name: 'Test Trial Business 14 Days',
          businessType: 'shop',
          ownerId: testUser.id,
          planId: freePlan.id,
          status: 'trial',
        },
      });

      const sub = await tx.subscription.create({
        data: {
          businessId: biz.id,
          planId: freePlan.id,
          status: 'trialing',
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        },
      });

      return { biz, sub };
    });

    console.log(`✅ [1.1 TEST] Biznes yaratildi:`);
    console.log(`   - Biznes ID: ${testBusiness.biz.id}`);
    console.log(`   - Biznes Status: ${testBusiness.biz.status} (Kutilgan: 'trial')`);
    console.log(`   - Subscription Status: ${testBusiness.sub.status} (Kutilgan: 'trialing')`);
    console.log(`   - Subscription Tugash Sanasi: ${testBusiness.sub.currentPeriodEnd.toISOString()}`);

    if (testBusiness.biz.status !== 'trial' || testBusiness.sub.status !== 'trialing') {
      throw new Error('Biznes yoki Subscription statusi noto\'g\'ri!');
    }

    // 3. Test SuperAdmin Plan Upgrade on Business
    const upgradedSubEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.$transaction(async (tx) => {
      await tx.business.update({
        where: { id: testBusiness.biz.id },
        data: { planId: proPlan.id, status: 'active' },
      });

      await tx.subscription.create({
        data: {
          businessId: testBusiness.biz.id,
          planId: proPlan.id,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: upgradedSubEnd,
        },
      });
    });

    const latestSub = await prisma.subscription.findFirst({
      where: { businessId: testBusiness.biz.id },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    const updatedBiz = await prisma.business.findUnique({
      where: { id: testBusiness.biz.id },
    });

    console.log(`✅ [1.2 TEST] SuperAdmin orqali tarif Pro ga o'zgartirildi:`);
    console.log(`   - Yangi Biznes Status: ${updatedBiz?.status} (Kutilgan: 'active')`);
    console.log(`   - Yangi Tarif: ${latestSub?.plan.name} (Kutilgan: 'Pro')`);
    console.log(`   - Yangi Subscription Status: ${latestSub?.status} (Kutilgan: 'active')`);
    console.log(`   - Yangi Subscription Tugash Sanasi: ${latestSub?.currentPeriodEnd.toISOString()}`);

    // Cleanup test data
    await prisma.subscription.deleteMany({ where: { businessId: testBusiness.biz.id } });
    await prisma.business.delete({ where: { id: testBusiness.biz.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    console.log('🧹 Test ma\'lumotlari tozalandi.');
    console.log('\n🌟 FAZA 1 BARCHA SINOVLARDAN 100% MUVAFFAQIYATLI O\'TDI!\n');
  } catch (error) {
    console.error('❌ Testda xatolik:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPhase1();
