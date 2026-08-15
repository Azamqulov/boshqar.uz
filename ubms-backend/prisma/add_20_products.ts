import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDemoProducts() {
  console.log('--- 🚀 20 ta Yangi Demo Mahsulot va Kategoriyalar qo\'shilmoqda ---');

  // 1. SuperAdmin va uning Biznesini topamiz
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: '+998770404624' },
        { phone: '998770404624' },
        { isSuperAdmin: true },
      ],
    },
    include: {
      ownedBusinesses: {
        include: {
          branches: true,
        },
      },
    },
  });

  let business = user?.ownedBusinesses[0];

  if (!business) {
    business = await prisma.business.findFirst({
      include: {
        branches: true,
      },
    });
  }

  if (!business) {
    console.error('❌ Biznes topilmadi!');
    return;
  }

  const branch = business.branches[0] || (await prisma.branch.findFirst({ where: { businessId: business.id } }));
  if (!branch) {
    console.error('❌ Filial topilmadi!');
    return;
  }

  console.log(`🏢 Biznes: ${business.name}, Filial: ${branch.name}`);

  // 2. O'lchov birliklarini olish (Dona, kg, litr)
  let unitDona = await prisma.unit.findFirst({ where: { shortName: 'dona' } });
  let unitKg = await prisma.unit.findFirst({ where: { shortName: 'kg' } });
  let unitLitr = await prisma.unit.findFirst({ where: { shortName: 'l' } });

  if (!unitDona) {
    unitDona = await prisma.unit.create({
      data: { name: 'Dona', shortName: 'dona', allowDecimal: false },
    });
  }
  if (!unitKg) {
    unitKg = await prisma.unit.create({
      data: { name: 'Kilogramm', shortName: 'kg', allowDecimal: true },
    });
  }
  if (!unitLitr) {
    unitLitr = await prisma.unit.create({
      data: { name: 'Litr', shortName: 'l', allowDecimal: true },
    });
  }

  // 3. To'liq va chiroyli kategoriyalar yaratish
  const categoriesData = [
    { name: 'Ichimliklar va Sharbatlar', icon: 'CupSoda', color: '#3B82F6', sortOrder: 1 },
    { name: 'Sut va Qatiq Mahsulotlari', icon: 'Milk', color: '#06B6D4', sortOrder: 2 },
    { name: 'Non va Qandolat', icon: 'Cake', color: '#F59E0B', sortOrder: 3 },
    { name: 'Go\'sht va Parranda', icon: 'Beef', color: '#EF4444', sortOrder: 4 },
    { name: 'Meva va Sabzavotlar', icon: 'Apple', color: '#10B981', sortOrder: 5 },
    { name: 'Qahva, Choy va Issiq Ichimliklar', icon: 'Coffee', color: '#8B5CF6', sortOrder: 6 },
    { name: 'Maishiy Kimyo va Gigiyena', icon: 'Sparkles', color: '#EC4899', sortOrder: 7 },
    { name: 'Yormalar va Yog\' mahsulotlari', icon: 'Wheat', color: '#D97706', sortOrder: 8 },
  ];

  const categoryMap: { [key: string]: string } = {};

  for (const cat of categoriesData) {
    let existing = await prisma.category.findFirst({
      where: { businessId: business.id, name: cat.name },
    });
    if (!existing) {
      existing = await prisma.category.create({
        data: {
          businessId: business.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          sortOrder: cat.sortOrder,
        },
      });
    }
    categoryMap[cat.name] = existing.id;
  }

  // 4. 20 ta Yangi, boy va real mahsulotlar ro'yxati
  const productsList = [
    // 1-4: Ichimliklar
    {
      name: 'Coca-Cola Classic 1.5L',
      sku: 'PRD-CC-15',
      barcode: '4780010010015',
      brand: 'Coca-Cola',
      category: 'Ichimliklar va Sharbatlar',
      unitId: unitDona.id,
      purchasePrice: 10500,
      salePrice: 14500,
      stock: 120,
      minStock: 20,
      description: 'Gazlangan shirin ichimlik, 1.5 litr plastik idishda',
    },
    {
      name: 'Pepsi Max 1.0L (Shakarsiz)',
      sku: 'PRD-PEP-10',
      barcode: '4780010010022',
      brand: 'Pepsi',
      category: 'Ichimliklar va Sharbatlar',
      unitId: unitDona.id,
      purchasePrice: 8500,
      salePrice: 12000,
      stock: 85,
      minStock: 15,
      description: 'Shakarsiz salqinlantiruvchi gazlangan ichimlik',
    },
    {
      name: 'Hydrolife Gazsiz Tabiiy Suv 1.5L',
      sku: 'PRD-HYD-15',
      barcode: '4780010010039',
      brand: 'Hydrolife',
      category: 'Ichimliklar va Sharbatlar',
      unitId: unitDona.id,
      purchasePrice: 3500,
      salePrice: 5500,
      stock: 200,
      minStock: 30,
      description: 'Tog\' buloq suvi, minerallarga boy',
    },
    {
      name: 'Dena Olma-Uzum Neftari 1L',
      sku: 'PRD-DEN-01',
      barcode: '4780010010046',
      brand: 'Dena',
      category: 'Ichimliklar va Sharbatlar',
      unitId: unitDona.id,
      purchasePrice: 11000,
      salePrice: 15500,
      stock: 65,
      minStock: 12,
      description: 'Tabiiy mevalardan tayyorlangan sharbat',
    },

    // 5-7: Sut mahsulotlari
    {
      name: 'Musaffo Sut 3.2% Tetrapak 1L',
      sku: 'PRD-SUT-01',
      barcode: '4780010020014',
      brand: 'Musaffo',
      category: 'Sut va Qatiq Mahsulotlari',
      unitId: unitLitr.id,
      purchasePrice: 10000,
      salePrice: 13500,
      stock: 50,
      minStock: 10,
      description: 'Pasterizatsiyalangan tabiiy sigir suti 3.2%',
    },
    {
      name: 'Nestle Quyuqlashtirilgan Sut (Sgushonka) 370g',
      sku: 'PRD-SGU-01',
      barcode: '4780010020021',
      brand: 'Nestle',
      category: 'Sut va Qatiq Mahsulotlari',
      unitId: unitDona.id,
      purchasePrice: 14000,
      salePrice: 19500,
      stock: 40,
      minStock: 8,
      description: 'Shakarli quyultirilgan sut',
    },
    {
      name: 'President Sariyoq 82% 200g',
      sku: 'PRD-YOG-01',
      barcode: '4780010020038',
      brand: 'President',
      category: 'Sut va Qatiq Mahsulotlari',
      unitId: unitDona.id,
      purchasePrice: 24000,
      salePrice: 32000,
      stock: 30,
      minStock: 5,
      description: 'Tabiiy qaymoqli saryog\' 82.5%',
    },

    // 8-10: Non va Qandolat
    {
      name: 'Toshkent Patir Noni (Maxsus)',
      sku: 'PRD-NON-01',
      barcode: '4780010030013',
      brand: 'Nonvoyxona',
      category: 'Non va Qandolat',
      unitId: unitDona.id,
      purchasePrice: 4500,
      salePrice: 7000,
      stock: 90,
      minStock: 15,
      description: 'Issiq tandirda yopilgan sariyog\'li patir non',
    },
    {
      name: 'Raffaello Konfet Qutisi 150g',
      sku: 'PRD-RAF-01',
      barcode: '4780010030020',
      brand: 'Ferrero',
      category: 'Non va Qandolat',
      unitId: unitDona.id,
      purchasePrice: 38000,
      salePrice: 49000,
      stock: 25,
      minStock: 5,
      description: 'Bodom va kokos qirindili nozik konfet',
    },
    {
      name: 'Nutella Shokoladli Pasta 350g',
      sku: 'PRD-NUT-01',
      barcode: '4780010030037',
      brand: 'Ferrero',
      category: 'Non va Qandolat',
      unitId: unitDona.id,
      purchasePrice: 42000,
      salePrice: 58000,
      stock: 35,
      minStock: 6,
      description: 'O\'rmon yong\'og\'i va kakao qo\'shilgan shokolad kremi',
    },

    // 11-13: Go'sht va Parranda
    {
      name: 'Rozmetov Halol Dudlangan Go\'sht 1kg',
      sku: 'PRD-ROZ-01',
      barcode: '4780010040012',
      brand: 'Rozmetov',
      category: 'Go\'sht va Parranda',
      unitId: unitKg.id,
      purchasePrice: 85000,
      salePrice: 115000,
      stock: 22,
      minStock: 4,
      description: 'Oliy navli mol go\'shtidan tayyorlangan delikates',
    },
    {
      name: 'Toza Tovuq Filesi Muzlatilgan 1kg',
      sku: 'PRD-TOV-01',
      barcode: '4780010040029',
      brand: 'Saxovat Broyler',
      category: 'Go\'sht va Parranda',
      unitId: unitKg.id,
      purchasePrice: 43000,
      salePrice: 56000,
      stock: 45,
      minStock: 10,
      description: 'Yumshoq tovuq ko\'krak filesi',
    },

    // 14-16: Meva va Sabzavotlar
    {
      name: 'Banan Ekvador Premium 1kg',
      sku: 'PRD-BAN-01',
      barcode: '4780010050011',
      brand: 'Import',
      category: 'Meva va Sabzavotlar',
      unitId: unitKg.id,
      purchasePrice: 18000,
      salePrice: 24000,
      stock: 80,
      minStock: 15,
      description: 'Shirin va barra yangi kelgan bananlar',
    },
    {
      name: 'Qizil Pomidor (Yusupov) 1kg',
      sku: 'PRD-POM-01',
      barcode: '4780010050028',
      brand: 'Mahalliy',
      category: 'Meva va Sabzavotlar',
      unitId: unitKg.id,
      purchasePrice: 14000,
      salePrice: 20000,
      stock: 60,
      minStock: 10,
      description: 'Shirali va go\'shtdor issiqxona pomidori',
    },
    {
      name: 'Limon Mahalliy Toshkent 1kg',
      sku: 'PRD-LIM-01',
      barcode: '4780010050035',
      brand: 'Mahalliy',
      category: 'Meva va Sabzavotlar',
      unitId: unitKg.id,
      purchasePrice: 22000,
      salePrice: 30000,
      stock: 35,
      minStock: 8,
      description: 'Yupqa po\'stloqli xushbo\'y o\'zbek limoni',
    },

    // 17-18: Qahva va Choy
    {
      name: 'Nescafe Gold Qahva Shisha banka 190g',
      sku: 'PRD-NES-190',
      barcode: '4780010060010',
      brand: 'Nescafe',
      category: 'Qahva, Choy va Issiq Ichimliklar',
      unitId: unitDona.id,
      purchasePrice: 62000,
      salePrice: 82000,
      stock: 30,
      minStock: 5,
      description: 'Arabika donachalaridan tayyorlangan eriydigan qahva',
    },
    {
      name: 'Greenfield Golden Ceylon Qora Choy 100 paket',
      sku: 'PRD-GRN-100',
      barcode: '4780010060027',
      brand: 'Greenfield',
      category: 'Qahva, Choy va Issiq Ichimliklar',
      unitId: unitDona.id,
      purchasePrice: 38000,
      salePrice: 49000,
      stock: 40,
      minStock: 8,
      description: 'Tog\'li Seylon qora choyi, 100 dona folgali paket',
    },

    // 19-20: Maishiy Kimyo va Oziq-ovqat
    {
      name: 'Ariel Avtomat Kir Yuvish Geli 2.2L',
      sku: 'PRD-ARI-22',
      barcode: '4780010070019',
      brand: 'Ariel',
      category: 'Maishiy Kimyo va Gigiyena',
      unitId: unitDona.id,
      purchasePrice: 85000,
      salePrice: 112000,
      stock: 25,
      minStock: 5,
      description: 'Rangli va oq kiyimlar uchun konsentrlangan suyuq kir yuvish vositasi',
    },
    {
      name: 'Fairy Lemon Idish Yuvish Suyuqligi 1.35L',
      sku: 'PRD-FAI-13',
      barcode: '4780010070026',
      brand: 'Fairy',
      category: 'Maishiy Kimyo va Gigiyena',
      unitId: unitDona.id,
      purchasePrice: 29000,
      salePrice: 39500,
      stock: 45,
      minStock: 8,
      description: 'Qalin ko\'pikli, yog\'larni bir zumda ketkazuvi vosita',
    },
    {
      name: 'Oila Tanlovi Kungaboqar Yog\'i 5L',
      sku: 'PRD-YOG-05',
      barcode: '4780010080018',
      brand: 'Oila Tanlovi',
      category: 'Yormalar va Yog\' mahsulotlari',
      unitId: unitDona.id,
      purchasePrice: 72000,
      salePrice: 89000,
      stock: 55,
      minStock: 10,
      description: 'Tozalangan va xidsizlantirilgan 1-navli kungaboqar yog\'i',
    },
  ];

  let addedCount = 0;

  for (const item of productsList) {
    const categoryId = categoryMap[item.category];

    const product = await prisma.product.upsert({
      where: {
        businessId_sku: {
          businessId: business.id,
          sku: item.sku,
        },
      },
      update: {
        name: item.name,
        barcode: item.barcode,
        brand: item.brand,
        categoryId: categoryId,
        unitId: item.unitId,
        purchasePrice: item.purchasePrice,
        salePrice: item.salePrice,
        minStock: item.minStock,
        description: item.description,
        status: 'active',
      },
      create: {
        businessId: business.id,
        branchId: branch.id,
        name: item.name,
        sku: item.sku,
        barcode: item.barcode,
        brand: item.brand,
        categoryId: categoryId,
        unitId: item.unitId,
        purchasePrice: item.purchasePrice,
        salePrice: item.salePrice,
        minStock: item.minStock,
        description: item.description,
        status: 'active',
      },
    });

    // Ombor qoldig'ini yaratish / yangilash
    await prisma.inventory.upsert({
      where: {
        branchId_productId: {
          branchId: branch.id,
          productId: product.id,
        },
      },
      update: {
        quantity: item.stock,
      },
      create: {
        businessId: business.id,
        branchId: branch.id,
        productId: product.id,
        quantity: item.stock,
        reservedQty: 0,
      },
    });

    addedCount++;
    console.log(`✅ [${addedCount}/20] Qo'shildi: ${product.name} (${item.salePrice.toLocaleString()} so'm)`);
  }

  console.log(`\n🎉 Jami ${addedCount} ta demo mahsulot va barcha kategoriyalar muvaffaqiyatli saqlandi!`);
}

addDemoProducts()
  .catch((e) => {
    console.error('❌ Xatolik yuz berdi:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
