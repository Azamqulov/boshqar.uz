import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting Inventory businessId backfill...');

  // 1. Raw SQL to update business_id from products table
  try {
    const updatedCount = await prisma.$executeRawUnsafe(`
      UPDATE inventory 
      SET business_id = products.business_id 
      FROM products 
      WHERE inventory.product_id = products.id 
      AND (inventory.business_id IS NULL OR inventory.business_id != products.business_id);
    `);
    console.log(`✅ Backfilled ${updatedCount} inventory rows with correct business_id.`);
  } catch (err: any) {
    console.log('⚠️ Note on raw SQL update:', err.message);
  }

  // 2. Fallback in case raw SQL is blocked or differs
  const inventoryRows = await prisma.inventory.findMany({
    include: { product: { select: { businessId: true } } },
  });

  let count = 0;
  for (const row of inventoryRows) {
    if (row.product && (!row.businessId || row.businessId !== row.product.businessId)) {
      await prisma.inventory.update({
        where: { id: row.id },
        data: { businessId: row.product.businessId },
      });
      count++;
    }
  }

  console.log(`✅ Verified/Updated ${count} inventory rows.`);
}

main()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
