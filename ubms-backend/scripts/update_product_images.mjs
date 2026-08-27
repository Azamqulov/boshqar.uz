import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PRODUCT_IMAGES = {
  // 1. Ichimliklar
  'DRK-COCA-15L': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
  'DRK-FANT-15L': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=500&q=80',
  'DRK-SPRT-15L': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=500&q=80',
  'DRK-HYDR-15L': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=500&q=80',
  'DRK-DENA-APL': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80',

  // 2. Sut Mahsulotlari
  'DRY-NEST-1L': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
  'DRY-KAML-900': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
  'DRY-PRES-200': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80',

  // 3. Shirinliklar & Shokolad
  'SWT-ALPN-90': 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=500&q=80',
  'SWT-SNCK-80': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=500&q=80',
  'SWT-RAFF-150': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=500&q=80',
  'SWT-NUTL-350': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80',

  // 4. Snack & Non
  'SNK-LAYS-140': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80',
  'SNK-PRNG-165': 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=500&q=80',
  'BAK-NON-001': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',

  // 5. Oziq-ovqat & Don
  'FOD-MKFA-SPG': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80',
  'FOD-MKFA-500': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80',
  'FOD-SHED-1L': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
  'FOD-ALOK-100': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',

  // 6. Maishiy Kimyo
  'CHM-FAIR-450': 'https://images.unsplash.com/photo-1585670270608-b4b4f1da0d01?auto=format&fit=crop&w=500&q=80',
  'CHM-COLG-100': 'https://images.unsplash.com/photo-1559591937-e16e094775d7?auto=format&fit=crop&w=500&q=80',
};

async function main() {
  let updatedCount = 0;
  for (const [sku, url] of Object.entries(PRODUCT_IMAGES)) {
    const res = await prisma.product.updateMany({
      where: { sku: sku },
      data: { imageUrl: url }
    });
    updatedCount += res.count;
  }
  console.log(`Updated images for ${updatedCount} products across businesses!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
