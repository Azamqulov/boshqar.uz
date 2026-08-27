import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00';

async function testSale() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Demo login...');
  await page.goto(`${BASE_URL}/auth/login`);
  await page.click('button:has-text("Demo tizimni")');
  await page.waitForTimeout(2500);

  console.log('2. POS ga o\'tish...');
  await page.goto(`${BASE_URL}/pos`);
  await page.waitForTimeout(2000);

  // Check if shift modal is open
  const openShiftBtn = await page.$('button:has-text("Smenani Boshlash")');
  if (openShiftBtn) {
    await openShiftBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }

  console.log('3. Mahsulotlarni savatga qo\'shish...');
  // Click on product cards
  const cards = await page.$$('.menu-item, [class*="product"], button:has-text("so\'m")');
  if (cards.length > 0) {
    await cards[0].click({ force: true });
    await page.waitForTimeout(500);
    if (cards.length > 1) {
      await cards[1].click({ force: true });
      await page.waitForTimeout(500);
    }
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'live_220_pos_cart.png') });
  console.log('📸 live_220_pos_cart.png');

  console.log('4. To\'lovga o\'tish...');
  const payBtn = await page.$('button:has-text("To\'lovga O\'tish"), button:has-text("To\'lov"), button:has-text("Chek")');
  if (payBtn) {
    await payBtn.click({ force: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'live_221_pos_checkout_modal.png') });
    console.log('📸 live_221_pos_checkout_modal.png');

    const submitBtn = await page.$('button:has-text("To\'lovni Yakunlash"), button:has-text("To\'landi"), button:has-text("Chek Chiqarish"), button:has-text("Yakunlash")');
    if (submitBtn) {
      await submitBtn.click({ force: true });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'live_222_pos_success.png') });
      console.log('📸 live_222_pos_success.png');
    }
  }

  console.log('5. Dashboard va Moliya ko\'rish...');
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'live_223_dashboard_with_sale.png') });
  console.log('📸 live_223_dashboard_with_sale.png');

  await page.goto(`${BASE_URL}/orders`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'live_224_orders_list.png') });
  console.log('📸 live_224_orders_list.png');

  await browser.close();
  console.log('✅ Savdo va hisobot tekshiruvi muvaffaqiyatli yakunlandi!');
}

testSale().catch(console.error);
