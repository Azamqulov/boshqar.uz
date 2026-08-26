import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

function generateTempPassword(): string {
  return randomBytes(4).toString('hex').toUpperCase() + '!A1';
}

const prisma = new PrismaClient();

async function main() {
  console.log('--- 🚀 Seeding Rich Demo Data for boshqar.uz ---');

  // 1. Seed Plans
  const freePlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Free',
      maxBranches: 1,
      maxUsers: 2,
      priceMonthly: 0,
      features: { reports: 'basic', pos: true, bot: false },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Pro',
      maxBranches: 3,
      maxUsers: 10,
      priceMonthly: 199000,
      features: { reports: 'full', pos: true, bot: true, inventory: true },
    },
  });

  const businessPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Business',
      maxBranches: null,
      maxUsers: null,
      priceMonthly: 499000,
      features: { reports: 'advanced', pos: true, bot: true, api: true, multi_branch: true },
    },
  });

  // 2. Seed Permissions
  const permissionsList = [
    { code: 'products.view', module: 'products', description: 'Mahsulotlarni ko\'rish' },
    { code: 'products.create', module: 'products', description: 'Yangi mahsulot yaratish' },
    { code: 'products.update', module: 'products', description: 'Mahsulotlarni tahrirlash' },
    { code: 'products.delete', module: 'products', description: 'Mahsulotlarni o\'chirish' },
    { code: 'orders.view', module: 'orders', description: 'Buyurtmalarni ko\'rish' },
    { code: 'orders.create', module: 'orders', description: 'Kassada savdo qilish' },
    { code: 'orders.cancel', module: 'orders', description: 'Buyurtmani bekor qilish' },
    { code: 'orders.manualPrice', module: 'orders', description: 'Qo\'lda narx belgilash' },
    { code: 'refunds.create', module: 'refunds', description: 'Mahsulot qaytarishni rasmiylashtirish' },
    { code: 'inventory.view', module: 'inventory', description: 'Ombor qoldiqlarini ko\'rish' },
    { code: 'inventory.create', module: 'inventory', description: 'Kirim/chiqim amallarini bajarish' },
    { code: 'inventory.transfer', module: 'inventory', description: 'Filiallararo transfer' },
    { code: 'customers.view', module: 'customers', description: 'Mijozlarni ko\'rish' },
    { code: 'customers.manage', module: 'customers', description: 'Mijozlarni boshqarish' },
    { code: 'suppliers.view', module: 'suppliers', description: 'Ta\'minotchilarni ko\'rish' },
    { code: 'suppliers.manage', module: 'suppliers', description: 'Ta\'minotchilarni boshqarish' },
    { code: 'finance.view', module: 'finance', description: 'Moliya va xarajatlarni ko\'rish' },
    { code: 'finance.create', module: 'finance', description: 'Xarajat kiritish' },
    { code: 'employees.view', module: 'employees', description: 'Xodimlarni ko\'rish' },
    { code: 'employees.manage', module: 'employees', description: 'Xodimlarni boshqarish' },
    { code: 'reports.view', module: 'reports', description: 'Hisobotlarni ko\'rish' },
    { code: 'restaurant.manage', module: 'restaurant', description: 'Stollar va oshxonani boshqarish' },
    { code: 'appointments.manage', module: 'appointments', description: 'Bandlovlarni boshqarish' },
    { code: 'settings.manage', module: 'settings', description: 'Tizim sozlamalarini o\'zgartirish' },
    { code: 'audit_logs.view', module: 'audit', description: 'Audit jurnallarini ko\'rish' },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  // 3. Seed System Roles
  const ownerRole = await prisma.role.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Owner',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Admin',
      isSystem: true,
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      name: 'Cashier',
      isSystem: true,
    },
  });

  const allPermissions = await prisma.permission.findMany();
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId: p.id,
      },
    });
  }

  // 4. Default Units
  const defaultUnits = [
    { id: '00000000-0000-0000-0000-000000000020', name: 'Dona', shortName: 'dona', allowDecimal: false },
    { id: '00000000-0000-0000-0000-000000000021', name: 'Kilogramm', shortName: 'kg', allowDecimal: true },
    { id: '00000000-0000-0000-0000-000000000022', name: 'Litr', shortName: 'l', allowDecimal: true },
    { id: '00000000-0000-0000-0000-000000000023', name: 'Metr', shortName: 'm', allowDecimal: true },
    { id: '00000000-0000-0000-0000-000000000024', name: 'Porsiya', shortName: 'por', allowDecimal: false },
  ];

  for (const u of defaultUnits) {
    await prisma.unit.upsert({
      where: { id: u.id },
      update: {},
      create: u,
    });
  }

  // 5. Default SuperAdmin Users (Credentials fully in PostgreSQL database)
  const defaultPasswordHash = await bcrypt.hash('1111', 10);
  const demoUser = await prisma.user.upsert({
    where: { phone: '+998770404624' },
    update: { isSuperAdmin: true, status: 'active' }, // Never overwrite user's password in DB!
    create: {
      fullName: 'Boshqaruvchi Admin',
      email: 'admin@boshqar.uz',
      phone: '+998770404624',
      passwordHash: defaultPasswordHash,
      status: 'active',
      isSuperAdmin: true,
    },
  });

  const demoUser2 = await prisma.user.upsert({
    where: { phone: '+998111111111' },
    update: { isSuperAdmin: true, status: 'active', passwordHash: defaultPasswordHash },
    create: {
      fullName: 'Boshqar Admin 11',
      email: 'admin11@boshqar.uz',
      phone: '+998111111111',
      passwordHash: defaultPasswordHash,
      status: 'active',
      isSuperAdmin: true,
    },
  });

  // 6. Demo Business (Universal Supermarket & Kafe)
  const business = await prisma.business.upsert({
    where: { id: '00000000-0000-0000-0000-000000000100' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000100',
      ownerId: demoUser.id,
      name: 'Universal Supermarket & Kafe (Demo)',
      businessType: 'shop',
      currency: 'UZS',
      timezone: 'Asia/Tashkent',
      planId: proPlan.id,
      status: 'active',
    },
  });

  // 7. Branches (Chilonzor & Yunusobod)
  const mainBranch = await prisma.branch.upsert({
    where: { id: '00000000-0000-0000-0000-000000000200' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000200',
      businessId: business.id,
      name: 'Bosh filial (Chilonzor)',
      address: 'Toshkent sh., Chilonzor 9-mavze, 12-uy',
      phone: '+998 71 200 11 22',
      isMain: true,
      status: 'active',
    },
  });

  const secondBranch = await prisma.branch.upsert({
    where: { id: '00000000-0000-0000-0000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000201',
      businessId: business.id,
      name: 'Yunusobod filiali',
      address: 'Toshkent sh., Yunusobod 4-mavze, Mega Planet ro\'parasi',
      phone: '+998 71 200 33 44',
      isMain: false,
      status: 'active',
    },
  });

  // 8. Link User to Business as Owner
  await prisma.businessUser.upsert({
    where: {
      businessId_userId: {
        businessId: business.id,
        userId: demoUser.id,
      },
    },
    update: { status: 'active' },
    create: {
      businessId: business.id,
      userId: demoUser.id,
      roleId: ownerRole.id,
      branchId: mainBranch.id,
      status: 'active',
    },
  });

  await prisma.businessUser.upsert({
    where: {
      businessId_userId: {
        businessId: business.id,
        userId: demoUser2.id,
      },
    },
    update: { status: 'active' },
    create: {
      businessId: business.id,
      userId: demoUser2.id,
      roleId: ownerRole.id,
      branchId: mainBranch.id,
      status: 'active',
    },
  });

  // 9. Payment Methods
  const cashPayment = await prisma.paymentMethod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000301' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000301',
      businessId: business.id,
      name: 'Naqd pul',
      type: 'cash',
      isActive: true,
    },
  });

  const cardPayment = await prisma.paymentMethod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000302' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000302',
      businessId: business.id,
      name: 'Plastik karta (Humo/Uzcard)',
      type: 'card',
      isActive: true,
    },
  });

  const clickPayment = await prisma.paymentMethod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000303' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000303',
      businessId: business.id,
      name: 'Click / Payme (QR to\'lov)',
      type: 'click',
      isActive: true,
    },
  });

  // 10. Categories
  const catDrinks = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000401' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000401', businessId: business.id, name: 'Ichimliklar va Sharbatlar', sortOrder: 1 },
  });

  const catDairy = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000402' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000402', businessId: business.id, name: 'Sut va Qatiq Mahsulotlari', sortOrder: 2 },
  });

  const catBakery = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000403' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000403', businessId: business.id, name: 'Non va Shirinliklar', sortOrder: 3 },
  });

  const catMeat = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000404' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000404', businessId: business.id, name: 'Go\'sht va Kolbasa', sortOrder: 4 },
  });

  const catFruits = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000405' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000405', businessId: business.id, name: 'Meva va Sabzavotlar', sortOrder: 5 },
  });

  const catHousehold = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000406' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000406', businessId: business.id, name: 'Xo\'jalik Mollari', sortOrder: 6 },
  });

  // 11. Suppliers
  const supCocaCola = await prisma.supplier.upsert({
    where: { id: '00000000-0000-0000-0000-000000000501' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000501',
      businessId: business.id,
      name: 'Coca-Cola Ichimligi Uzbekiston',
      companyName: 'CCI Uzbekistan MCHJ',
      phone: '+998 71 140 10 10',
      address: 'Toshkent sh., Bektemir tumani',
      balance: 2400000,
    },
  });

  const supRozmetov = await prisma.supplier.upsert({
    where: { id: '00000000-0000-0000-0000-000000000502' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000502',
      businessId: business.id,
      name: 'Rozmetov Go\'sht Kombinati',
      companyName: 'Rozmetov Gold MCHJ',
      phone: '+998 71 200 88 99',
      address: 'Toshkent viloyati, Zangiota',
      balance: 1800000,
    },
  });

  const supMusaffo = await prisma.supplier.upsert({
    where: { id: '00000000-0000-0000-0000-000000000503' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000503',
      businessId: business.id,
      name: 'Musaffo Sut Zavodi',
      companyName: 'Lactalis Central Asia',
      phone: '+998 71 230 45 67',
      address: 'Samarqand shahri',
      balance: 0,
    },
  });

  // 12. Products and Inventory
  const unitPiece = defaultUnits[0].id;
  const unitKg = defaultUnits[1].id;
  const unitLiter = defaultUnits[2].id;

  const demoProducts = [
    { id: '00000000-0000-0000-0000-000000000601', name: 'Coca-Cola 1.5L', sku: 'PRD-000001', barcode: '4780000010011', catId: catDrinks.id, unitId: unitPiece, purchasePrice: 10000, salePrice: 14000, stock: 150, minStock: 20 },
    { id: '00000000-0000-0000-0000-000000000602', name: 'Fanta 1.5L', sku: 'PRD-000002', barcode: '4780000010028', catId: catDrinks.id, unitId: unitPiece, purchasePrice: 10000, salePrice: 14000, stock: 90, minStock: 15 },
    { id: '00000000-0000-0000-0000-000000000603', name: 'Nestle Toza Suv 5L', sku: 'PRD-000003', barcode: '4780000010035', catId: catDrinks.id, unitId: unitPiece, purchasePrice: 7500, salePrice: 11000, stock: 45, minStock: 10 },
    { id: '00000000-0000-0000-0000-000000000604', name: 'Dinay Olma Sharbat 1L', sku: 'PRD-000004', barcode: '4780000010042', catId: catDrinks.id, unitId: unitPiece, purchasePrice: 11500, salePrice: 16000, stock: 60, minStock: 10 },
    { id: '00000000-0000-0000-0000-000000000605', name: 'Musaffo Sut 3.2% 1L', sku: 'PRD-000005', barcode: '4780000020010', catId: catDairy.id, unitId: unitPiece, purchasePrice: 9500, salePrice: 13500, stock: 35, minStock: 10 },
    { id: '00000000-0000-0000-0000-000000000606', name: 'Bio Smetana 20% 400g', sku: 'PRD-000006', barcode: '4780000020027', catId: catDairy.id, unitId: unitPiece, purchasePrice: 12000, salePrice: 17000, stock: 25, minStock: 5 },
    { id: '00000000-0000-0000-0000-000000000607', name: 'Tvorog Kamilka 9% 250g', sku: 'PRD-000007', barcode: '4780000020034', catId: catDairy.id, unitId: unitPiece, purchasePrice: 14000, salePrice: 19000, stock: 15, minStock: 5 },
    { id: '00000000-0000-0000-0000-000000000608', name: 'Samarqand Tandir Noni', sku: 'PRD-000008', barcode: '4780000030019', catId: catBakery.id, unitId: unitPiece, purchasePrice: 4000, salePrice: 6500, stock: 80, minStock: 15 },
    { id: '00000000-0000-0000-0000-000000000609', name: 'Toast Noni Oq 450g', sku: 'PRD-000009', barcode: '4780000030026', catId: catBakery.id, unitId: unitPiece, purchasePrice: 5000, salePrice: 7500, stock: 50, minStock: 10 },
    { id: '00000000-0000-0000-0000-000000000610', name: 'Snickers Super 80g', sku: 'PRD-000010', barcode: '4780000030033', catId: catBakery.id, unitId: unitPiece, purchasePrice: 8500, salePrice: 12500, stock: 120, minStock: 20 },
    { id: '00000000-0000-0000-0000-000000000611', name: 'Roshen Assorti Konfet 1kg', sku: 'PRD-000011', barcode: '4780000030040', catId: catBakery.id, unitId: unitKg, purchasePrice: 55000, salePrice: 75000, stock: 30, minStock: 5 },
    { id: '00000000-0000-0000-0000-000000000612', name: 'Doktorskaya Kolbasa Rozmetov', sku: 'PRD-000012', barcode: '4780000040018', catId: catMeat.id, unitId: unitPiece, purchasePrice: 42000, salePrice: 59000, stock: 28, minStock: 5 },
    { id: '00000000-0000-0000-0000-000000000613', name: 'Sosiska Halol Rozmetov 500g', sku: 'PRD-000013', barcode: '4780000040025', catId: catMeat.id, unitId: unitPiece, purchasePrice: 38000, salePrice: 52000, stock: 40, minStock: 8 },
    { id: '00000000-0000-0000-0000-000000000614', name: 'Banan Ekvador (Shirin)', sku: 'PRD-000014', barcode: '4780000050017', catId: catFruits.id, unitId: unitKg, purchasePrice: 18000, salePrice: 25000, stock: 75, minStock: 15 },
    { id: '00000000-0000-0000-0000-000000000615', name: 'Olma Besh-Yulduz Qizil', sku: 'PRD-000015', barcode: '4780000050024', catId: catFruits.id, unitId: unitKg, purchasePrice: 12000, salePrice: 18000, stock: 90, minStock: 20 },
    { id: '00000000-0000-0000-0000-000000000616', name: 'Fairy Idish Yuvish Gel 900ml', sku: 'PRD-000016', barcode: '4780000060016', catId: catHousehold.id, unitId: unitPiece, purchasePrice: 22000, salePrice: 29500, stock: 40, minStock: 8 },
    { id: '00000000-0000-0000-0000-000000000617', name: 'Ariel Avtomat Kir Kukuni 3kg', sku: 'PRD-000017', barcode: '4780000060023', catId: catHousehold.id, unitId: unitPiece, purchasePrice: 65000, salePrice: 89000, stock: 18, minStock: 5 },
    { id: '00000000-0000-0000-0000-000000000618', name: 'Papia 3 Qavatli Salfetka (8 dona)', sku: 'PRD-000018', barcode: '4780000060030', catId: catHousehold.id, unitId: unitPiece, purchasePrice: 28000, salePrice: 38000, stock: 50, minStock: 10 },
    { id: '00000000-0000-0000-0000-000000000619', name: 'Colgate Triple Action Tish Pastasi', sku: 'PRD-000019', barcode: '4780000060047', catId: catHousehold.id, unitId: unitPiece, purchasePrice: 15000, salePrice: 22000, stock: 3, minStock: 10 }, // Low Stock!
  ];

  for (const p of demoProducts) {
    const prod = await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        businessId: business.id,
        branchId: mainBranch.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        categoryId: p.catId,
        unitId: p.unitId,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice,
        minStock: p.minStock,
        status: 'active',
      },
    });

    await prisma.inventory.upsert({
      where: {
        branchId_productId: {
          branchId: mainBranch.id,
          productId: prod.id,
        },
      },
      update: { quantity: p.stock },
      create: {
        businessId: business.id,
        branchId: mainBranch.id,
        productId: prod.id,
        quantity: p.stock,
        reservedQty: 0,
      },
    });
  }

  // 13. Customers
  const customerList = [
    { id: '00000000-0000-0000-0000-000000000701', name: 'Alisher Qodirov', phone: '+998911112233', totalSpent: 1450000, purchases: 12, debt: 0 },
    { id: '00000000-0000-0000-0000-000000000702', name: 'Jamshid Abdullayev', phone: '+998934445566', totalSpent: 2800000, purchases: 24, debt: 150000 },
    { id: '00000000-0000-0000-0000-000000000703', name: 'Sardor Rahimov', phone: '+998977778899', totalSpent: 920000, purchases: 8, debt: 45000 },
    { id: '00000000-0000-0000-0000-000000000704', name: 'Malika Karimova', phone: '+998905556677', totalSpent: 3600000, purchases: 31, debt: 0 },
    { id: '00000000-0000-0000-0000-000000000705', name: 'Dilshod Ergashev', phone: '+998941234567', totalSpent: 750000, purchases: 6, debt: 80000 },
  ];

  for (const c of customerList) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        businessId: business.id,
        fullName: c.name,
        phone: c.phone,
        totalPurchases: c.purchases,
        totalSpent: c.totalSpent,
        debt: c.debt,
        lastPurchaseAt: new Date(),
      },
    });
  }

  // 14. Employees
  const employee1 = await prisma.employee.upsert({
    where: { id: '00000000-0000-0000-0000-000000000801' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000801',
      businessId: business.id,
      branchId: mainBranch.id,
      fullName: 'Otabek Yuldashev',
      phone: '+998909876543',
      position: 'Katta Kassir',
      salary: 4500000,
      status: 'active',
    },
  });

  const employee2 = await prisma.employee.upsert({
    where: { id: '00000000-0000-0000-0000-000000000802' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000802',
      businessId: business.id,
      branchId: mainBranch.id,
      fullName: 'Zuhra Rahimova',
      phone: '+998933214567',
      position: 'Sotuvchi-maslahatchi',
      salary: 3500000,
      status: 'active',
    },
  });

  // 15. Tables
  const table1 = await prisma.table.upsert({
    where: { id: '00000000-0000-0000-0000-000000000901' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000901', branchId: mainBranch.id, name: 'Stol #1 (Deraza oldi)', capacity: 4, status: 'available' },
  });
  const table2 = await prisma.table.upsert({
    where: { id: '00000000-0000-0000-0000-000000000902' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000902', branchId: mainBranch.id, name: 'Stol #2', capacity: 4, status: 'available' },
  });
  const table3 = await prisma.table.upsert({
    where: { id: '00000000-0000-0000-0000-000000000903' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000903', branchId: mainBranch.id, name: 'VIP Stol (8 kishilik)', capacity: 8, status: 'occupied' },
  });

  // 16. Services & Appointments
  const srvHair = await prisma.service.upsert({
    where: { id: '00000000-0000-0000-0000-000000001001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000001001', businessId: business.id, name: 'Soch turmaklash', price: 60000, durationMinutes: 30, status: 'active' },
  });
  const srvBeard = await prisma.service.upsert({
    where: { id: '00000000-0000-0000-0000-000000001002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000001002', businessId: business.id, name: 'Soqol olish va shakl berish', price: 40000, durationMinutes: 20, status: 'active' },
  });

  // Sample Appointment
  await prisma.appointment.upsert({
    where: { id: '00000000-0000-0000-0000-000000001101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000001101',
      businessId: business.id,
      branchId: mainBranch.id,
      customerId: customerList[0].id,
      serviceId: srvHair.id,
      employeeId: employee1.id,
      scheduledAt: new Date(Date.now() + 3600000), // 1 soatdan keyin
      status: 'confirmed',
    },
  });

  // 17. Sample Completed Sales Orders & Revenue
  const sampleOrder1 = await prisma.order.upsert({
    where: { id: '00000000-0000-0000-0000-000000001201' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000001201',
      businessId: business.id,
      branchId: mainBranch.id,
      orderNumber: '#00101',
      orderType: 'pos',
      customerId: customerList[0].id,
      cashierId: employee1.id,
      subtotal: 104500,
      discountAmount: 4500,
      taxAmount: 0,
      total: 100000,
      status: 'completed',
      completedAt: new Date(),
      items: {
        create: [
          { productId: demoProducts[0].id, quantity: 2, unitPrice: 14000, discountAmount: 0, total: 28000, status: 'served' },
          { productId: demoProducts[11].id, quantity: 1, unitPrice: 59000, discountAmount: 4500, total: 54500, status: 'served' },
          { productId: demoProducts[7].id, quantity: 3, unitPrice: 6500, discountAmount: 0, total: 19500, status: 'served' },
        ],
      },
      payments: {
        create: [
          { paymentMethodId: cardPayment.id, amount: 100000, status: 'success' },
        ],
      },
    },
  });

  await prisma.revenue.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      source: 'sales',
      referenceId: sampleOrder1.id,
      amount: 100000,
      recordedAt: new Date(),
    },
  });

  // 18. Sample Expenses
  await prisma.expense.createMany({
    data: [
      {
        businessId: business.id,
        branchId: mainBranch.id,
        category: 'rent',
        amount: 8000000,
        description: 'Chilonzor filiali oylik ijara to\'lovi',
        recordedAt: new Date(),
      },
      {
        businessId: business.id,
        branchId: mainBranch.id,
        category: 'utilities',
        amount: 1200000,
        description: 'Elektr energiyasi va suv to\'lovlari',
        recordedAt: new Date(),
      },
      {
        businessId: business.id,
        branchId: mainBranch.id,
        category: 'advertising',
        amount: 1500000,
        description: 'Instagram va Telegram kanallarida reklama',
        recordedAt: new Date(),
      },
    ],
  });

  // 19. Sample Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        businessId: business.id,
        userId: demoUser.id,
        action: 'login',
        entity: 'auth',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        businessId: business.id,
        userId: demoUser.id,
        action: 'create',
        entity: 'product',
        ipAddress: '127.0.0.1',
        newValue: { name: 'Americano Coffee', price: 18000 },
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
      {
        businessId: business.id,
        userId: demoUser.id,
        action: 'update',
        entity: 'settings',
        ipAddress: '127.0.0.1',
        oldValue: { currency: 'USD' },
        newValue: { currency: 'UZS' },
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
  });

  console.log('✅ Demo Business, Branches, Categories, Products, Customers, Suppliers, Orders, Expenses, and Audit Logs created!');
  console.log(`🔑 SuperAdmin User: ${demoUser.phone} (Hisob to'liq DB da saqlanadi)`);
  console.log('--- 🚀 Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
