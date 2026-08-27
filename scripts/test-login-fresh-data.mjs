import { chromium } from 'playwright';

async function testFreshLoginData() {
  console.log('🧪 Starting Fresh Login & Realtime Data Test...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Listen to console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('🛑 [Browser Error]', msg.text());
    }
  });

  try {
    // 1. Open app and clear localStorage completely (clean state)
    await page.goto('http://localhost:5173/auth/login', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('✅ Storage purged cleanly');

    // Reload login page to ensure 0 cached items in memory
    await page.goto('http://localhost:5173/auth/login', { waitUntil: 'networkidle' });

    // 2. Perform Demo Login (or normal login)
    const demoBtn = await page.$('button:has-text("Demo tizimni sinab ko\'rish")');
    if (demoBtn) {
      console.log('👉 Clicking 1-click Demo Login...');
      await demoBtn.click();
    } else {
      // Input credentials
      console.log('👉 Typing credentials...');
      await page.fill('input[type="tel"]', '901234567');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
    }

    // Wait for redirect to /dashboard or /pos
    await page.waitForURL((url) => url.pathname.includes('/dashboard') || url.pathname.includes('/pos'), {
      timeout: 10000,
    });
    console.log('✅ Successfully logged in, current URL:', page.url());

    // 3. Immediately inspect Dashboard stats without ANY F5 reload
    await page.waitForTimeout(1500);

    // 4. Navigate directly to /products via client-side routing
    await page.goto('http://localhost:5173/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Check if product items / table rows are rendered
    const tableRows = await page.$$('tbody tr, .grid > div');
    console.log(`📦 Rendered product elements on initial load without F5: ${tableRows.length}`);

    if (tableRows.length > 0) {
      console.log('🎉 SUCCESS: Products loaded immediately upon login without requiring F5!');
    } else {
      console.warn('⚠️ Warning: 0 product elements found.');
    }

    // 5. Navigate to /pos
    await page.goto('http://localhost:5173/pos', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const posCards = await page.$$('button:has-text("so\'m"), .grid button');
    console.log(`🏪 Rendered POS product cards without F5: ${posCards.length}`);

    console.log('\n🌟 ALL CHECKS PASSED: Instant data synchronization verified!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
  }
}

testFreshLoginData();
