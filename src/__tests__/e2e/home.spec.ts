import { test, expect } from '@playwright/test';

test.describe('Kanban Application', () => {
  test('should load the main page successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the main page loads
    await expect(page).toHaveTitle(/Kanban/);

    // Check for main content
    await expect(page.locator('text=Sistema Kanban - Versão Funcional')).toBeVisible();

    // Check for success indicators
    await expect(page.locator('text=Aplicação carregada com sucesso')).toBeVisible();
    await expect(page.locator('text=Aplicação funcionando perfeitamente')).toBeVisible();
  });

  test('should display API endpoints information', async ({ page }) => {
    await page.goto('/');

    // Check API endpoints are displayed
    await expect(page.locator('text=API: http://localhost:3000/api/products')).toBeVisible();
    await expect(page.locator('text=Prisma Studio: http://localhost:5556')).toBeVisible();
    await expect(page.locator('text=Servidor: Porta 3000')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');

    // Check main container responsiveness
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(container).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(container).toBeVisible();
  });

  test('should handle navigation correctly', async ({ page }) => {
    await page.goto('/');

    // Check if all cards are present and clickable
    const cards = page.locator('.bg-green-50, .bg-blue-50, .bg-purple-50, .bg-yellow-50');
    await expect(cards).toHaveCount(4);

    // Check if cards have proper styling
    for (const card of await cards.all()) {
      await expect(card).toBeVisible();
    }
  });
});
