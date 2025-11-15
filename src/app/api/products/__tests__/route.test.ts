/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/products/route';
import { prisma } from '@/lib/prisma';
import type { ProductStage, ProductStatus } from '@/lib/types';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = jest.mocked(prisma);

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Produto 1',
          op: 'OP001',
          batch: 'L001',
          quantity: 100,
          currentStage: 'producao_1kg' as ProductStage,
          status: 'in_progress' as ProductStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Produto 2',
          op: 'OP002',
          batch: 'L002',
          quantity: 200,
          currentStage: 'avaliacao_cor' as ProductStage,
          status: 'completed' as ProductStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].name).toBe('Produto 1');
      expect(data.data[1].name).toBe('Produto 2');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Falha ao buscar produtos');
      expect(data.details).toBe('Database connection failed');
    });

    it('should return empty array when no products exist', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const newProduct = {
        id: '1',
        name: 'Novo Produto',
        op: 'OP003',
        batch: 'L003',
        quantity: 150,
        currentStage: 'producao_1kg' as ProductStage,
        status: 'in_progress' as ProductStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.create.mockResolvedValue(newProduct);

      const requestData = {
        name: 'Novo Produto',
        op: 'OP003',
        batch: 'L003',
        quantity: 150,
      };

      // Create a mock request with JSON body
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Novo Produto');
      expect(data.data.op).toBe('OP003');
      expect(data.data.quantity).toBe(150);

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Novo Produto',
          op: 'OP003',
          batch: 'L003',
          quantity: 150,
          currentStage: 'producao_1kg',
          status: 'in_progress',
        },
      });
    });

    it('should validate required fields', async () => {
      const requestData = {
        name: 'Teste',
        // Missing op, batch, quantity
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Campos obrigatórios: name, op, batch, quantity');
    });

    it('should validate quantity is positive', async () => {
      const requestData = {
        name: 'Teste',
        op: 'OP001',
        batch: 'L001',
        quantity: -10,
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Quantidade deve ser maior que zero');
    });

    it('should handle duplicate product error', async () => {
      const duplicateError = new Error('Unique constraint failed');
      (duplicateError as any).code = 'P2002';
      mockPrisma.product.create.mockRejectedValue(duplicateError);

      const requestData = {
        name: 'Produto Duplicado',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Já existe um produto com esta OP e Lote');
      expect(data.details).toBe('A combinação Ordem de Produção + Lote deve ser única');
    });

    it('should handle generic database errors', async () => {
      mockPrisma.product.create.mockRejectedValue(new Error('Generic database error'));

      const requestData = {
        name: 'Teste',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Erro interno do servidor');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
