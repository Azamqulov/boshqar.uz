import { test, expect } from '@playwright/test';

test.describe('Settings & Audit Trail E2E Flow', () => {
  test('should render audit log items or empty state gracefully', async ({ page }) => {
    await page.goto('/settings');

    if (page.url().includes('/login')) {
      await page.fill('input[type="tel"]', '+998770404624');
      await page.fill('input[type="password"]', 'demo123456');
      await page.click('button[type="submit"]');
      await page.goto('/settings');
    }

    const auditHeader = page.locator('text=Audit, text=Audit Log, text=Harakatlar tarixi').first();
    if (await auditHeader.isVisible()) {
      await auditHeader.click();
    }

    // Verify empty state or audit table is present without UI crash
    const mainContainer = page.locator('.glass-card, table, .text-center').first();
    await expect(mainContainer).toBeVisible();
  });
});
