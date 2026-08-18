import { PrismaClient, AppointmentStatus, ServiceStatus, ProductStatus } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('--- STARTING LIGHTNING SEED FOR SERVICE BUSINESS ---');

  const user = await prisma.user.findFirst({
    where: {
      phone: { contains: '22222222' },
    },
    include: {
      ownedBusinesses: {
        include: {
          branches: true,
          units: true,
        },
      },
    },
  });

  if (!user || !user.ownedBusinesses[0]) {
    console.error('User or business not found!');
    return;
  }

  const business = user.ownedBusinesses[0];
  console.log(`Target Business: ${business.name} (${business.id})`);

  let branch = business.branches[0];
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        businessId: business.id,
        name: 'Asosiy Salon Filiali',
        isMain: true,
        address: 'Toshkent sh., Yunusobod tumani',
        phone: user.phone,
      },
    });
  }

  let unit = business.units[0];
  if (!unit) {
    unit = await prisma.unit.create({
      data: {
        businessId: business.id,
        name: 'Dona',
        shortName: 'dona',
      },
    });
  }

  // 1. SERVICES
  console.log('1. Seeding Services...');
  await prisma.service.createMany({
    data: [
      { businessId: business.id, name: 'Klassik Soch Turmaklash & Kesish', price: 60000, durationMinutes: 40, status: ServiceStatus.active },
      { businessId: business.id, name: 'Soqol Tekislash & Parvarish', price: 35000, durationMinutes: 25, status: ServiceStatus.active },
      { businessId: business.id, name: 'Premium Kompleks (Soch + Soqol)', price: 90000, durationMinutes: 60, status: ServiceStatus.active },
      { businessId: business.id, name: 'Bolalar Soch Turmagi (12 yoshgacha)', price: 40000, durationMinutes: 30, status: ServiceStatus.active },
      { businessId: business.id, name: 'Yuzni Bug\'da Tozalash (Black Mask)', price: 50000, durationMinutes: 30, status: ServiceStatus.active },
      { businessId: business.id, name: 'Soch Yuvish & Bosh Massaji', price: 25000, durationMinutes: 15, status: ServiceStatus.active },
      { businessId: business.id, name: 'Soch Bo\'yash & Tonirovka', price: 120000, durationMinutes: 50, status: ServiceStatus.active },
      { businessId: business.id, name: 'Yuz va Quloq Mumli Tozalash (Wax)', price: 20000, durationMinutes: 15, status: ServiceStatus.active },
    ],
    skipDuplicates: true,
  });

  // 2. CATEGORIES
  console.log('2. Seeding Categories...');
  await prisma.category.createMany({
    data: [
      { businessId: business.id, name: 'Erkaklar Sartaroshligi', icon: 'Scissors', color: '#10b981' },
      { businessId: business.id, name: 'Soch va Soqol Parvarishi', icon: 'Sparkles', color: '#3b82f6' },
      { businessId: business.id, name: 'Yuz va Teri Kosmetikasi', icon: 'Heart', color: '#f59e0b' },
    ],
    skipDuplicates: true,
  });

  // 3. PRODUCTS (createMany)
  console.log('3. Seeding Products...');
  await prisma.product.createMany({
    data: [
      { businessId: business.id, branchId: branch.id, name: 'Nishman Matte Wax Soch Mumi (100ml)', sku: 'WAX-NISH-01', barcode: '868000100101', unitId: unit.id, purchasePrice: 35000, salePrice: 55000, minStock: 5, status: ProductStatus.active },
      { businessId: business.id, branchId: branch.id, name: 'Proraso Soqol Parvarish Moyi (30ml)', sku: 'OIL-PRO-02', barcode: '800439500202', unitId: unit.id, purchasePrice: 55000, salePrice: 85000, minStock: 4, status: ProductStatus.active },
      { businessId: business.id, branchId: branch.id, name: 'Bandido Soch Lak / Sprey (400ml)', sku: 'SPRY-BAN-03', barcode: '868123450303', unitId: unit.id, purchasePrice: 28000, salePrice: 45000, minStock: 6, status: ProductStatus.active },
      { businessId: business.id, branchId: branch.id, name: 'Head & Shoulders Professional Shampun', sku: 'SHMP-HS-04', barcode: '401560000404', unitId: unit.id, purchasePrice: 42000, salePrice: 65000, minStock: 5, status: ProductStatus.active },
      { businessId: business.id, branchId: branch.id, name: 'Morfose Qora Niqob (Black Mask Peel-off)', sku: 'MASK-MOR-05', barcode: '869700000505', unitId: unit.id, purchasePrice: 30000, salePrice: 48000, minStock: 3, status: ProductStatus.active },
      { businessId: business.id, branchId: branch.id, name: 'Elegance Soqol Balzami (Aftershave)', sku: 'BALM-ELE-06', barcode: '869800000606', unitId: unit.id, purchasePrice: 38000, salePrice: 60000, minStock: 4, status: ProductStatus.active },
    ],
    skipDuplicates: true,
  });

  // 4. EMPLOYEES
  console.log('4. Seeding Employees...');
  await prisma.employee.createMany({
    data: [
      { businessId: business.id, branchId: branch.id, fullName: 'Jamshid Barber', phone: '+998901112233', position: 'Katta Master Usta', salary: 6000000 },
      { businessId: business.id, branchId: branch.id, fullName: 'Sardor Qodirov', phone: '+998934445566', position: 'Top Stilist', salary: 5000000 },
      { businessId: business.id, branchId: branch.id, fullName: 'Dilshod Aliyev', phone: '+998977778899', position: 'Master Barber', salary: 4500000 },
      { businessId: business.id, branchId: branch.id, fullName: 'Farxod Xolov', phone: '+998990001122', position: 'Kassir / Administrator', salary: 3500000 },
    ],
    skipDuplicates: true,
  });

  // 5. CUSTOMERS
  console.log('5. Seeding Customers...');
  await prisma.customer.createMany({
    data: [
      { businessId: business.id, fullName: 'Bobur Rahimov', phone: '+998901234567', totalSpent: 450000, totalPurchases: 6, notes: 'Doimiy VIP mijoz, har 2 haftada keladi' },
      { businessId: business.id, fullName: 'Sanjar Karimov', phone: '+998935554433', totalSpent: 280000, totalPurchases: 3, notes: 'Sardor ustaga yoziladi' },
      { businessId: business.id, fullName: 'Jasur Aliyev', phone: '+998977778899', totalSpent: 120000, totalPurchases: 2, debt: 30000, notes: '30,000 UZS nasiyasi bor' },
      { businessId: business.id, fullName: 'Ulug\'bek Qodirov', phone: '+998913332211', totalSpent: 90000, totalPurchases: 1, notes: 'Klassik turmaklash yoqadi' },
      { businessId: business.id, fullName: 'Davron Mirzayev', phone: '+998998881122', totalSpent: 360000, totalPurchases: 4, notes: 'Doimiy soqol parvarish' },
    ],
    skipDuplicates: true,
  });

  // 6. APPOINTMENTS
  console.log('6. Seeding Appointments...');
  const allEmployees = await prisma.employee.findMany({ where: { businessId: business.id } });
  const allServices = await prisma.service.findMany({ where: { businessId: business.id } });
  const allCustomers = await prisma.customer.findMany({ where: { businessId: business.id } });

  if (allEmployees.length >= 3 && allServices.length >= 3 && allCustomers.length >= 3) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);

    await prisma.appointment.createMany({
      data: [
        { businessId: business.id, branchId: branch.id, customerId: allCustomers[0].id, serviceId: allServices[0].id, employeeId: allEmployees[0].id, scheduledAt: new Date(today.getTime() + 1 * 3600000), status: AppointmentStatus.confirmed },
        { businessId: business.id, branchId: branch.id, customerId: allCustomers[1].id, serviceId: allServices[2].id, employeeId: allEmployees[1].id, scheduledAt: new Date(today.getTime() + 3 * 3600000), status: AppointmentStatus.confirmed },
        { businessId: business.id, branchId: branch.id, customerId: allCustomers[2].id, serviceId: allServices[1].id, employeeId: allEmployees[2].id, scheduledAt: new Date(today.getTime() + 5 * 3600000), status: AppointmentStatus.booked },
        { businessId: business.id, branchId: branch.id, customerId: allCustomers[3].id, serviceId: allServices[4].id, employeeId: allEmployees[0].id, scheduledAt: new Date(today.getTime() + 7 * 3600000), status: AppointmentStatus.booked },
      ],
      skipDuplicates: true,
    });
  }

  console.log('🎉 100% SERVICE DATA SEED COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('Execution error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
