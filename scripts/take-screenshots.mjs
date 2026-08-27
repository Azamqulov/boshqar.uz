import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00';
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runVisualTour() {
  console.log('🚀 Starting Chrome Playwright visual inspection...');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      channel: 'chrome'
    });
  } catch (e) {
    browser = await chromium.launch({
      headless: true
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('📸 1. Capturing Landing Page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_landing_page.png'), fullPage: false });

  console.log('📸 2. Capturing Landing Page Features & Pricing...');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_landing_features.png'), fullPage: false });

  console.log('📸 3. Capturing Login Page...');
  await page.goto('http://localhost:5173/auth/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_login_page.png'), fullPage: false });

  console.log('🔑 4. Logging in with 1-click Demo button...');
  const demoBtn = page.locator('button:has-text("Demo tizimni sinab ko\'rish")').first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
  } else {
    await page.fill('input[placeholder*="90 123 45 67"]', '770404624');
    await page.fill('input[placeholder*="Parol"]', 'admin123');
    await page.click('button[type="submit"]');
  }

  // Wait for login redirection to dashboard/pos
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('📸 5. Capturing Dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_dashboard_view.png'), fullPage: false });

  console.log('📸 6. Capturing POS Terminal...');
  await page.goto('http://localhost:5173/pos', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_pos_terminal.png'), fullPage: false });

  console.log('🛒 7. Interacting with POS (selecting items and cart)...');
  const productButtons = page.locator('div[role="button"], button').filter({ hasText: "so'm" });
  if (await productButtons.count() > 0) {
    await productButtons.first().click().catch(() => {});
    await page.waitForTimeout(400);
    if (await productButtons.count() > 1) {
      await productButtons.nth(1).click().catch(() => {});
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_pos_cart_order.png'), fullPage: false });

  console.log('📸 8. Capturing Products Catalog...');
  await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_products_catalog.png'), fullPage: false });

  console.log('📸 9. Capturing Inventory Management...');
  await page.goto('http://localhost:5173/inventory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_inventory_view.png'), fullPage: false });

  console.log('📸 10. Capturing KDS Kitchen Display...');
  await page.goto('http://localhost:5173/restaurant/kds', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_kds_kitchen.png'), fullPage: false });

  console.log('📸 11. Capturing Finance & Shift Reports...');
  await page.goto('http://localhost:5173/finance', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_finance_view.png'), fullPage: false });

  console.log('✅ Visual inspection completed! All screenshots captured.');
  await browser.close();
}

runVisualTour().catch(err => {
  console.error('Visual inspection error:', err);
  process.exit(1);
});
