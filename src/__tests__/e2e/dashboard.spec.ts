import { test, expect } from '@playwright/test';

test.describe('Kanban Dashboard', () => {
  test('should load dashboard page successfully', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading to complete
    await expect(page.locator('text=Carregando aplicação...')).toBeVisible();
    await expect(page.locator('text=Carregando aplicação...')).toBeHidden();

    // Check if dashboard is visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Check for stats cards
    await expect(page.locator('[data-testid="stats-card"]')).toBeVisible();

    // Check for individual stat values
    const totalElement = page.locator('text=Total').locator('..').locator('.text-2xl');
    const inProgressElement = page.locator('text=Em Andamento').locator('..').locator('.text-2xl');

    // Wait for elements to be populated with data
    await expect(totalElement).toBeVisible();
    await expect(inProgressElement).toBeVisible();
  });

  test('should show product form', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Look for form elements
    const nameInput = page.locator('input[placeholder*="nome"]');
    const opInput = page.locator('input[placeholder*="OP"]');
    const batchInput = page.locator('input[placeholder*="lote"]');
    const quantityInput = page.locator('input[placeholder*="quantidade"]');

    // Check if form inputs are present
    await expect(nameInput.or(opInput).or(batchInput).or(quantityInput)).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Find and click submit button without filling form
    const submitButton = page.locator('button:has-text("Criar Produto")');
    await expect(submitButton).toBeVisible();

    // Try to submit empty form
    await submitButton.click();

    // Check for validation messages
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
    await expect(page.locator('text=OP é obrigatória')).toBeVisible();
    await expect(page.locator('text=Lote é obrigatório')).toBeVisible();
    await expect(page.locator('text=Quantidade é obrigatória')).toBeVisible();
  });

  test('should create product successfully', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Fill form with valid data
    await page.fill('input[placeholder*="nome"]', 'Produto Teste E2E');
    await page.fill('input[placeholder*="OP"]', 'OP001');
    await page.fill('input[placeholder*="lote"]', 'L001');
    await page.fill('input[placeholder*="quantidade"]', '100');

    // Submit form
    await page.click('button:has-text("Criar Produto")');

    // Check for success feedback
    await expect(page.locator('text=Produto criado com sucesso')).toBeVisible();

    // Check if form is cleared
    await expect(page.locator('input[placeholder*="nome"]')).toHaveValue('');
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Fill with invalid data
    await page.fill('input[placeholder*="nome"]', 'A'); // Too short
    await page.fill('input[placeholder*="OP"]', 'OP-001'); // Invalid format
    await page.fill('input[placeholder*="lote"]', 'B'); // Too short
    await page.fill('input[placeholder*="quantidade"]', '-10'); // Negative number

    // Submit form
    await page.click('button:has-text("Criar Produto")');

    // Check validation messages
    await expect(page.locator('text=Nome deve ter pelo menos 2 caracteres')).toBeVisible();
    await expect(page.locator('text=OP deve conter apenas letras e números')).toBeVisible();
    await expect(page.locator('text=Lote deve ter pelo menos 2 caracteres')).toBeVisible();
    await expect(page.locator('text=Quantidade deve ser um número positivo')).toBeVisible();
  });

  test('should display product table', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Check for product table
    await expect(page.locator('table').or(page.locator('[data-testid="product-table"]'))).toBeVisible();

    // Check for table headers
    await expect(page.locator('text=Produto')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Estágio')).toBeVisible();
  });

  test('should handle responsive layout', async ({ page }) => {
    await page.goto('/page-simple');

    // Wait for loading
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if layout adapts
    await expect(page.locator('.container')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Check if layout adapts
    await expect(page.locator('.container')).toBeVisible();
  });

  test('should show loading states correctly', async ({ page }) => {
    await page.goto('/page-simple');

    // Check initial loading state
    await expect(page.locator('text=Carregando aplicação...')).toBeVisible();

    // Wait for loading to complete
    await expect(page.locator('text=Carregando aplicação...')).toBeHidden();

    // Check if main content is loaded
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
