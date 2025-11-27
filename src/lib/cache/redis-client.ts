/**
 * Cliente Redis para cache distribuído
 * Melhora performance reduzindo queries ao banco
 */

import { createClient } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

let redis: ReturnType<typeof createClient>

if (!globalForRedis.redis) {
  redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  })

  redis.on('error', (err) => {
    console.error('Redis Client Error', err)
  })

  redis.on('connect', () => {
    console.log('✅ Redis connected')
  })

  redis.on('disconnect', () => {
    console.warn('⚠️ Redis disconnected')
  })

  // Conectar ao iniciar
  redis.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err)
  })

  globalForRedis.redis = redis
} else {
  redis = globalForRedis.redis
}

export { redis }

/**
 * Funções auxiliares para cache
 */

export const cacheKeys = {
  products: (id?: string) => id ? `product:${id}` : 'products:all',
  semiFinished: (id?: string) => id ? `semi-finished:${id}` : 'semi-finished:all',
  stats: 'stats:all',
  hourlyControls: (date: string) => `hourly-controls:${date}`,
  operators: 'operators:all',
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error)
    return null
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = 3600 // 1 hora por padrão
): Promise<void> {
  try {
    await redis.setEx(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error)
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  } catch (error) {
    console.error(`Cache invalidate pattern error for ${pattern}:`, error)
  }
}
