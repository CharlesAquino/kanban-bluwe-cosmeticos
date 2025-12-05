import { NextRequest, NextResponse } from 'next/server'
import { checkAvailableProviders } from '@/lib/ai-client'
import { getDbInfo } from '@/lib/db-unified'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    services: {
        database: ServiceStatus
        ai: ServiceStatus
        integrations: {
            slack: ServiceStatus
            github: ServiceStatus
        }
    }
    metadata?: {
        environment: string
        version: string
    }
}

interface ServiceStatus {
    available: boolean
    provider?: string
    message?: string
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        // Check AI Providers
        const aiProviders = await checkAvailableProviders()
        const aiStatus: ServiceStatus = {
            available: aiProviders.length > 0,
            provider: aiProviders.join(', ') || 'none',
            message: aiProviders.length > 0
                ? `${aiProviders.length} provider(s) configured`
                : 'No AI providers configured'
        }

        // Check Database
        const dbInfo = getDbInfo()
        const dbStatus: ServiceStatus = {
            available: true, // Se chegou aqui, DB está ok
            provider: dbInfo.type,
            message: dbInfo.message
        }

        // Check Integrations
        const slackStatus: ServiceStatus = {
            available: !!process.env.SLACK_WEBHOOK_URL,
            message: process.env.SLACK_WEBHOOK_URL
                ? 'Webhook configured'
                : 'Not configured (optional)'
        }

        const githubStatus: ServiceStatus = {
            available: !!process.env.GITHUB_TOKEN,
            message: process.env.GITHUB_TOKEN
                ? 'Token configured'
                : 'Not configured (optional)'
        }

        // Determine overall health
        const criticalServicesHealthy = dbStatus.available && aiStatus.available
        const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
            criticalServicesHealthy ? 'healthy' :
                dbStatus.available ? 'degraded' :
                    'unhealthy'

        const health: HealthStatus = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                ai: aiStatus,
                integrations: {
                    slack: slackStatus,
                    github: githubStatus
                }
            },
            metadata: {
                environment: process.env.NODE_ENV || 'development',
                version: '2.0.0'
            }
        }

        const duration = Date.now() - startTime

        // Return appropriate status code
        const statusCode =
            overallStatus === 'healthy' ? 200 :
                overallStatus === 'degraded' ? 200 : // Still operational
                    503 // Service unavailable

        return NextResponse.json({
            ...health,
            responseTime: `${duration}ms`
        }, { status: statusCode })

    } catch (error) {
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: `${Date.now() - startTime}ms`
        }, { status: 503 })
    }
}
