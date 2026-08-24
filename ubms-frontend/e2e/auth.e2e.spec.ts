import { test, expect } from '@playwright/test';

test.describe('Authentication & Login E2E Flow', () => {
  test('should display login page title and form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/boshqar.uz/i);
    
    // Check main elements
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="77"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(phoneInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('should show error notification on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    const phoneInput = page.locator('input[type="tel"], input[name="phone"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await phoneInput.fill('+998770404624');
    await passwordInput.fill('wrongpassword123');
    await submitBtn.click();

    // Check error toast or alert
    const errorMessage = page.locator('.toast, [role="alert"], .text-red-500, .bg-red-50');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});
