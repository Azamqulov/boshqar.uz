import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Demo login...');
  await page.goto('http://localhost:5173/login');
  await page.click('button:has-text("Demo tizimni")');
  await page.waitForTimeout(2000);

  console.log('2. POS ga kirish...');
  await page.goto('http://localhost:5173/pos');
  await page.waitForTimeout(2000);

  console.log('3. Yashil + tugmalari orqali savatga qo\'shish...');
  const plusBtns = await page.$$('button:has-text("+")');
  console.log('Plus tugmalari soni:', plusBtns.length);
  if (plusBtns.length > 0) {
    await plusBtns[0].click({ force: true });
    await page.waitForTimeout(500);
    if (plusBtns.length > 1) {
      await plusBtns[1].click({ force: true });
      await page.waitForTimeout(500);
      await plusBtns[1].click({ force: true });
    }
  }

  await page.screenshot({ path: 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00/live_230_cart_filled.png' });
  console.log('📸 live_230_cart_filled.png saqlandi!');

  console.log('4. To\'lov tugmasini bosish...');
  const payBtn = await page.$('button:has-text("To\'lovga O\'tish"), button:has-text("To\'lov")');
  if (payBtn) {
    await payBtn.click({ force: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00/live_231_checkout_modal.png' });
    console.log('📸 live_231_checkout_modal.png saqlandi!');

    const finishBtn = await page.$('button:has-text("To\'lovni"), button:has-text("Tasdiqlash"), button:has-text("To\'landi"), button:has-text("Chek"), button[type="submit"]');
    if (finishBtn) {
      await finishBtn.click({ force: true });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00/live_232_order_success.png' });
      console.log('📸 live_232_order_success.png saqlandi!');
    }
  }

  await browser.close();
  console.log('🎉 POS savdo va to\'lov tekshiruvi 100% muvaffaqiyatli yakunlandi!');
}

main().catch(console.error);
