import { NextResponse } from 'next/server'
import { CacheService } from '@/lib/services/cache-service'
import { redis } from '@/lib/cache/redis-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = CacheService.getStats()
    
    // Testar conexão Redis
    let redisTest = 'not connected'
    if (redis.isOpen) {
      try {
        await redis.ping()
        redisTest = 'connected and responding'
      } catch (error) {
        redisTest = `connected but error: ${error}`
      }
    }
    
    return NextResponse.json({
      ...stats,
      redisTest,
      redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
