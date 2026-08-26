import { PrismaClient, ProductStatus, BusinessType } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🍔 --- 75BURGER MAHSULOTLAR VA KATEGORIYALARNI YARATISH BOSHLANDI --- 🍔');

  // 1. Find or create 75Burger business
  let business = await prisma.business.findFirst({
    where: {
      OR: [
        { name: { contains: '75Burger', mode: 'insensitive' } },
        { name: { contains: '75 Burger', mode: 'insensitive' } },
      ],
    },
    include: {
      branches: true,
      units: true,
    },
  });

  if (!business) {
    // Find any existing owner/user
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!user) {
      console.error('❌ Foydalanuvchi topilmadi! Avval asosiy seedni ishga tushiring.');
      return;
    }

    const freePlan = await prisma.plan.findFirst();
    if (!freePlan) {
      console.error('❌ Plan topilmadi!');
      return;
    }

    console.log(`📌 "75Burger Fast Food" yangi biznesi yaratilmoqda...`);
    const newBiz = await prisma.business.create({
      data: {
        name: '75Burger Fast Food',
        businessType: BusinessType.cafe,
        ownerId: user.id,
        currency: 'UZS',
        timezone: 'Asia/Tashkent',
        planId: freePlan.id,
        branches: {
          create: {
            name: '75Burger Asosiy Filial',
            isMain: true,
            address: 'Toshkent sh., Chilonzor tumani, 75-kvartal',
            phone: '+998901237575',
          },
        },
      },
      include: {
        branches: true,
        units: true,
      },
    });
    business = newBiz;
    console.log(`✅ 75Burger biznesi yaratildi (ID: ${business.id})`);
  } else {
    console.log(`✅ Mavjud 75Burger biznesi topildi: "${business.name}" (ID: ${business.id})`);
  }

  // Ensure branch exists
  let branch = business.branches[0];
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        businessId: business.id,
        name: '75Burger Markaziy Filial',
        isMain: true,
        address: 'Toshkent sh., Chilonzor tumani',
        phone: '+998901237575',
      },
    });
  }

  // Ensure user is linked to business as Owner
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'Owner' },
  });

  if (ownerRole) {
    await prisma.businessUser.upsert({
      where: {
        businessId_userId: {
          businessId: business.id,
          userId: business.ownerId,
        },
      },
      update: { status: 'active' },
      create: {
        businessId: business.id,
        userId: business.ownerId,
        roleId: ownerRole.id,
        branchId: branch.id,
        status: 'active',
      },
    });
  }

  // Ensure units exist
  let donaUnit = business.units.find((u) => u.shortName?.toLowerCase() === 'dona' || u.name.toLowerCase() === 'dona');
  if (!donaUnit) {
    donaUnit = await prisma.unit.create({
      data: {
        businessId: business.id,
        name: 'Dona',
        shortName: 'dona',
      },
    });
  }

  let porUnit = business.units.find((u) => u.shortName?.toLowerCase() === 'por' || u.name.toLowerCase() === 'porsiya');
  if (!porUnit) {
    porUnit = await prisma.unit.create({
      data: {
        businessId: business.id,
        name: 'Porsiya',
        shortName: 'por',
      },
    });
  }

  // 2. Categories
  const categoryDefs = [
    {
      name: 'Burgerlar',
      icon: 'Sandwich',
      color: '#F59E0B',
      defaultTrackInventory: false,
      sortOrder: 1,
    },
    {
      name: 'Lavash & Donar',
      icon: 'UtensilsCrossed',
      color: '#EF4444',
      defaultTrackInventory: false,
      sortOrder: 2,
    },
    {
      name: 'Sneklar & Fri',
      icon: 'Package',
      color: '#10B981',
      defaultTrackInventory: false,
      sortOrder: 3,
    },
    {
      name: 'Salqin Ichimliklar',
      icon: 'Coffee',
      color: '#3B82F6',
      defaultTrackInventory: true,
      sortOrder: 4,
    },
    {
      name: 'Maxsus Souslar',
      icon: 'Sparkles',
      color: '#8B5CF6',
      defaultTrackInventory: true,
      sortOrder: 5,
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoryDefs) {
    let existingCat = await prisma.category.findFirst({
      where: {
        businessId: business.id,
        name: cat.name,
      },
    });

    if (!existingCat) {
      existingCat = await prisma.category.create({
        data: {
          businessId: business.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          defaultTrackInventory: cat.defaultTrackInventory,
          sortOrder: cat.sortOrder,
        },
      });
      console.log(`📁 Kategoriya yaratildi: ${cat.name}`);
    } else {
      existingCat = await prisma.category.update({
        where: { id: existingCat.id },
        data: {
          icon: cat.icon,
          color: cat.color,
          defaultTrackInventory: cat.defaultTrackInventory,
          sortOrder: cat.sortOrder,
        },
      });
      console.log(`📁 Kategoriya yangilandi: ${cat.name}`);
    }
    categoryMap[cat.name] = existingCat.id;
  }

  // 3. 20 Realistic 75Burger Demo Products
  const productsList = [
    // --- 1. Burgerlar (7 dona) ---
    {
      name: '75 Special Double Cheese Burger',
      category: 'Burgerlar',
      sku: '75B-BUR-001',
      barcode: '750001',
      purchasePrice: 24000,
      salePrice: 45000,
      unitId: donaUnit.id,
      trackInventory: false, // Made-to-order taom
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      description: "Ikki qavatli suvli mol go'shti kotleti, ikki qavat eritilgan cheddar pishlog'i, maxsus 75 sous, aysberg salati va karamellangan piyoz.",
    },
    {
      name: 'Klassik Beef Burger',
      category: 'Burgerlar',
      sku: '75B-BUR-002',
      barcode: '750002',
      purchasePrice: 18000,
      salePrice: 32000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
      description: "Shirali mol go'shti kotleti, pomidor, yangi bodring, aysberg, tomat va mayin xantal sousi.",
    },
    {
      name: 'Chili Spicy Jalapeno Burger',
      category: 'Burgerlar',
      sku: '75B-BUR-003',
      barcode: '750003',
      purchasePrice: 20000,
      salePrice: 36000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      description: "Achchiq xalapeno qalampiri, olovda pishgan mol go'shti, sriracha achchiq sousi va qizil piyoz.",
    },
    {
      name: 'Crispy Chicken Burger',
      category: 'Burgerlar',
      sku: '75B-BUR-004',
      barcode: '750004',
      purchasePrice: 16000,
      salePrice: 28000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
      description: "Qarsildoq oltinrang panirlangan tovuq filesi, oq sarimsoqli sous, aysberg va yangi bodring.",
    },
    {
      name: 'BBQ Smokey Bacon Burger',
      category: 'Burgerlar',
      sku: '75B-BUR-005',
      barcode: '750005',
      purchasePrice: 23000,
      salePrice: 42000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
      description: "Dudlangan go'sht tasmachalari, xushbo'y dudli BBQ sousi, qovurilgan piyoz halqalari va cheddar pishlog'i.",
    },
    {
      name: 'Mushroom Swiss Burger',
      category: 'Burgerlar',
      sku: '75B-BUR-006',
      barcode: '750006',
      purchasePrice: 21000,
      salePrice: 39000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
      description: "Sariyog'da qovurilgan yangi shampinyon qo'ziqorinlari, shveysar pishlog'i va qaymoqli oq sous.",
    },
    {
      name: 'Mini Junior Kids Burger',
      category: 'Burgerlar',
      sku: '75B-BUR-007',
      barcode: '750007',
      purchasePrice: 12000,
      salePrice: 22000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80',
      description: "Bolalar uchun yumshoq bulkali, yengil ta'mli mol go'shti kotleti, tabiiy tomat sousi va cheddar pishloq.",
    },

    // --- 2. Lavash & Donar (4 dona) ---
    {
      name: '75 Grand Lavash (Mol go\'shti)',
      category: 'Lavash & Donar',
      sku: '75B-LAV-008',
      barcode: '750008',
      purchasePrice: 20000,
      salePrice: 38000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80',
      description: "Yupqa tandir lavash, shira to'la mol go'shti bo'laklari, qarsildoq chips, pomidor, bodring va maxsus 75 oq sous.",
    },
    {
      name: 'Sirli Tovuqli Lavash (Mozzarella)',
      category: 'Lavash & Donar',
      sku: '75B-LAV-009',
      barcode: '750009',
      purchasePrice: 18000,
      salePrice: 34000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
      description: "Marinadlangan tovuq go'shti, ko'p miqdorda cho'ziluvchan mozzarella pishlog'i, bodring, pomidor va maxsus sous.",
    },
    {
      name: 'Katta Donar Kebab Porsiya',
      category: 'Lavash & Donar',
      sku: '75B-LAV-010',
      barcode: '750010',
      purchasePrice: 24000,
      salePrice: 44000,
      unitId: porUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
      description: "Tarelkada go'sht donar bo'laklari, guruch, oltinrang kartoshka fri, yangi sabzavotli salat va issiq non.",
    },
    {
      name: 'Tandir Shaurma Klassik',
      category: 'Lavash & Donar',
      sku: '75B-LAV-011',
      barcode: '750011',
      purchasePrice: 15000,
      salePrice: 28000,
      unitId: donaUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
      description: "Tandir nonida tayyorlangan to'yimli shaurma, yangi bodring, pomidor va o'tli sarimsoq sousi.",
    },

    // --- 3. Sneklar & Fri (5 dona) ---
    {
      name: 'Kartoshka Fri (Katta porsiya)',
      category: 'Sneklar & Fri',
      sku: '75B-SNK-012',
      barcode: '750012',
      purchasePrice: 8000,
      salePrice: 18000,
      unitId: porUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
      description: "Qarsildoq, oltin rangda qovurilgan kartoshka fri, nozik dengiz tuzi sepilgan.",
    },
    {
      name: 'Qishloqcha Kartoshka (Po-derevenski)',
      category: 'Sneklar & Fri',
      sku: '75B-SNK-013',
      barcode: '750013',
      purchasePrice: 9000,
      salePrice: 20000,
      unitId: porUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
      description: "Pichoqda kesilgan, rozmarin va xushbo'y ziravorlar bilan qovurilgan mazali qishloqcha kartoshka.",
    },
    {
      name: 'Crispy Nuggets (8 dona)',
      category: 'Sneklar & Fri',
      sku: '75B-SNK-014',
      barcode: '750014',
      purchasePrice: 13000,
      salePrice: 24000,
      unitId: porUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
      description: "Yumshoq tovuq filesidan tayyorlangan 8 dona qarsildoq tilla rang naggetslar.",
    },
    {
      name: 'Mozzarella Pishloqli Tayoqchalar (5 dona)',
      category: 'Sneklar & Fri',
      sku: '75B-SNK-015',
      barcode: '750015',
      purchasePrice: 14000,
      salePrice: 26000,
      unitId: porUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1548340742-b8332c25c2d3?auto=format&fit=crop&w=600&q=80',
      description: "Issiq eritilgan mozzarella pishlog'i bilan to'ldirilgan qarsildoq panirlangan tayoqchalar.",
    },
    {
      name: 'Piyoz Halqalari (Onion Rings, 8 dona)',
      category: 'Sneklar & Fri',
      sku: '75B-SNK-016',
      barcode: '750016',
      purchasePrice: 7000,
      salePrice: 16000,
      unitId: porUnit.id,
      trackInventory: false,
      imageUrl: 'https://images.unsplash.com/photo-1639024471287-032f66e65454?auto=format&fit=crop&w=600&q=80',
      description: "Maxsus pivo xamirida qovurilgan qarsildoq va xushbo'y piyoz halqalari.",
    },

    // --- 4. Salqin Ichimliklar (3 dona - trackInventory: true) ---
    {
      name: 'Coca-Cola 0.5L (Butilka)',
      category: 'Salqin Ichimliklar',
      sku: '75B-DRK-017',
      barcode: '5449000000996',
      purchasePrice: 6500,
      salePrice: 9000,
      unitId: donaUnit.id,
      trackInventory: true, // Ombor qoldig'i hisoblanadi
      stockQuantity: 150,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      description: "Muzdek salqin gazlangan klassik Coca-Cola 0.5 litr.",
    },
    {
      name: 'Fanta Orange 0.5L (Butilka)',
      category: 'Salqin Ichimliklar',
      sku: '75B-DRK-018',
      barcode: '5449000011527',
      purchasePrice: 6500,
      salePrice: 9000,
      unitId: donaUnit.id,
      trackInventory: true,
      stockQuantity: 120,
      imageUrl: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80',
      description: "Yorqin apelsin ta'mli salqin gazlangan ichimlik 0.5 litr.",
    },
    {
      name: 'Sprite Lemon-Lime 0.5L',
      category: 'Salqin Ichimliklar',
      sku: '75B-DRK-019',
      barcode: '5449000027535',
      purchasePrice: 6500,
      salePrice: 9000,
      unitId: donaUnit.id,
      trackInventory: true,
      stockQuantity: 95,
      imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80',
      description: "Tetaklashtiruvchi limon va laym ta'mli salqin ichimlik 0.5 litr.",
    },

    // --- 5. Maxsus Souslar (1 dona - trackInventory: true) ---
    {
      name: '75 Maxsus Imzo Sousi (Portsiya 50g)',
      category: 'Maxsus Souslar',
      sku: '75B-SAU-020',
      barcode: '750020',
      purchasePrice: 2000,
      salePrice: 5000,
      unitId: donaUnit.id,
      trackInventory: true,
      stockQuantity: 200,
      imageUrl: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=600&q=80',
      description: "Faqat 75Burger uchun maxsus tayyorlangan sirli qaymoqli-achchiq imzo sous.",
    },
  ];

  console.log(`\n📦 Jami ${productsList.length} ta mahsulot bazaga kiritilmoqda...`);

  let count = 0;
  for (const item of productsList) {
    const categoryId = categoryMap[item.category];

    // Find or create product
    let product = await prisma.product.findFirst({
      where: {
        businessId: business.id,
        name: item.name,
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          businessId: business.id,
          branchId: branch.id,
          categoryId: categoryId,
          name: item.name,
          sku: item.sku,
          barcode: item.barcode,
          purchasePrice: item.purchasePrice,
          salePrice: item.salePrice,
          unitId: item.unitId,
          trackInventory: item.trackInventory,
          imageUrl: item.imageUrl,
          description: item.description,
          status: ProductStatus.active,
        },
      });
      console.log(`✅ [${++count}/${productsList.length}] Yangi mahsulot qo'shildi: ${item.name} (${item.salePrice.toLocaleString()} UZS)`);
    } else {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          categoryId: categoryId,
          sku: item.sku,
          barcode: item.barcode,
          purchasePrice: item.purchasePrice,
          salePrice: item.salePrice,
          unitId: item.unitId,
          trackInventory: item.trackInventory,
          imageUrl: item.imageUrl,
          description: item.description,
          status: ProductStatus.active,
        },
      });
      console.log(`🔄 [${++count}/${productsList.length}] Mahsulot yangilandi: ${item.name} (${item.salePrice.toLocaleString()} UZS)`);
    }

    // If trackInventory is true, ensure inventory row exists
    if (item.trackInventory && item.stockQuantity) {
      const existingInv = await prisma.inventory.findFirst({
        where: {
          businessId: business.id,
          branchId: branch.id,
          productId: product.id,
        },
      });

      if (!existingInv) {
        await prisma.inventory.create({
          data: {
            businessId: business.id,
            branchId: branch.id,
            productId: product.id,
            quantity: item.stockQuantity,
            reservedQty: 0,
          },
        });
        console.log(`   📦 Ombor qoldig'i: ${item.stockQuantity} dona kiritildi`);
      } else {
        await prisma.inventory.update({
          where: { id: existingInv.id },
          data: {
            quantity: item.stockQuantity,
          },
        });
        console.log(`   📦 Ombor qoldig'i: ${item.stockQuantity} dona yangilandi`);
      }
    }
  }

  console.log('\n🎉 --- 75BURGERGA BARCHA 20 TA DEMO MAHSULOT VA KATEGORIYALAR MUVAFFAQIYATLI QO\'SHILDI! --- 🎉');
}

main()
  .catch((e) => {
    console.error('❌ Xatolik yuz berdi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
