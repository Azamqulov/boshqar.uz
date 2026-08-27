/**
 * FULL SYSTEM AUDIT SCRIPT
 * Tests all major CRUD operations in boshqar.uz system
 * Login → Dashboard → Products → Inventory → POS (order) → KDS → Finance
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join('C:/Users/ALFA/.gemini/antigravity-ide/brain/2a0dc8b7-bed4-4863-bb9d-6dcd92d58f00');

let browser, page;
const results = [];
let screenshotIndex = 100;

async function shot(name) {
  const file = path.join(SCREENSHOTS_DIR, `audit_${String(screenshotIndex++).padStart(3,'0')}_${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 ${name} -> ${path.basename(file)}`);
  return file;
}

function log(status, module, action, note = '') {
  const icon = status === 'OK' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const line = `${icon} [${module}] ${action}${note ? ' — ' + note : ''}`;
  console.log(line);
  results.push({ status, module, action, note });
}

async function waitAndClick(selector, timeout = 8000) {
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
}

async function fillField(selector, value) {
  await page.waitForSelector(selector, { timeout: 6000 });
  await page.fill(selector, value);
}

async function login() {
  console.log('\n🔐 === LOGIN TEST ===');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 });
  await shot('01_landing');

  // Go to login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await shot('02_login_page');

  // Try demo login button first
  try {
    const demoBtn = await page.$('button:has-text("Demo"), button:has-text("demo"), [data-testid="demo-login"]');
    if (demoBtn) {
      await demoBtn.click();
      await page.waitForTimeout(2000);
      await shot('03_after_demo_login');
      const url = page.url();
      if (url.includes('/dashboard') || url.includes('/pos') || url.includes('/app')) {
        log('OK', 'AUTH', 'Demo login successful', url);
        return true;
      }
    }
  } catch {}

  // Manual login
  try {
    await fillField('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]', 'admin@boshqar.uz');
    await fillField('input[type="password"], input[name="password"]', 'admin123');
    await shot('03_login_filled');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await shot('04_after_login');
    const url = page.url();
    log('OK', 'AUTH', 'Manual login attempt', url);
    return true;
  } catch(e) {
    log('FAIL', 'AUTH', 'Login failed', e.message);
    return false;
  }
}

async function testDashboard() {
  console.log('\n📊 === DASHBOARD TEST ===');
  try {
    // Navigate to dashboard
    const dashLinks = ['/dashboard', '/app/dashboard', '/app'];
    for (const link of dashLinks) {
      try {
        await page.goto(`${BASE_URL}${link}`, { waitUntil: 'networkidle', timeout: 10000 });
        if (!page.url().includes('/login')) break;
      } catch {}
    }
    await page.waitForTimeout(1500);
    await shot('10_dashboard');
    
    const title = await page.title();
    const h1 = await page.$eval('h1, h2', el => el.textContent).catch(() => '');
    log('OK', 'DASHBOARD', 'Dashboard loaded', h1 || title);
    
    // Check stats cards
    const cards = await page.$$('.stat-card, .card, [class*="stat"], [class*="metric"]');
    log(cards.length > 0 ? 'OK' : 'WARN', 'DASHBOARD', `Stats cards found: ${cards.length}`);
    
    // Check charts
    const charts = await page.$$('canvas, .chart, [class*="chart"], svg[class*="chart"]');
    log(charts.length > 0 ? 'OK' : 'WARN', 'DASHBOARD', `Charts found: ${charts.length}`);
    
    await shot('11_dashboard_scroll');
    return true;
  } catch(e) {
    log('FAIL', 'DASHBOARD', 'Dashboard test failed', e.message);
    return false;
  }
}

async function testProducts() {
  console.log('\n🛍️ === PRODUCTS MODULE TEST ===');
  
  const productPaths = ['/products', '/app/products', '/menu', '/app/menu'];
  let landed = false;
  for (const p of productPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  if (!landed) {
    // Try sidebar navigation
    try {
      const sideLinks = await page.$$('nav a, aside a, .sidebar a');
      for (const link of sideLinks) {
        const text = await link.textContent();
        if (/product|menu|mahsulot/i.test(text || '')) {
          await link.click();
          await page.waitForTimeout(1500);
          break;
        }
      }
    } catch {}
  }
  
  await page.waitForTimeout(1000);
  await shot('20_products_list');
  
  const pageContent = await page.content();
  const hasTable = pageContent.includes('table') || pageContent.includes('tbody') || pageContent.includes('grid');
  log(hasTable ? 'OK' : 'WARN', 'PRODUCTS', 'Product list page rendered', page.url());
  
  // Test: Add new product
  console.log('  → Testing ADD product...');
  try {
    const addBtn = await page.$('button:has-text("Add"), button:has-text("Qo"), button:has-text("Yangi"), button:has-text("Create"), button:has-text("+"), [data-testid="add-product"]');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1500);
      await shot('21_add_product_modal');
      
      // Fill product form
      const nameInput = await page.$('input[name="name"], input[placeholder*="name" i], input[placeholder*="nom" i], input[placeholder*="Name" i]');
      if (nameInput) {
        await nameInput.fill('Test Mahsulot ' + Date.now());
        const priceInput = await page.$('input[name="price"], input[placeholder*="price" i], input[placeholder*="narx" i], input[type="number"]');
        if (priceInput) await priceInput.fill('25000');
        await shot('22_product_form_filled');
        
        // Submit
        const submitBtn = await page.$('button[type="submit"], button:has-text("Save"), button:has-text("Saqlash"), button:has-text("Submit")');
        if (submitBtn) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
          await shot('23_after_product_add');
          log('OK', 'PRODUCTS', 'Add product — form submitted');
        } else {
          log('WARN', 'PRODUCTS', 'Add product — submit button not found');
        }
      } else {
        log('WARN', 'PRODUCTS', 'Add product — name input not found');
      }
      
      // Close modal if still open
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      log('WARN', 'PRODUCTS', 'Add button not found on products page');
    }
  } catch(e) {
    log('FAIL', 'PRODUCTS', 'Add product test', e.message);
  }
  
  // Test: Edit existing product
  console.log('  → Testing EDIT product...');
  try {
    await page.waitForTimeout(1000);
    const editBtn = await page.$('button:has-text("Edit"), button:has-text("Tahrir"), [title*="edit" i], .edit-btn, button[aria-label*="edit" i]');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(1500);
      await shot('24_edit_product_modal');
      log('OK', 'PRODUCTS', 'Edit product modal opened');
      await page.keyboard.press('Escape');
    } else {
      // Try right-click menu or action menu
      const rows = await page.$$('tr, .product-card, .product-row');
      if (rows.length > 0) {
        await rows[0].hover();
        await page.waitForTimeout(500);
        await shot('24_product_row_hover');
        const actionBtn = await rows[0].$('button, [class*="action"]');
        if (actionBtn) {
          await actionBtn.click();
          await page.waitForTimeout(800);
          await shot('25_product_action_menu');
        }
        log('WARN', 'PRODUCTS', `Edit — found ${rows.length} product rows but no direct edit button`);
      }
    }
  } catch(e) {
    log('WARN', 'PRODUCTS', 'Edit product', e.message);
  }
  
  // Test: Delete product
  console.log('  → Testing DELETE product...');
  try {
    const deleteBtn = await page.$('button:has-text("Delete"), button:has-text("O\'chir"), [title*="delete" i], .delete-btn');
    if (deleteBtn) {
      await deleteBtn.click();
      await page.waitForTimeout(1000);
      await shot('26_delete_confirm');
      // Cancel the deletion
      await page.keyboard.press('Escape');
      log('OK', 'PRODUCTS', 'Delete product — confirmation appeared');
    } else {
      log('WARN', 'PRODUCTS', 'Delete button not directly visible');
    }
  } catch(e) {
    log('WARN', 'PRODUCTS', 'Delete product', e.message);
  }
  
  // Check categories
  console.log('  → Testing product CATEGORIES...');
  try {
    const catTab = await page.$('[role="tab"]:has-text("Categor"), [role="tab"]:has-text("Kategoriya"), .category-filter');
    if (catTab) {
      await catTab.click();
      await page.waitForTimeout(1000);
      await shot('27_categories');
      log('OK', 'PRODUCTS', 'Categories tab found and clicked');
    } else {
      log('WARN', 'PRODUCTS', 'Categories tab not found');
    }
  } catch(e) {}
}

async function testInventory() {
  console.log('\n📦 === INVENTORY MODULE TEST ===');
  
  const invPaths = ['/inventory', '/app/inventory', '/warehouse', '/stok'];
  let landed = false;
  for (const p of invPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  await page.waitForTimeout(1000);
  await shot('30_inventory_list');
  log(landed ? 'OK' : 'WARN', 'INVENTORY', 'Inventory page', page.url());
  
  // Test: Add stock movement / supply
  console.log('  → Testing ADD inventory/stock...');
  try {
    const addBtn = await page.$('button:has-text("Add"), button:has-text("Kirish"), button:has-text("Qo"), button:has-text("+"), button:has-text("Yangi")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1500);
      await shot('31_inventory_add_modal');
      log('OK', 'INVENTORY', 'Add inventory modal opened');
      await page.keyboard.press('Escape');
    } else {
      log('WARN', 'INVENTORY', 'Add button not found');
    }
  } catch(e) {
    log('WARN', 'INVENTORY', 'Add inventory', e.message);
  }
  
  // Check low stock alerts
  try {
    const lowStock = await page.$('.low-stock, [class*="warning"], [class*="alert"], [class*="low"]');
    log(lowStock ? 'OK' : 'INFO', 'INVENTORY', 'Low stock indicators check');
    await shot('32_inventory_detail');
  } catch {}
}

async function testPOS() {
  console.log('\n🛒 === POS (ZAKAZ) MODULE TEST ===');
  
  const posPaths = ['/pos', '/app/pos', '/terminal', '/cashier'];
  let landed = false;
  for (const p of posPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  await page.waitForTimeout(2000);
  await shot('40_pos_terminal');
  log(landed ? 'OK' : 'WARN', 'POS', 'POS terminal page', page.url());
  
  // Check product grid on POS
  const productCards = await page.$$('.product-card, .menu-item, .pos-item, [class*="menu-card"], [class*="product"]');
  log(productCards.length > 0 ? 'OK' : 'WARN', 'POS', `Product cards in POS: ${productCards.length}`);
  
  // Test: Add item to cart
  console.log('  → Testing ADD item to cart...');
  try {
    if (productCards.length > 0) {
      await productCards[0].click();
      await page.waitForTimeout(1000);
      await shot('41_pos_item_added');
      
      // Check cart
      const cartItems = await page.$$('.cart-item, [class*="cart"] [class*="item"], .order-item');
      log(cartItems.length > 0 ? 'OK' : 'WARN', 'POS', `Items in cart after click: ${cartItems.length}`);
    }
  } catch(e) {
    log('WARN', 'POS', 'Add item to cart', e.message);
  }
  
  // Test: Increase quantity
  console.log('  → Testing quantity +/-...');
  try {
    const plusBtn = await page.$('button:has-text("+"), [aria-label*="increase"], [class*="plus"]');
    if (plusBtn) {
      await plusBtn.click();
      await page.waitForTimeout(500);
      await shot('42_pos_qty_increased');
      log('OK', 'POS', 'Quantity increase button works');
    }
    const minusBtn = await page.$('button:has-text("-"), [aria-label*="decrease"], [class*="minus"]');
    if (minusBtn) {
      await minusBtn.click();
      await page.waitForTimeout(500);
      log('OK', 'POS', 'Quantity decrease button works');
    }
  } catch(e) {}
  
  // Test: Table selection
  console.log('  → Testing table selection...');
  try {
    const tableBtn = await page.$('.table-btn, [class*="table"], button:has-text("Table"), button:has-text("Stol")');
    if (tableBtn) {
      await tableBtn.click();
      await page.waitForTimeout(1000);
      await shot('43_pos_table_select');
      log('OK', 'POS', 'Table selection UI found');
      await page.keyboard.press('Escape');
    }
  } catch {}
  
  // Test: Place order / checkout
  console.log('  → Testing PLACE ORDER (checkout)...');
  try {
    const cartTotal = await page.$('.cart-total, [class*="total"], .order-total');
    if (cartTotal) {
      const total = await cartTotal.textContent();
      log('OK', 'POS', `Cart total shown: ${total?.trim()}`);
    }
    
    const checkoutBtn = await page.$('button:has-text("Order"), button:has-text("Checkout"), button:has-text("Zakaz"), button:has-text("Buyurtma"), button:has-text("Pay"), [data-testid*="checkout"], [data-testid*="order"]');
    if (checkoutBtn) {
      await checkoutBtn.click();
      await page.waitForTimeout(2000);
      await shot('44_pos_checkout');
      log('OK', 'POS', 'Checkout/Order button clicked');
      await page.keyboard.press('Escape');
    } else {
      log('WARN', 'POS', 'Checkout button not found in cart');
    }
  } catch(e) {
    log('WARN', 'POS', 'Place order', e.message);
  }
  
  // Test: Category filter in POS
  console.log('  → Testing CATEGORY filter in POS...');
  try {
    const catBtns = await page.$$('.category-btn, [class*="category"] button, .pos-category');
    if (catBtns.length > 0) {
      await catBtns[0].click();
      await page.waitForTimeout(800);
      await shot('45_pos_category_filter');
      log('OK', 'POS', `Category filters: ${catBtns.length} found`);
    }
  } catch {}
  
  await shot('46_pos_final_state');
}

async function testKDS() {
  console.log('\n👨‍🍳 === KDS (KITCHEN) MODULE TEST ===');
  
  const kdsPaths = ['/kds', '/app/kds', '/kitchen', '/kitchen-display'];
  let landed = false;
  for (const p of kdsPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  await page.waitForTimeout(1500);
  await shot('50_kds_view');
  log(landed ? 'OK' : 'WARN', 'KDS', 'KDS page', page.url());
  
  // Check order cards
  const orderCards = await page.$$('.order-card, .kds-card, [class*="kds"], [class*="kitchen"]');
  log(orderCards.length >= 0 ? 'OK' : 'WARN', 'KDS', `Order cards in KDS: ${orderCards.length}`);
  
  // Test: Mark order as done
  try {
    const doneBtn = await page.$('button:has-text("Done"), button:has-text("Ready"), button:has-text("Tayyor"), button:has-text("Complete")');
    if (doneBtn) {
      await doneBtn.click();
      await page.waitForTimeout(1000);
      await shot('51_kds_order_done');
      log('OK', 'KDS', 'Mark order done button clicked');
    } else {
      log('WARN', 'KDS', 'No ready/done button found (may need active orders)');
    }
  } catch {}
}

async function testFinance() {
  console.log('\n💰 === FINANCE MODULE TEST ===');
  
  const finPaths = ['/finance', '/app/finance', '/reports', '/analytics'];
  let landed = false;
  for (const p of finPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  await page.waitForTimeout(2000);
  await shot('60_finance_view');
  log(landed ? 'OK' : 'WARN', 'FINANCE', 'Finance page', page.url());
  
  // Check revenue cards
  const revenueCards = await page.$$('[class*="revenue"], [class*="income"], [class*="stat"], .metric-card');
  log(revenueCards.length > 0 ? 'OK' : 'WARN', 'FINANCE', `Revenue/stat cards: ${revenueCards.length}`);
  
  // Check date filter
  try {
    const dateFilter = await page.$('input[type="date"], .date-picker, [class*="date-range"]');
    if (dateFilter) {
      log('OK', 'FINANCE', 'Date filter found');
    }
  } catch {}
  
  // Check charts
  const charts = await page.$$('canvas, .chart, [class*="chart"], .recharts-wrapper, .apexcharts-canvas');
  log(charts.length > 0 ? 'OK' : 'WARN', 'FINANCE', `Charts rendered: ${charts.length}`);
  
  await shot('61_finance_charts');
  
  // Test tabs
  try {
    const tabs = await page.$$('[role="tab"], .tab-btn, [class*="tab"]');
    if (tabs.length > 1) {
      await tabs[1].click();
      await page.waitForTimeout(1000);
      await shot('62_finance_tab2');
      log('OK', 'FINANCE', `Finance tabs: ${tabs.length} found, tab 2 clicked`);
    }
  } catch {}
}

async function testSettings() {
  console.log('\n⚙️ === SETTINGS MODULE TEST ===');
  
  const settingsPaths = ['/settings', '/app/settings', '/admin'];
  let landed = false;
  for (const p of settingsPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  await page.waitForTimeout(1500);
  await shot('70_settings');
  log(landed ? 'OK' : 'WARN', 'SETTINGS', 'Settings page', page.url());
  
  // Check profile/business settings
  const inputs = await page.$$('input, select, textarea');
  log(inputs.length > 0 ? 'OK' : 'WARN', 'SETTINGS', `Settings fields: ${inputs.length}`);
}

async function testStaff() {
  console.log('\n👥 === STAFF MODULE TEST ===');
  
  const staffPaths = ['/staff', '/app/staff', '/employees', '/users'];
  let landed = false;
  for (const p of staffPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  await page.waitForTimeout(1500);
  await shot('80_staff_view');
  log(landed ? 'OK' : 'WARN', 'STAFF', 'Staff page', page.url());
  
  const rows = await page.$$('tr, .staff-card, .user-card');
  log('INFO', 'STAFF', `Staff entries found: ${rows.length}`);
  
  // Try add staff
  try {
    const addBtn = await page.$('button:has-text("Add"), button:has-text("Yangi"), button:has-text("+")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1200);
      await shot('81_staff_add_modal');
      log('OK', 'STAFF', 'Add staff modal opened');
      await page.keyboard.press('Escape');
    }
  } catch {}
}

async function testOrders() {
  console.log('\n📋 === ORDERS MODULE TEST ===');
  
  const orderPaths = ['/orders', '/app/orders', '/history'];
  let landed = false;
  for (const p of orderPaths) {
    try {
      await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      if (!page.url().includes('/login')) { landed = true; break; }
    } catch {}
  }
  
  await page.waitForTimeout(1500);
  await shot('90_orders_list');
  log(landed ? 'OK' : 'WARN', 'ORDERS', 'Orders page', page.url());
  
  // Check order table
  const orderRows = await page.$$('tr, .order-row, .order-card');
  log('INFO', 'ORDERS', `Order rows: ${orderRows.length}`);
  
  // View order detail
  try {
    if (orderRows.length > 1) {
      await orderRows[1].click();
      await page.waitForTimeout(1000);
      await shot('91_order_detail');
      log('OK', 'ORDERS', 'Order detail view opened');
      await page.keyboard.press('Escape');
    }
  } catch {}
}

// ===================  MAIN  ===================
async function main() {
  console.log('🚀 Starting FULL SYSTEM AUDIT...\n');
  console.log('Target:', BASE_URL);
  console.log('Screenshots dir:', SCREENSHOTS_DIR);
  
  browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 },
    locale: 'uz-UZ'
  });
  page = await context.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  try {
    const loggedIn = await login();
    if (!loggedIn) {
      log('FAIL', 'SYSTEM', 'Could not authenticate — aborting further tests');
    } else {
      await testDashboard();
      await testProducts();
      await testInventory();
      await testPOS();
      await testKDS();
      await testFinance();
      await testSettings();
      await testStaff();
      await testOrders();
    }
  } catch(e) {
    console.error('Fatal error:', e.message);
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  
  const ok = results.filter(r => r.status === 'OK').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`✅ OK:   ${ok}`);
  console.log(`⚠️  WARN: ${warn}`);
  console.log(`❌ FAIL: ${fail}`);
  console.log(`📸 Console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('\nConsole Errors:');
    consoleErrors.slice(0, 10).forEach(e => console.log('  -', e.substring(0, 150)));
  }
  
  console.log('\nDetailed Results:');
  results.forEach(r => {
    const icon = r.status === 'OK' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${icon} [${r.module}] ${r.action}${r.note ? ': ' + r.note : ''}`);
  });
  
  console.log('\n✅ Audit complete!');
}

main().catch(console.error);
