/**
 * GET /api/monitoring/stats
 * 
 * Retorna estatísticas de performance das APIs
 * Útil para dashboards de observabilidade
 */

import { NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/metrics'
import { logger, createRequestContext } from '@/lib/logger'

export async function GET() {
  const startTime = Date.now()

  try {
    logger.apiRequest('GET', '/api/monitoring/stats')

    // Obter todas as estatísticas
    const stats = metricsCollector.getAllStats()

    // Obter alertas
    const alerts = metricsCollector.checkAlerts()

    logger.apiSuccess('GET', '/api/monitoring/stats', {
      ...createRequestContext(startTime),
      endpointCount: stats.length,
      alertCount: alerts.length
    })

    return NextResponse.json({
      success: true,
      data: {
        stats,
        alerts,
        summary: {
          totalEndpoints: stats.length,
          totalAlerts: alerts.length,
          criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
          warningAlerts: alerts.filter(a => a.severity === 'warning').length
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.apiError('GET', '/api/monitoring/stats', error as Error, {
      ...createRequestContext(startTime)
    })

    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar estatísticas de monitoramento',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
