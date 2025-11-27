/**
 * GET /api/audit/events
 * 
 * Retorna histórico de eventos de auditoria
 * Suporta filtros por productId, eventType, userId, data
 */

import { NextRequest, NextResponse } from 'next/server'
import { eventLog } from '@/lib/event-log'
import { logger, createRequestContext } from '@/lib/logger'
import { withMetrics } from '@/lib/api-metrics-wrapper'

const getHandler = async (request?: NextRequest) => {
  const startTime = Date.now()

  try {
    logger.apiRequest('GET', '/api/audit/events')

    if (!request) {
      return NextResponse.json({
        success: false,
        error: 'Request inválido'
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    
    // Extrair filtros
    const productId = searchParams.get('productId') || undefined
    const eventType = (searchParams.get('eventType') as any) || undefined
    const userId = searchParams.get('userId') || undefined
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Buscar eventos
    const events = eventLog.search({
      productId,
      eventType,
      userId,
      limit,
      offset
    })

    // Obter estatísticas
    const stats = eventLog.getStats()

    logger.apiSuccess('GET', '/api/audit/events', {
      ...createRequestContext(startTime),
      eventCount: events.length,
      totalEvents: stats.totalEvents
    })

    return NextResponse.json({
      success: true,
      data: {
        events,
        stats,
        filters: {
          productId,
          eventType,
          userId,
          limit,
          offset
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.apiError('GET', '/api/audit/events', error as Error, {
      ...createRequestContext(startTime)
    })

    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar eventos de auditoria',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export const GET = withMetrics('GET', '/api/audit/events', getHandler)
