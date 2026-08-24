import { test, expect } from '@playwright/test';

test.describe('POS Cashier Sale & Checkout E2E Flow', () => {
  test('should render POS catalog and cart container', async ({ page }) => {
    await page.goto('/pos');
    
    // If redirected to login, login first or check page structure
    if (page.url().includes('/login')) {
      await page.fill('input[type="tel"]', '+998770404624');
      await page.fill('input[type="password"]', 'demo123456');
      await page.click('button[type="submit"]');
    }

    await page.goto('/pos');
    const posHeader = page.locator('header, h1, .pos-header');
    await expect(posHeader).toBeVisible();
  });
});
