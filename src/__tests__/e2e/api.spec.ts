import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should fetch products from API', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should fetch statistics from API', async ({ request }) => {
    const response = await request.get('/api/stats');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(typeof data.data.total).toBe('number');
    expect(typeof data.data.inProgress).toBe('number');
    expect(typeof data.data.completed).toBe('number');
    expect(typeof data.data.paused).toBe('number');
    expect(typeof data.data.blocked).toBe('number');
  });

  test('should create product via API', async ({ request }) => {
    const newProduct = {
      name: 'API Test Product',
      op: 'API001',
      batch: 'API001',
      quantity: 50,
    };

    const response = await request.post('/api/products', {
      data: newProduct,
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('API Test Product');
    expect(data.data.op).toBe('API001');
    expect(data.data.quantity).toBe(50);
  });

  test('should validate API input data', async ({ request }) => {
    // Test missing required fields
    const invalidProduct = {
      name: 'Test Product',
      // Missing op, batch, quantity
    };

    const response = await request.post('/api/products', {
      data: invalidProduct,
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Campos obrigatórios: name, op, batch, quantity');
  });

  test('should handle duplicate product creation', async ({ request }) => {
    const duplicateProduct = {
      name: 'Duplicate Product',
      op: 'DUP001',
      batch: 'DUP001',
      quantity: 25,
    };

    // Create first product
    const response1 = await request.post('/api/products', {
      data: duplicateProduct,
    });

    expect(response1.ok()).toBeTruthy();

    // Try to create duplicate
    const response2 = await request.post('/api/products', {
      data: duplicateProduct,
    });

    expect(response2.status()).toBe(409);

    const data = await response2.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Já existe um produto com esta OP e Lote');
  });

  test('should validate quantity constraints', async ({ request }) => {
    // Test negative quantity
    const negativeQuantity = {
      name: 'Negative Test',
      op: 'NEG001',
      batch: 'NEG001',
      quantity: -10,
    };

    const response1 = await request.post('/api/products', {
      data: negativeQuantity,
    });

    expect(response1.status()).toBe(400);
    expect((await response1.json()).error).toBe('Quantidade deve ser maior que zero');

    // Test zero quantity
    const zeroQuantity = {
      name: 'Zero Test',
      op: 'ZERO001',
      batch: 'ZERO001',
      quantity: 0,
    };

    const response2 = await request.post('/api/products', {
      data: zeroQuantity,
    });

    expect(response2.status()).toBe(400);
    expect((await response2.json()).error).toBe('Quantidade deve ser maior que zero');
  });

  test('should handle API errors gracefully', async ({ request }) => {
    // Test with invalid JSON
    const response = await request.post('/api/products', {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
