import { ProductService } from '@/lib/product-service';
import { prisma } from '@/lib/prisma';
import type { ProductStage } from '@/lib/types';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stageHistory: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

const mockPrisma = jest.mocked(prisma);

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      const mockProductData = {
        id: '1',
        name: 'Produto Teste',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
        currentStage: 'producao_1kg' as ProductStage,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        stagesHistory: [
          {
            id: '1',
            stage: 'producao_1kg' as ProductStage,
            startTime: new Date(),
            endTime: null,
            mod: 1,
            notes: null,
            productId: '1',
          },
        ],
        hourlyControls: [],
      };

      mockPrisma.product.create.mockResolvedValue(mockProductData);

      const result = await ProductService.createProduct({
        name: 'Produto Teste',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
      });

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Produto Teste',
          op: 'OP001',
          batch: 'L001',
          quantity: 100,
          currentStage: 'producao_1kg',
          status: 'in_progress',
          stagesHistory: {
            create: {
              stage: 'producao_1kg',
              startTime: expect.any(String),
              mod: 1,
            },
          },
        },
        include: {
          stagesHistory: true,
          hourlyControls: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Produto Teste');
      expect(result.currentStage).toBe('producao_1kg');
    });

    it('should handle database errors', async () => {
      mockPrisma.product.create.mockRejectedValue(new Error('Database error'));

      await expect(
        ProductService.createProduct({
          name: 'Produto Teste',
          op: 'OP001',
          batch: 'L001',
          quantity: 100,
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Produto 1',
          op: 'OP001',
          batch: 'L001',
          quantity: 100,
          currentStage: 'producao_1kg' as ProductStage,
          status: 'in_progress' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          stagesHistory: [],
          hourlyControls: [],
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await ProductService.getAllProducts();

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: {
          stagesHistory: {
            orderBy: {
              startTime: 'asc',
            },
          },
          hourlyControls: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Produto 1');
    });
  });

  describe('advanceStage', () => {
    it('should advance product stage successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Produto Teste',
        currentStage: 'producao_1kg' as ProductStage,
        status: 'in_progress' as const,
        stagesHistory: [
          {
            id: '1',
            stage: 'producao_1kg' as ProductStage,
            startTime: new Date(),
            endTime: null,
            mod: 1,
            notes: null,
            productId: '1',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
        hourlyControls: [],
      };

      const mockUpdatedProduct = {
        ...mockProduct,
        currentStage: 'avaliacao_cor' as ProductStage,
        status: 'in_progress' as const,
        stagesHistory: [
          {
            id: '1',
            stage: 'producao_1kg' as ProductStage,
            startTime: new Date(Date.now() - 1000),
            endTime: new Date(),
            mod: 1,
            notes: null,
            productId: '1',
          },
          {
            id: '2',
            stage: 'avaliacao_cor' as ProductStage,
            startTime: new Date(),
            endTime: null,
            mod: 2,
            notes: null,
            productId: '1',
          },
        ],
      };

      mockPrisma.product.findUnique
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(mockUpdatedProduct);

      mockPrisma.stageHistory.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.stageHistory.create.mockResolvedValue({
        id: '2',
        stage: 'avaliacao_cor',
        startTime: new Date(),
        endTime: null,
        mod: 2,
        notes: null,
        productId: '1',
      });
      mockPrisma.product.update.mockResolvedValue(mockUpdatedProduct);

      const result = await ProductService.advanceStage('1', 'avaliacao_cor', 2);

      expect(result).toBeDefined();
      expect(result?.currentStage).toBe('avaliacao_cor');
      expect(mockPrisma.stageHistory.updateMany).toHaveBeenCalled();
      expect(mockPrisma.stageHistory.create).toHaveBeenCalled();
      expect(mockPrisma.product.update).toHaveBeenCalled();
    });

    it('should return null if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const result = await ProductService.advanceStage('999', 'avaliacao_cor', 2);

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const mockProducts = [
        { id: '1', status: 'in_progress' },
        { id: '2', status: 'completed' },
        { id: '3', status: 'paused' },
        { id: '4', status: 'blocked' },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await ProductService.getStats();

      expect(result).toEqual({
        total: 4,
        inProgress: 1,
        paused: 1,
        completed: 1,
        blocked: 1,
      });
    });

    it('should return empty stats on error', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('Database error'));

      const result = await ProductService.getStats();

      expect(result).toEqual({
        total: 0,
        inProgress: 0,
        paused: 0,
        completed: 0,
        blocked: 0,
      });
    });
  });
});
