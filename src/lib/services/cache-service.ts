/**
 * Cache Service - Gerencia cache híbrido (Redis + In-Memory)
 * Centraliza lógica de cache para toda a aplicação
 * Usa HybridCache para garantir performance mesmo se Redis falhar
 */

import { HybridCache, cacheKeys } from '@/lib/cache/hybrid-cache'

export class CacheService {
  /**
   * Cache de produtos
   */
  static async getProductsCache() {
    return await HybridCache.get(cacheKeys.products())
  }

  static async setProductsCache(data: any) {
    await HybridCache.set(cacheKeys.products(), data, 300) // 5 minutos
  }

  static async invalidateProductsCache() {
    await HybridCache.delete(cacheKeys.products())
    await HybridCache.invalidatePattern('product:*')
  }

  /**
   * Cache de produto individual
   */
  static async getProductCache(id: string) {
    return await HybridCache.get(cacheKeys.products(id))
  }

  static async setProductCache(id: string, data: any) {
    await HybridCache.set(cacheKeys.products(id), data, 600) // 10 minutos
  }

  static async invalidateProductCache(id: string) {
    await HybridCache.delete(cacheKeys.products(id))
  }

  /**
   * Cache de semi-acabados
   */
  static async getSemiFinishedCache() {
    return await HybridCache.get(cacheKeys.semiFinished())
  }

  static async setSemiFinishedCache(data: any) {
    await HybridCache.set(cacheKeys.semiFinished(), data, 300) // 5 minutos
  }

  static async invalidateSemiFinishedCache() {
    await HybridCache.delete(cacheKeys.semiFinished())
    await HybridCache.invalidatePattern('semi-finished:*')
  }

  /**
   * Cache de semi-acabado individual
   */
  static async getSemiFinishedItemCache(id: string) {
    return await HybridCache.get(cacheKeys.semiFinished(id))
  }

  static async setSemiFinishedItemCache(id: string, data: any) {
    await HybridCache.set(cacheKeys.semiFinished(id), data, 600) // 10 minutos
  }

  static async invalidateSemiFinishedItemCache(id: string) {
    await HybridCache.delete(cacheKeys.semiFinished(id))
  }

  /**
   * Cache de estatísticas
   */
  static async getStatsCache() {
    return await HybridCache.get(cacheKeys.stats)
  }

  static async setStatsCache(data: any) {
    await HybridCache.set(cacheKeys.stats, data, 600) // 10 minutos
  }

  static async invalidateStatsCache() {
    await HybridCache.delete(cacheKeys.stats)
  }

  /**
   * Cache de controles hora a hora
   */
  static async getHourlyControlsCache(date: string) {
    return await HybridCache.get(cacheKeys.hourlyControls(date))
  }

  static async setHourlyControlsCache(date: string, data: any) {
    await HybridCache.set(cacheKeys.hourlyControls(date), data, 1800) // 30 minutos
  }

  static async invalidateHourlyControlsCache(date: string) {
    await HybridCache.delete(cacheKeys.hourlyControls(date))
  }

  /**
   * Cache de operadores
   */
  static async getOperatorsCache() {
    return await HybridCache.get(cacheKeys.operators)
  }

  static async setOperatorsCache(data: any) {
    await HybridCache.set(cacheKeys.operators, data, 3600) // 1 hora
  }

  static async invalidateOperatorsCache() {
    await HybridCache.delete(cacheKeys.operators)
  }

  /**
   * Invalidar todo o cache
   */
  static async invalidateAll() {
    await HybridCache.invalidatePattern('*')
  }

  /**
   * Estatísticas do cache
   */
  static getStats() {
    return HybridCache.getStats()
  }
}
