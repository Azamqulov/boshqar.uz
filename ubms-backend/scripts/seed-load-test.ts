import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function runLoadTestSeed() {
  console.log('🚀 1,000+ demo mahsulotlar va real yuklama ma\'lumotlarini kiritish boshlandi...');
  const startTime = Date.now();

  // 1. Default Unit
  let unit = await prisma.unit.findFirst();
  if (!unit) {
    unit = await prisma.unit.create({
      data: {
        name: 'Dona',
        shortName: 'dona',
        allowDecimal: false,
      },
    });
  }

  // 2. Default Plan
  let plan = await prisma.plan.findFirst();
  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        name: 'Enterprise Ultra',
        priceMonthly: 350000,
        maxBranches: 10,
        maxUsers: 50,
      },
    });
  }

  // 3. User & Business
  let ownerUser = await prisma.user.findFirst({ where: { isSuperAdmin: true } });
  if (!ownerUser) {
    const hashedPassword = await bcrypt.hash('admin12345', 10);
    ownerUser = await prisma.user.create({
      data: {
        phone: '+998901234567',
        email: 'demo@boshqar.uz',
        passwordHash: hashedPassword,
        fullName: 'Baxrom Abduqodirov',
        isSuperAdmin: true,
      },
    });
  }

  let business = await prisma.business.findFirst({
    where: { name: { contains: 'Boshqar.uz Demo Store' } },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Boshqar.uz Megamarket & Restoran Demo',
        businessType: 'shop',
        owner: { connect: { id: ownerUser.id } },
        plan: { connect: { id: plan.id } },
      },
    });
  }

  const tenantId = business.id;

  // 4. Default Branch
  let branch = await prisma.branch.findFirst({ where: { businessId: tenantId } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        businessId: tenantId,
        name: 'Bosh Filial (Chilonzor)',
        address: 'Toshkent sh., Chilonzor tumani',
        phone: '+998901234567',
      },
    });
  }

  // 5. Create 25 Categories
  const categoryNames = [
    'Oziq-ovqat va Sut Mahsulotlari',
    'Ichimliklar va Sharbatlar',
    'Maishiy Kimyo va Tozalash',
    'Kiyim-kechak va Poyabzal',
    'Dorixona va Salomatlik',
    'Elektronika va Aksessuarlar',
    'Restoran Taomlari',
    'Restoran Ichimliklari',
    'Qandolatchilik va Shirinliklar',
    'Gosht va Kolbasa Mahsulotlari',
    'Meva va Sabzavotlar',
    'Konservalar va Ziroatlar',
    'Kosmetika va Parfyumeriya',
    'Kanselariya va Kitoblar',
    'Bolalar Ozuqasi',
    'Sport va Hobbilar',
    'Qurilish Mallari',
    'Avto Ehtiyot Qismlar',
    'Zargarlik va Soatlar',
    'Mebel va Rozgor Buyumlari',
    'Choy va Qahva',
    'Fast-Food va Gamburgerlar',
    'Pitsa va Sushilar',
    'Muzqaymoqlar',
    'Boshqa Mahsulotlar',
  ];

  const categories = [];
  for (const catName of categoryNames) {
    let cat = await prisma.category.findFirst({
      where: { name: catName, businessId: tenantId },
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: catName,
          businessId: tenantId,
        },
      });
    }
    categories.push(cat);
  }

  // 6. Generate 1,000 Products in Bulk
  console.log('📦 1,000 ta tovar yaratilmoqda (Bulk Insert)...');

  const sampleProductsData = [];

  for (let i = 1; i <= 1000; i++) {
    const categoryIndex = i % categories.length;
    const category = categories[categoryIndex];

    const costPrice = Math.floor(Math.random() * 50 + 5) * 1000; // 5,000 to 55,000 UZS
    const price = Math.round(costPrice * (1.2 + Math.random() * 0.3)); // 20-50% margin
    const barcode = `478000${String(i).padStart(7, '0')}`;

    sampleProductsData.push({
      businessId: tenantId,
      branchId: branch.id,
      categoryId: category.id,
      unitId: unit.id,
      name: `Demo Mahsulot #${i} - ${category.name.split(' ')[0]} SKU-${i}`,
      barcode: barcode,
      sku: `SKU-${10000 + i}`,
      salePrice: price,
      purchasePrice: costPrice,
      minStock: 5,
      status: 'active' as const,
    });
  }

  await prisma.product.createMany({
    data: sampleProductsData,
    skipDuplicates: true,
  });

  const totalProductsCount = await prisma.product.count({ where: { businessId: tenantId } });
  console.log(`✅ Bazadagi tovarlar jami soni: ${totalProductsCount} ta!`);

  // 7. Create 50 Customers (Mijozlar)
  console.log('👥 50 ta demo mijoz va nasiya qarzdorlari yaratilmoqda...');
  const customerNames = [
    'Alisher Navoiy', 'Bobur Mirzo', 'Amir Temur', 'Ulugbek Mirzo', 'Jahongir Otajonov',
    'Sardor Rahimov', 'Malika Ahmedova', 'Dilnoza Kubayeva', 'Shoxrux Xon', 'Feruza Jumaniyazova',
    'Otabek Mahkamov', 'Lola Yuldasheva', 'Munisa Rizayeva', 'Rayhon Ganieva', 'Ulugbek Rahmatullayev'
  ];

  const customerData = [];
  for (let c = 1; c <= 50; c++) {
    const name = `${customerNames[c % customerNames.length]} #${c}`;
    const phone = `+99891${String(1000000 + c).padStart(7, '0')}`;
    const debtBalance = c % 3 === 0 ? Math.floor(Math.random() * 500 + 50) * 1000 : 0;

    customerData.push({
      businessId: tenantId,
      fullName: name,
      phone: phone,
      debt: debtBalance,
    });
  }

  await prisma.customer.createMany({
    data: customerData,
    skipDuplicates: true,
  });

  const totalCustomersCount = await prisma.customer.count({ where: { businessId: tenantId } });
  console.log(`✅ Bazadagi mijozlar soni: ${totalCustomersCount} ta!`);

  // 8. Create 300 Completed Demo Orders (Cheklar)
  console.log('🛒 300 ta kassa va restoran sotuv cheklari shakllantirilmoqda...');
  const fetchedProducts = await prisma.product.findMany({
    where: { businessId: tenantId },
    take: 50,
  });

  if (fetchedProducts.length > 0) {
    for (let o = 1; o <= 300; o++) {
      const prod = fetchedProducts[o % fetchedProducts.length];
      const qty = Math.floor(Math.random() * 3 + 1);
      const totalSum = Number(prod.salePrice) * qty;

      const order = await prisma.order.create({
        data: {
          business: { connect: { id: tenantId } },
          branch: { connect: { id: branch.id } },
          orderNumber: `ORD-${20260000 + o}`,
          orderType: o % 5 === 0 ? 'restaurant' : 'pos',
          status: 'completed',
          subtotal: totalSum,
          total: totalSum,
          items: {
            create: [
              {
                productId: prod.id,
                quantity: qty,
                unitPrice: prod.salePrice,
                total: totalSum,
              },
            ],
          },
        },
      });

      // Create Soliq Fiscal Receipt record for sample orders
      if (o % 3 === 0) {
        await prisma.soliqFiscalReceipt.create({
          data: {
            businessId: tenantId,
            orderId: order.id,
            fiscalSign: `UZSOLIQ-LOADTEST-${o}`,
            qrCodeUrl: `https://soliq.uz/check?sign=UZSOLIQ-LOADTEST-${o}&sum=${totalSum}`,
            terminalId: 'VK-UZ-LOADTEST',
            receiptSeq: BigInt(o),
            status: 'SUCCESS',
          },
        });
      }
    }
  }

  const totalOrdersCount = await prisma.order.count({ where: { businessId: tenantId } });
  const totalFiscalReceipts = await prisma.soliqFiscalReceipt.count({ where: { businessId: tenantId } });

  const durationMs = Date.now() - startTime;
  console.log('\n==================================================');
  console.log('🎉 100% JONLI YUKLAMA SEED TESTI YAKUNLANDI!');
  console.log('==================================================');
  console.log(`⏱️ Bajarilish vaqti: ${(durationMs / 1000).toFixed(2)} soniya`);
  console.log(`🏬 Korxona: ${business.name}`);
  console.log(`🏢 Filial: ${branch.name}`);
  console.log(`📦 Jami Mahsulotlar (Products): ${totalProductsCount} ta`);
  console.log(`📁 Jami Kategoriyalar (Categories): ${categories.length} ta`);
  console.log(`👥 Jami Mijozlar (Customers): ${totalCustomersCount} ta`);
  console.log(`🛒 Jami Sotuv Cheklari (Orders): ${totalOrdersCount} ta`);
  console.log(`🧾 Jami Soliq Fiskal Cheklari: ${totalFiscalReceipts} ta`);
  console.log('==================================================\n');
}

runLoadTestSeed()
  .catch((err) => {
    console.error('❌ Load test seed error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
