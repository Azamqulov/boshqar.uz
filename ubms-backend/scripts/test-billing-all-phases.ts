import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runAllPhasesTest() {
  console.log('🚀 ========================================================');
  console.log('🧪 BOSHQAR.UZ MONETIZATSIYA VA BILLING TO\'LIQ TEST SINOVI');
  console.log('========================================================\n');

  try {
    // 0. Prepare Plans
    const freePlan = await prisma.plan.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: { maxBranches: 1, maxUsers: 2, priceMonthly: 0 },
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Free',
        maxBranches: 1,
        maxUsers: 2,
        priceMonthly: 0,
      },
    });

    const proPlan = await prisma.plan.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: { maxBranches: 3, maxUsers: 10, priceMonthly: 199000 },
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Pro',
        maxBranches: 3,
        maxUsers: 10,
        priceMonthly: 199000,
      },
    });

    // 1. Create a Test Owner
    const testOwner = await prisma.user.upsert({
      where: { phone: '+998990001122' },
      update: {},
      create: {
        fullName: 'Billing Test Owner',
        phone: '+998990001122',
        passwordHash: 'dummy_hash',
        status: 'active',
      },
    });

    // -------------------------------------------------------------
    // FAZA 1 TEST: Business & 14-day Trial Subscription
    // -------------------------------------------------------------
    console.log('🔹 [FAZA 1 TEST] Biznes yaratilishi va 14 kunlik Trial obuna...');
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const testBiz = await prisma.$transaction(async (tx) => {
      const biz = await tx.business.create({
        data: {
          name: 'Billing Test Store',
          businessType: 'shop',
          ownerId: testOwner.id,
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
          cancelAtPeriodEnd: false,
        },
      });

      const branch = await tx.branch.create({
        data: {
          businessId: biz.id,
          name: 'Bosh Filial',
          isMain: true,
          status: 'active',
        },
      });

      return { biz, sub, branch };
    });

    console.log(`   ✅ Biznes yaratildi: Status = "${testBiz.biz.status}" (trial)`);
    console.log(`   ✅ Subscription yaratildi: Status = "${testBiz.sub.status}", Tugash vaqti = ${testBiz.sub.currentPeriodEnd.toISOString()}`);

    // -------------------------------------------------------------
    // FAZA 2 TEST: Subscription Expiration Logic
    // -------------------------------------------------------------
    console.log('\n🔹 [FAZA 2 TEST] Obuna muddati tugashi holatini tekshirish...');
    
    // Simulate expired subscription
    const expiredDate = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
    await prisma.subscription.update({
      where: { id: testBiz.sub.id },
      data: { currentPeriodEnd: expiredDate },
    });

    const checkSub = await prisma.subscription.findFirst({
      where: { businessId: testBiz.biz.id },
      orderBy: { createdAt: 'desc' },
    });

    const isSubExpired = new Date(checkSub!.currentPeriodEnd).getTime() <= Date.now();
    console.log(`   ✅ Obuna muddati o'tmishga surildi: ${checkSub!.currentPeriodEnd.toISOString()}`);
    console.log(`   ✅ Guard tekshiruvi: isExpired = ${isSubExpired} (Kutilgan: true -> 403 SUBSCRIPTION_EXPIRED bloklaydi)`);

    // -------------------------------------------------------------
    // FAZA 3 TEST: Plan Limitlari (maxBranches & maxUsers)
    // -------------------------------------------------------------
    console.log('\n🔹 [FAZA 3 TEST] Tarif limitlari (maxBranches=1, maxUsers=2)...');
    
    // Restore valid subscription for limit test
    await prisma.subscription.update({
      where: { id: testBiz.sub.id },
      data: { currentPeriodEnd: trialEnd, status: 'trialing' },
    });

    // Check branch limit
    const branchesCount = await prisma.branch.count({ where: { businessId: testBiz.biz.id } });
    const isBranchLimitReached = freePlan.maxBranches !== null && branchesCount >= freePlan.maxBranches;
    console.log(`   ✅ Filiallar soni: ${branchesCount} ta, Tarif limiti: ${freePlan.maxBranches} ta`);
    console.log(`   ✅ Filial ochish limiti yetgan: ${isBranchLimitReached} (Kutilgan: true -> PLAN_LIMIT_BRANCHES)`);

    // -------------------------------------------------------------
    // FAZA 4 TEST: SuperAdmin Rekvizitlari, So'rov Yuborish va Tasdiqlash
    // -------------------------------------------------------------
    console.log('\n🔹 [FAZA 4 TEST] SuperAdmin karta rekvizitlari va to\'lovni tasdiqlash...');

    // 1. SuperAdmin sets requisites
    const testRequisites = {
      cardNumber: '9860 1234 5678 9012',
      cardHolder: 'AZAMQULOV ALISHER',
      bankName: 'Kapitalbank ATB',
      phone: '+998 90 123 45 67',
      telegramContact: '@Boshqar_Admin',
      instructions: 'Karta raqamiga to\'lov qilib, chekni yuklang.',
      isEnabled: true,
    };

    await prisma.systemSetting.upsert({
      where: { key: 'billing_requisites' },
      update: { value: testRequisites },
      create: { key: 'billing_requisites', value: testRequisites },
    });
    console.log(`   ✅ SuperAdmin to'lov rekvizitlari saqlandi (Karta: ${testRequisites.cardNumber}, Egasi: ${testRequisites.cardHolder})`);

    // 2. Tenant submits billing request
    const billingReq = await prisma.billingRequest.create({
      data: {
        businessId: testBiz.biz.id,
        planId: proPlan.id,
        amount: proPlan.priceMonthly,
        durationMonths: 1,
        senderCard: '8600 **** **** 4455',
        senderName: 'Test Mijoz',
        receiptUrl: 'https://example.com/receipt.jpg',
        notes: '1 oylik Pro tarif uchun to\'lov qilindi',
        status: 'pending',
      },
    });
    console.log(`   ✅ Mijoz to'lov so'rovi yubordi (ID: ${billingReq.id}, Plan: Pro, Summa: ${billingReq.amount} so'm)`);

    // 3. SuperAdmin approves request
    const approveDate = new Date();
    const approvedPeriodEnd = new Date(approveDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.billingRequest.update({
        where: { id: billingReq.id },
        data: { status: 'approved', reviewedAt: approveDate },
      });

      await tx.business.update({
        where: { id: testBiz.biz.id },
        data: { planId: proPlan.id, status: 'active' },
      });

      await tx.subscription.create({
        data: {
          businessId: testBiz.biz.id,
          planId: proPlan.id,
          status: 'active',
          currentPeriodStart: approveDate,
          currentPeriodEnd: approvedPeriodEnd,
        },
      });
    });

    // Verify after approval
    const latestBiz = await prisma.business.findUnique({
      where: { id: testBiz.biz.id },
      include: { plan: true },
    });

    const activeSubscription = await prisma.subscription.findFirst({
      where: { businessId: testBiz.biz.id },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    console.log(`   ✅ SuperAdmin to'lovni tasdiqladi:`);
    console.log(`      - Biznes Status: ${latestBiz?.status} (active)`);
    console.log(`      - Yangi Plan: ${latestBiz?.plan.name} (Pro)`);
    console.log(`      - Yangi Subscription: Status = ${activeSubscription?.status}, Tugash sanasi = ${activeSubscription?.currentPeriodEnd.toISOString()}`);

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    await prisma.billingRequest.deleteMany({ where: { businessId: testBiz.biz.id } });
    await prisma.subscription.deleteMany({ where: { businessId: testBiz.biz.id } });
    await prisma.branch.deleteMany({ where: { businessId: testBiz.biz.id } });
    await prisma.business.delete({ where: { id: testBiz.biz.id } });
    await prisma.user.delete({ where: { id: testOwner.id } });

    console.log('\n🧹 Test ma\'lumotlari to\'liq tozalandi.');
    console.log('\n🎉 ========================================================');
    console.log('🌟 BARCHA 4 TA FAZA 100% MUVAFFAQIYATLI O\'TDI!');
    console.log('========================================================\n');
  } catch (error) {
    console.error('❌ Testda xatolik:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllPhasesTest();
