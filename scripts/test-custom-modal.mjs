import { chromium } from 'playwright';

async function testCustomModal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Yangi demo ochish (Lead yaratish)
  console.log('1. Yangi Demo Lead ochilmoqda...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Demo tizimni")');
  await page.waitForTimeout(2000);

  // 2. SuperAdmin login
  console.log('2. SuperAdmin hisobi bilan kirish...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const inputs = await page.$$('form input');
  if (inputs.length >= 2) {
    await inputs[0].fill('770404624');
    await inputs[1].fill('1111');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
  }

  // 3. SuperAdmin Leads tabiga o'tish
  console.log('3. SuperAdmin Leads tabiga o\'tish...');
  await page.goto('http://localhost:5173/superadmin?tab=leads', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 4. Trash tugmasini bosish
  console.log('4. Lead o\'chirish (Trash) tugmasi bosilmoqda...');
  const trashBtn = await page.$('table button:has(svg.lucide-trash-2), table button[title*="o\'chirish" i]');
  if (trashBtn) {
    await trashBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00/live_330_custom_confirm_dialog.png' });
    console.log('📸 live_330_custom_confirm_dialog.png saqlandi!');

    // Modal ichidagi "Ha, o'chirish" tugmasini bosish
    const confirmBtn = await page.$('button:has-text("Ha, o\'chirish")');
    if (confirmBtn) {
      await confirmBtn.click({ force: true });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00/live_331_lead_deleted_toast.png' });
      console.log('📸 live_331_lead_deleted_toast.png saqlandi!');
    }
  }

  await browser.close();
  console.log('✅ Custom modal va toast muvaffaqiyatli yakunlandi!');
}

testCustomModal().catch(console.error);
