/**
 * Cache Service - Gerencia cache Redis
 * Centraliza lógica de cache para toda a aplicação
 */

import {
  getCache,
  setCache,
  deleteCache,
  invalidatePattern,
  cacheKeys,
} from '@/lib/cache/redis-client'

export class CacheService {
  /**
   * Cache de produtos
   */
  static async getProductsCache() {
    return await getCache(cacheKeys.products())
  }

  static async setProductsCache(data: any) {
    await setCache(cacheKeys.products(), data, 300) // 5 minutos
  }

  static async invalidateProductsCache() {
    await deleteCache(cacheKeys.products())
    await invalidatePattern('product:*')
  }

  /**
   * Cache de produto individual
   */
  static async getProductCache(id: string) {
    return await getCache(cacheKeys.products(id))
  }

  static async setProductCache(id: string, data: any) {
    await setCache(cacheKeys.products(id), data, 600) // 10 minutos
  }

  static async invalidateProductCache(id: string) {
    await deleteCache(cacheKeys.products(id))
  }

  /**
   * Cache de semi-acabados
   */
  static async getSemiFinishedCache() {
    return await getCache(cacheKeys.semiFinished())
  }

  static async setSemiFinishedCache(data: any) {
    await setCache(cacheKeys.semiFinished(), data, 300) // 5 minutos
  }

  static async invalidateSemiFinishedCache() {
    await deleteCache(cacheKeys.semiFinished())
    await invalidatePattern('semi-finished:*')
  }

  /**
   * Cache de semi-acabado individual
   */
  static async getSemiFinishedItemCache(id: string) {
    return await getCache(cacheKeys.semiFinished(id))
  }

  static async setSemiFinishedItemCache(id: string, data: any) {
    await setCache(cacheKeys.semiFinished(id), data, 600) // 10 minutos
  }

  static async invalidateSemiFinishedItemCache(id: string) {
    await deleteCache(cacheKeys.semiFinished(id))
  }

  /**
   * Cache de estatísticas
   */
  static async getStatsCache() {
    return await getCache(cacheKeys.stats)
  }

  static async setStatsCache(data: any) {
    await setCache(cacheKeys.stats, data, 600) // 10 minutos
  }

  static async invalidateStatsCache() {
    await deleteCache(cacheKeys.stats)
  }

  /**
   * Cache de controles hora a hora
   */
  static async getHourlyControlsCache(date: string) {
    return await getCache(cacheKeys.hourlyControls(date))
  }

  static async setHourlyControlsCache(date: string, data: any) {
    await setCache(cacheKeys.hourlyControls(date), data, 1800) // 30 minutos
  }

  static async invalidateHourlyControlsCache(date: string) {
    await deleteCache(cacheKeys.hourlyControls(date))
  }

  /**
   * Cache de operadores
   */
  static async getOperatorsCache() {
    return await getCache(cacheKeys.operators)
  }

  static async setOperatorsCache(data: any) {
    await setCache(cacheKeys.operators, data, 3600) // 1 hora
  }

  static async invalidateOperatorsCache() {
    await deleteCache(cacheKeys.operators)
  }

  /**
   * Invalidar todo o cache
   */
  static async invalidateAll() {
    await invalidatePattern('*')
  }
}
