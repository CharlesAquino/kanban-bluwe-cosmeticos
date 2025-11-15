import { IntegrationService } from '@/lib/integration-service';
import { prisma } from '@/lib/prisma';
import type { ProductStage, Shift, EfficiencyStatus, ProductStatus } from '@/lib/types';

// O mock do Prisma já está configurado no setup.ts
const mockPrisma = jest.mocked(prisma);

describe('IntegrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createHourlyControl', () => {
    it('should create hourly control successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Produto Teste',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
        currentStage: 'producao_1kg' as ProductStage,
        status: 'in_progress' as ProductStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        stagesHistory: [],
        hourlyControls: [],
      };

      const mockHourlyControl = {
        id: '1',
        productId: '1',
        productName: 'Produto Teste',
        stage: 'producao_1kg' as ProductStage,
        operator: 'Operador 1',
        shift: 'morning' as Shift,
        targetQuantity: 10,
        actualQuantity: 9,
        efficiency: 90,
        status: 'on_track' as EfficiencyStatus,
        notes: null,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.hourlyControl.create.mockResolvedValue(mockHourlyControl);

      const result = await IntegrationService.createHourlyControl('1', 'producao_1kg', {
        operator: 'Operador 1',
        shift: 'morning',
        targetQuantity: 10,
        actualQuantity: 9,
        notes: 'Controle normal',
      });

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { hourlyControls: true },
      });

      expect(mockPrisma.hourlyControl.create).toHaveBeenCalledWith({
        data: {
          productId: '1',
          productName: 'Produto Teste',
          stage: 'producao_1kg',
          operator: 'Operador 1',
          shift: 'morning',
          targetQuantity: 10,
          actualQuantity: 9,
          efficiency: 90,
          status: 'on_track',
          notes: 'Controle normal',
          date: expect.any(Date),
        },
      });

      expect(result).toBeDefined();
      expect(result?.efficiency).toBe(90);
      expect(result?.status).toBe('on_track');
    });

    it('should calculate efficiency correctly for ahead status', async () => {
      const mockProduct = {
        id: '1',
        name: 'Produto Teste',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
        currentStage: 'producao_1kg' as ProductStage,
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
        stagesHistory: [],
        hourlyControls: [],
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.hourlyControl.create.mockResolvedValue({
        id: '1',
        productId: '1',
        productName: 'Produto Teste',
        stage: 'producao_1kg',
        operator: 'Operador 1',
        shift: 'morning',
        targetQuantity: 10,
        actualQuantity: 12, // Above target
        efficiency: 120,
        status: 'ahead' as EfficiencyStatus,
        notes: null,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await IntegrationService.createHourlyControl('1', 'producao_1kg', {
        operator: 'Operador 1',
        shift: 'morning',
        targetQuantity: 10,
        actualQuantity: 12,
      });

      expect(result?.efficiency).toBe(120);
      expect(result?.status).toBe('ahead');
    });

    it('should handle product not found error', async () => {
      // Configurar o mock para retornar null especificamente para este teste
      const originalMock = mockPrisma.product.findUnique;
      mockPrisma.product.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        IntegrationService.createHourlyControl('999', 'producao_1kg', {
          operator: 'Operador 1',
          shift: 'morning',
          targetQuantity: 10,
          actualQuantity: 9,
        })
      ).rejects.toThrow('Produto não encontrado');

      // Restaurar o mock original
      mockPrisma.product.findUnique = originalMock;
    });
  });

  describe('updateHourlyControl', () => {
    it('should update hourly control successfully', async () => {
      const mockExistingControl = {
        id: '1',
        productId: '1',
        productName: 'Produto Teste',
        stage: 'producao_1kg' as ProductStage,
        operator: 'Operador 1',
        shift: 'morning' as Shift,
        targetQuantity: 10,
        actualQuantity: 9,
        efficiency: 90,
        status: 'on_track',
        notes: 'Original note',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedControl = {
        ...mockExistingControl,
        actualQuantity: 8,
        efficiency: 80,
        status: 'behind' as EfficiencyStatus,
        notes: 'Updated note',
        updatedAt: new Date(),
      };

      mockPrisma.hourlyControl.findUnique.mockResolvedValue(mockExistingControl);
      mockPrisma.hourlyControl.update.mockResolvedValue(mockUpdatedControl);

      const result = await IntegrationService.updateHourlyControl('1', {
        actualQuantity: 8,
        notes: 'Updated note',
      });

      expect(mockPrisma.hourlyControl.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(mockPrisma.hourlyControl.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          actualQuantity: 8,
          efficiency: 80,
          status: 'behind',
          notes: 'Updated note',
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toBeDefined();
      expect(result?.actualQuantity).toBe(8);
      expect(result?.efficiency).toBe(80);
      expect(result?.status).toBe('behind');
    });

    it('should handle control not found error', async () => {
      mockPrisma.hourlyControl.findUnique.mockResolvedValue(null);

      await expect(
        IntegrationService.updateHourlyControl('999', {
          actualQuantity: 8,
        })
      ).rejects.toThrow('Controle hora a hora não encontrado');
    });
  });

  describe('getHourlyControlsByProduct', () => {
    it('should return hourly controls for a product', async () => {
      const mockControls = [
        {
          id: '1',
          productId: '1',
          productName: 'Produto Teste',
          stage: 'producao_1kg' as ProductStage,
          operator: 'Operador 1',
          shift: 'morning' as Shift,
          targetQuantity: 10,
          actualQuantity: 9,
          efficiency: 90,
          status: 'on_track',
          notes: null,
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.hourlyControl.findMany.mockResolvedValue(mockControls);

      const result = await IntegrationService.getHourlyControlsByProduct('1');

      expect(mockPrisma.hourlyControl.findMany).toHaveBeenCalledWith({
        where: { productId: '1' },
        orderBy: { date: 'desc' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('1');
    });
  });

  describe('getIntegratedStats', () => {
    it('should return integrated statistics', async () => {
      mockPrisma.product.count
        .mockResolvedValueOnce(10) // totalProducts
        .mockResolvedValueOnce(5); // productsInProgress

      mockPrisma.hourlyControl.count.mockResolvedValue(50);

      mockPrisma.hourlyControl.aggregate.mockResolvedValue({
        _avg: {
          efficiency: 85.5,
        },
        _count: { efficiency: 50 },
        _sum: { efficiency: 4275 },
        _min: { efficiency: 70 },
        _max: { efficiency: 100 },
      });

      const result = await IntegrationService.getIntegratedStats();

      expect(result).toEqual({
        totalProducts: 10,
        productsInProgress: 5,
        totalHourlyControls: 50,
        averageEfficiency: 86, // Math.round(85.5)
      });

      expect(mockPrisma.product.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.hourlyControl.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.hourlyControl.aggregate).toHaveBeenCalledTimes(1);
    });
  });
});
