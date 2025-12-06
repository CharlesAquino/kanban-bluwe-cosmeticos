/**
 * Cache Híbrido - Redis + In-Memory
 * Usa Redis como primário e memória como fallback
 * Garante performance mesmo se Redis falhar
 */

import { redis } from './redis-client'

// Cache em memória como fallback
interface CacheEntry<T> {
  data: T
  expires: number
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Limpar cache expirado a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar se expirou
    if (entry.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 In-Memory cache cleanup: ${cleaned} entries removed`)
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Instância global do cache em memória
const memoryCache = new InMemoryCache()

/**
 * Cache Híbrido
 * Tenta Redis primeiro, fallback para memória
 */
export class HybridCache {
  /**
   * Buscar valor do cache
   * Tenta Redis primeiro, depois memória
   */
  static async get<T>(key: string): Promise<T | null> {
    // Tentar Redis primeiro
    if (redis.isOpen) {
      try {
        const cached = await redis.get(key)
        if (cached) {
          const data = JSON.parse(cached) as T
          // Atualizar memória também
          memoryCache.set(key, data, 300) // 5 minutos
          return data
        }
      } catch (error) {
        console.error(`❌ Redis get error for key ${key}:`, error)
      }
    }

    // Fallback para memória
    const memCached = memoryCache.get<T>(key)
    if (memCached) {
      console.log(`💾 Cache hit (memory): ${key}`)
      return memCached
    }

    return null
  }

  /**
   * Salvar valor no cache
   * Salva em Redis e memória simultaneamente
   */
  static async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    // Salvar em memória (sempre funciona)
    memoryCache.set(key, value, ttlSeconds)

    // Tentar salvar no Redis
    if (redis.isOpen) {
      try {
        await redis.setEx(key, ttlSeconds, JSON.stringify(value))
        console.log(`✅ Cache set (Redis + Memory): ${key}`)
      } catch (error) {
        console.error(`❌ Redis set error for key ${key}:`, error)
        console.log(`💾 Cache set (Memory only): ${key}`)
      }
    } else {
      console.log(`💾 Cache set (Memory only): ${key}`)
    }
  }

  /**
   * Deletar valor do cache
   */
  static async delete(key: string): Promise<void> {
    // Deletar da memória
    memoryCache.delete(key)

    // Tentar deletar do Redis
    if (redis.isOpen) {
      try {
        await redis.del(key)
      } catch (error) {
        console.error(`❌ Redis delete error for key ${key}:`, error)
      }
    }
  }

  /**
   * Invalidar padrão de chaves
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    // Invalidar na memória
    memoryCache.deletePattern(pattern)

    // Tentar invalidar no Redis
    if (redis.isOpen) {
      try {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(keys)
        }
      } catch (error) {
        console.error(`❌ Redis invalidate pattern error for ${pattern}:`, error)
      }
    }
  }

  /**
   * Limpar todo o cache
   */
  static async clear(): Promise<void> {
    memoryCache.clear()

    if (redis.isOpen) {
      try {
        await redis.flushDb()
      } catch (error) {
        console.error('❌ Redis clear error:', error)
      }
    }
  }

  /**
   * Estatísticas do cache
   */
  static getStats() {
    return {
      memorySize: memoryCache.size(),
      redisConnected: redis.isOpen,
    }
  }
}

// Exportar cache keys
export const cacheKeys = {
  products: (id?: string) => id ? `product:${id}` : 'products:all',
  semiFinished: (id?: string) => id ? `semi-finished:${id}` : 'semi-finished:all',
  stats: 'stats:all',
  hourlyControls: (date: string) => `hourly-controls:${date}`,
  operators: 'operators:all',
}

// Cleanup ao desligar
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    memoryCache.destroy()
  })
}
