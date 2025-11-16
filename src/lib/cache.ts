'use client'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    this.cache.set(key, item)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined
    
    if (!item) return null
    
    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Global cache instance
export const cache = new SimpleCache()

import React from 'react'

// React hook for caching
export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      // Try to get from cache first
      const cachedData = cache.get<T>(key)
      if (cachedData !== null) {
        setData(cachedData)
        return
      }

      // Fetch fresh data
      setLoading(true)
      setError(null)
      
      try {
        const freshData = await fetcher()
        cache.set(key, freshData, ttl)
        setData(freshData)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [key, fetcher, ttl])

  // Invalidate cache
  const invalidate = React.useCallback(() => {
    cache.delete(key)
    setData(null)
  }, [key])

  return { data, loading, error, invalidate }
}

// Cache utilities for API calls
export const cacheUtils = {
  // Cache wrapper for fetch
  async cachedFetch<T>(key: string, url: string, options?: RequestInit, ttl?: number): Promise<T> {
    const cached = cache.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    cache.set(key, data, ttl)
    return data
  },

  // Preload common data
  async preloadCommonData() {
    try {
      // Preload products
      await cacheUtils.cachedFetch('products', '/api/products', undefined, 2 * 60 * 1000)
      
      // Preload semi-finished
      await cacheUtils.cachedFetch('semi-finished', '/api/semi-finished', undefined, 2 * 60 * 1000)
      
      // Preload stats
      await cacheUtils.cachedFetch('stats', '/api/stats', undefined, 30 * 1000) // 30 seconds for stats
    } catch (error) {
      console.warn('Failed to preload common data:', error)
    }
  },

  // Clear all cache
  clearAll() {
    cache.clear()
  },

  // Get cache info
  getInfo() {
    return cache.getStats()
  }
}

// Auto cleanup expired items every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}
