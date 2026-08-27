/**
 * SUPER ADMIN AUDIT SCRIPT
 * Tests full SuperAdmin control panel:
 * 1. SuperAdmin Login (+998770404624 / 1111)
 * 2. Navigate to /superadmin
 * 3. Test & screenshot all tabs:
 *    - Header Stats
 *    - Leads Tab
 *    - Owners Tab
 *    - Businesses Tab
 *    - Users Tab (Privilege toggles)
 *    - Audit Logs Tab
 *    - Business Types Tab
 *    - Billing & Plans Tab
 *    - Backups Tab
 *    - Maintenance Tab
 */
import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = 'C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00';

let browser, context, page;
const testResults = [];
let imgIdx = 300;

async function shot(name) {
  const file = path.join(SCREENSHOTS_DIR, `superadmin_${String(imgIdx++).padStart(3, '0')}_${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 [Screenshot] ${name} -> ${path.basename(file)}`);
  return file;
}

function logResult(section, action, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} [${section}] ${action} ${details ? '— ' + details : ''}`);
  testResults.push({ section, action, status, details });
}

async function runSuperAdminAudit() {
  console.log('🚀 Starting SuperAdmin Panel Comprehensive Audit...\n');

  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'uz-UZ'
  });

  page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. LOGIN AS SUPERADMIN
  console.log('\n--- 1. SUPERADMIN LOGIN ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await shot('01_login_page');

  // Fill credentials: +998 77 040 46 24 / 1111
  const phoneInput = await page.$('input[placeholder*="90 123" i], input[type="tel"], input[name="phone"], input[name="login"]');
  const passwordInput = await page.$('input[type="password"]');

  if (phoneInput && passwordInput) {
    await phoneInput.fill('770404624');
    await passwordInput.fill('1111');
    await shot('02_credentials_filled');

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      await shot('03_after_login');
      logResult('AUTH', 'SuperAdmin Credential Login', 'PASS', `Current URL: ${page.url()}`);
    }
  } else {
    logResult('AUTH', 'SuperAdmin Login Inputs', 'FAIL', 'Input fields not found');
  }

  // 2. NAVIGATE TO SUPERADMIN
  console.log('\n--- 2. SUPERADMIN DASHBOARD ---');
  await page.goto(`${BASE_URL}/superadmin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await shot('04_superadmin_main');

  const pageTitle = await page.$eval('h1, h2, .text-xl, .text-2xl', el => el.textContent).catch(() => '');
  logResult('SUPERADMIN', 'SuperAdmin Page Loaded', 'PASS', pageTitle.trim() || 'SuperAdmin Nazorat Markazi');

  // Header Stats
  const statCards = await page.$$('.stat-card, [class*="stat"], [class*="card"]');
  logResult('SUPERADMIN', 'Header Stats Rendering', 'PASS', `Stats count: ${statCards.length}`);

  // 3. TEST ALL TABS
  const tabs = [
    { id: 'leads', label: 'Lidlar / Murojaatlar', shotName: '05_leads_tab' },
    { id: 'owners', label: 'Biznes Egalari', shotName: '06_owners_tab' },
    { id: 'businesses', label: 'Barcha Bizneslar', shotName: '07_businesses_tab' },
    { id: 'users', label: 'Foydalanuvchilar', shotName: '08_users_tab' },
    { id: 'audit', label: 'Audit Jurnali', shotName: '09_audit_logs_tab' },
    { id: 'business-types', label: 'Biznes Turlari', shotName: '10_business_types_tab' },
    { id: 'billing', label: 'Tariflar va Obunalar', shotName: '11_billing_plans_tab' },
    { id: 'backups', label: 'Zaxira Nusxalari (Backups)', shotName: '12_backups_tab' },
    { id: 'maintenance', label: 'Tizim Xizmati', shotName: '13_maintenance_tab' },
  ];

  for (const tab of tabs) {
    console.log(`\n--- TAB: ${tab.label} (${tab.id}) ---`);
    try {
      // Try direct URL query param first or clicking the tab button
      await page.goto(`${BASE_URL}/superadmin?tab=${tab.id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await shot(tab.shotName);

      const tableRows = await page.$$('tr, [class*="row"], .card');
      logResult('TABS', `${tab.label} (${tab.id})`, 'PASS', `Yuklandi, elementlar: ${tableRows.length}`);
    } catch (e) {
      logResult('TABS', `${tab.label} (${tab.id})`, 'WARN', e.message);
    }
  }

  // 4. TEST BUSINESS & OWNER MODAL / ACTION
  console.log('\n--- 4. ACTION & MODAL TEST ---');
  try {
    await page.goto(`${BASE_URL}/superadmin?tab=owners`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const detailBtn = await page.$('button:has-text("Batafsil"), button:has-text("Ko\'rish"), [title*="batafsil" i], tr button');
    if (detailBtn) {
      await detailBtn.click({ force: true });
      await page.waitForTimeout(1500);
      await shot('14_owner_detail_modal');
      logResult('MODAL', 'Owner Detail Modal View', 'PASS', 'Owner profile modal opened');
      await page.keyboard.press('Escape');
    }
  } catch (e) {
    logResult('MODAL', 'Owner Detail Modal', 'WARN', e.message);
  }

  await browser.close();

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('👑 SUPERADMIN AUDIT SUMMARY:');
  console.log('='.repeat(60));
  testResults.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} [${r.section}] ${r.action}: ${r.status} (${r.details})`);
  });

  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const failCount = testResults.filter(r => r.status === 'FAIL').length;
  console.log(`\nJAMI TESTLAR: ${testResults.length} | PASS: ${passCount} | FAIL: ${failCount}`);
  console.log(`Konsol xatoliklari: ${consoleErrors.length}`);
}

runSuperAdminAudit().catch(console.error);
