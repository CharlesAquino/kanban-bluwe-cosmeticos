/**
 * Product Service - Refatorado com Drizzle + Redis Cache
 * Substitui o ProductService antigo que usava Prisma
 */

import { productQueries } from '@/lib/db/queries/products'
import { CacheService } from './cache-service'
import type { ProductStage, ProductStatus } from '@/lib/db/schema'

export class ProductService {
  /**
   * Criar novo produto
   */
  static async createProduct(data: {
    name: string
    op: string
    batch: string
    quantity: number
    createdById: string
  }) {
    const product = await productQueries.create(data)

    // Invalidar cache
    await CacheService.invalidateProductsCache()
    await CacheService.invalidateStatsCache()

    return product
  }

  /**
   * Buscar todos os produtos (com cache)
   */
  static async getAllProducts() {
    // Tentar cache primeiro
    const cached = await CacheService.getProductsCache()
    if (cached) {
      return cached
    }

    // Se não estiver em cache, buscar do banco
    const products = await productQueries.getAll()

    // Salvar em cache
    await CacheService.setProductsCache(products)

    return products
  }

  /**
   * Buscar todos os produtos sem mocks (com cache)
   */
  static async getAllProductsWithoutMocks() {
    // Tentar cache primeiro
    const cached = await CacheService.getProductsCache()
    if (cached) {
      return cached
    }

    // Se não estiver em cache, buscar do banco
    const products = await productQueries.getAllWithoutMocks()

    // Salvar em cache
    await CacheService.setProductsCache(products)

    return products
  }

  /**
   * Buscar produto por ID (com cache)
   */
  static async getProductById(id: string) {
    // Tentar cache primeiro
    const cached = await CacheService.getProductCache(id)
    if (cached) {
      return cached
    }

    // Se não estiver em cache, buscar do banco
    const product = await productQueries.getById(id)

    if (product) {
      // Salvar em cache
      await CacheService.setProductCache(id, product)
    }

    return product
  }

  /**
   * Buscar produtos por estágio
   */
  static async getProductsByStage(stage: ProductStage) {
    return await productQueries.getByStage(stage)
  }

  /**
   * Buscar produtos por status
   */
  static async getProductsByStatus(status: ProductStatus) {
    return await productQueries.getByStatus(status)
  }

  /**
   * Avançar para próximo estágio
   */
  static async advanceStage(
    productId: string,
    nextStage: ProductStage,
    mod: number
  ) {
    const product = await productQueries.updateStage(productId, nextStage, mod)

    // Invalidar cache
    await CacheService.invalidateProductCache(productId)
    await CacheService.invalidateProductsCache()
    await CacheService.invalidateStatsCache()

    return product
  }

  /**
   * Pausar produção
   */
  static async pauseProduction(productId: string) {
    const product = await productQueries.pause(productId)

    // Invalidar cache
    await CacheService.invalidateProductCache(productId)
    await CacheService.invalidateProductsCache()
    await CacheService.invalidateStatsCache()

    return product
  }

  /**
   * Retomar produção
   */
  static async resumeProduction(productId: string) {
    const product = await productQueries.resume(productId)

    // Invalidar cache
    await CacheService.invalidateProductCache(productId)
    await CacheService.invalidateProductsCache()
    await CacheService.invalidateStatsCache()

    return product
  }

  /**
   * Bloquear produção
   */
  static async blockProduction(productId: string, reason: string) {
    const product = await productQueries.block(productId, reason)

    // Invalidar cache
    await CacheService.invalidateProductCache(productId)
    await CacheService.invalidateProductsCache()
    await CacheService.invalidateStatsCache()

    return product
  }

  /**
   * Deletar produto
   */
  static async deleteProduct(productId: string) {
    const success = await productQueries.delete(productId)

    if (success) {
      // Invalidar cache
      await CacheService.invalidateProductCache(productId)
      await CacheService.invalidateProductsCache()
      await CacheService.invalidateStatsCache()
    }

    return success
  }

  /**
   * Buscar histórico de estágios
   */
  static async getStageHistory(productId: string) {
    return await productQueries.getStageHistory(productId)
  }

  /**
   * Calcular estatísticas (com cache)
   */
  static async getStats() {
    // Tentar cache primeiro
    const cached = await CacheService.getStatsCache()
    if (cached) {
      return cached
    }

    // Se não estiver em cache, calcular
    const stats = await productQueries.getStats()

    // Salvar em cache
    await CacheService.setStatsCache(stats)

    return stats
  }
}
