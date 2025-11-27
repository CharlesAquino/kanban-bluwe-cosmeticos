import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENV } from '@/lib/environment'
import { logger, createRequestContext } from '@/lib/logger'
import { withMetrics } from '@/lib/api-metrics-wrapper'

// GET /api/semi-finished - Lista itens de semi-acabados
const getHandler = async () => {
  const startTime = Date.now()
  
  try {
    logger.apiRequest('GET', '/api/semi-finished')

    // Buscar itens reais via Prisma
    const items = await prisma.semiFinishedItem.findMany({
      where: {
        status: {
          not: 'QUARENTENA' // Excluir itens em quarentena
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transformar camelCase para snake_case (compatibilidade frontend)
    const transformedItems = items.map(item => ({
      ...item,
      quantity_total: item.quantityTotal,
      quantity_envasado: item.quantityEnvasado,
      manufacturingDate: item.manufacturingDate,
      created_at: item.createdAt,
      updated_at: item.updatedAt
    }))

    logger.apiSuccess('GET', '/api/semi-finished', {
      ...createRequestContext(startTime),
      count: transformedItems.length
    })

    return NextResponse.json({
      success: true,
      data: transformedItems,
      meta: {
        count: transformedItems.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.apiError('GET', '/api/semi-finished', error as Error, {
      ...createRequestContext(startTime),
      dbConfigured: !!ENV.databaseUrl
    })

    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar itens de semi-acabados',
      details: message,
      hint: !ENV.databaseUrl ? 'DATABASE_URL não configurada' : undefined
    }, { status: 500 })
  }
}

export const GET = withMetrics('GET', '/api/semi-finished', getHandler)
