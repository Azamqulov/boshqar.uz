/**
 * VISIBLE (HEADED) LIVE BROWSER AUDIT SCRIPT
 * Launches visible Chromium browser window on user's desktop screen,
 * steps through SuperAdmin and all core modules with visual delays.
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function launchVisibleAudit() {
  console.log('🖥️ Ekraningizda real Chromium brauzeri ochilmoqda...');

  const browser = await chromium.launch({
    headless: false, // Foydalanuvchi ko'rishi uchun EKRANDA OCHILADI
    slowMo: 600,     // Har bir harakatni ko'rish uchun sekinlashtirish
    args: ['--start-maximized', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: null, // To'liq ekran o'lchami
    locale: 'uz-UZ'
  });

  const page = await context.newPage();

  try {
    // 1. LOGIN SAHIFASI
    console.log('1. Login sahifasi ochilmoqda...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // SuperAdmin hisobi bilan kirish
    console.log('2. SuperAdmin hisob ma\'lumotlari kiritilmoqda (+998770404624)...');
    const phoneInput = await page.$('input[placeholder*="90 123" i], input[type="tel"], input[name="phone"], input[name="login"]');
    const passwordInput = await page.$('input[type="password"]');

    if (phoneInput && passwordInput) {
      await phoneInput.fill('770404624');
      await page.waitForTimeout(500);
      await passwordInput.fill('1111');
      await page.waitForTimeout(800);

      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(2500);
      }
    }

    // 2. SUPERADMIN NAZORAT MARKAZI
    console.log('3. SuperAdmin paneliga o\'tilmoqda...');
    await page.goto(`${BASE_URL}/superadmin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // Barcha tablarni birma-bir ochib ko'rsatish
    const superAdminTabs = [
      { id: 'leads', name: 'Demo & Leadlar (Lidlar bazasi)' },
      { id: 'owners', name: 'Biznes Egalari (Owners)' },
      { id: 'businesses', name: 'Korxonalar & Obunalar (Tariflar)' },
      { id: 'users', name: 'Xodimlar & Rollar (SuperAdmin huquqlari)' },
      { id: 'billing', name: 'To\'lovlar & Karta Rekvizitlari' },
      { id: 'audit', name: 'Audit Tarixi (Loglar)' },
      { id: 'business-types', name: 'Biznes Turlari (Sozlash)' },
      { id: 'backups', name: 'Zaxira Nusxalari (Backups)' },
      { id: 'maintenance', name: 'Tizim Xizmati (Maintenance)' },
    ];

    for (const tab of superAdminTabs) {
      console.log(`  👉 SuperAdmin Tab ko'rilmoqda: ${tab.name}...`);
      await page.goto(`${BASE_URL}/superadmin?tab=${tab.id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2200);
    }

    // Modalni ochib ko'rsatish
    console.log('4. Korxonalar bo\'limida "Tarif & Muddat" modali tekshirilmoqda...');
    await page.goto(`${BASE_URL}/superadmin?tab=businesses`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const tarifBtn = await page.$('button:has-text("Tarif & Muddat")');
    if (tarifBtn) {
      await tarifBtn.click({ force: true });
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // 3. ASOSIY TIZIM MODULLARINI KO'ZDATAN KECHIRISH
    console.log('5. Boshqaruv Paneli (Dashboard) ochilmoqda...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('6. Mahsulotlar katalogi ochilmoqda...');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('7. POS Kassa terminali ochilmoqda...');
    await page.goto(`${BASE_URL}/pos`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('8. Omborxona boshqaruvi ochilmoqda...');
    await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('9. Moliya va hisobotlar ochilmoqda...');
    await page.goto(`${BASE_URL}/finance`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('10. Tizim Sozlamalari ochilmoqda...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('✨ Barcha sahifalar ekranda muvaffaqiyatli tekshirildi!');
  } catch (err) {
    console.error('Xatolik:', err);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
    console.log('🏁 Brauzer auditi yakunlandi.');
  }
}

launchVisibleAudit();
