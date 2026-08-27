import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:80/auth/login');
  await page.waitForSelector('button:has-text("Demo tizimni")', { timeout: 5000 });
  await page.click('button:has-text("Demo tizimni")');
  
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.goto('http://localhost:80/superadmin');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'superadmin_tabs_fixed.png' });
  console.log('SCREENSHOT_SAVED_SUCCESSFULLY');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
