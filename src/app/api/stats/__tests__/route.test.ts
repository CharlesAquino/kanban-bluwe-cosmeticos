/**
 * @jest-environment node
 */

import { GET } from '@/app/api/stats/route';
import { ProductService } from '@/lib/product-service';

// Mock do ProductService
jest.mock('@/lib/product-service', () => ({
  ProductService: {
    getStats: jest.fn(),
  },
}));

const mockProductService = jest.mocked(ProductService);

describe('/api/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return statistics successfully', async () => {
    const mockStats = {
      total: 25,
      inProgress: 10,
      paused: 3,
      completed: 8,
      blocked: 4,
    };

    mockProductService.getStats.mockResolvedValue(mockStats);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockStats);

    expect(mockProductService.getStats).toHaveBeenCalledTimes(1);
  });

  it('should handle service errors', async () => {
    mockProductService.getStats.mockRejectedValue(new Error('Service unavailable'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Erro interno do servidor');
  });

  it('should return empty stats on service error', async () => {
    mockProductService.getStats.mockRejectedValue(new Error('Database connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);

    // Should still return empty stats even on error
    expect(data.error).toBe('Erro interno do servidor');
  });
});
