import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENV } from '@/lib/environment'
import { logger, createRequestContext } from '@/lib/logger'
import { withMetrics } from '@/lib/api-metrics-wrapper'

const getHandler = async () => {
  const startTime = Date.now()
  
  try {
    logger.apiRequest('GET', '/api/stats')

    // Buscar todos os produtos para calcular estatísticas
    const products = await prisma.product.findMany({
      select: {
        id: true,
        status: true,
        currentStage: true
      }
    })

    // Calcular estatísticas baseadas nos dados reais
    const stats = {
      total: products.length,
      inProgress: products.filter(p => {
        const status = String(p.status).toUpperCase()
        const stage = String(p.currentStage).toUpperCase()
        return status === 'ACTIVE' && 
               stage !== 'BACKLOG' && 
               stage !== 'APROVADO'
      }).length,
      paused: products.filter(p => 
        String(p.status).toUpperCase() === 'PAUSED'
      ).length,
      completed: products.filter(p => {
        const stage = String(p.currentStage).toUpperCase()
        return stage === 'APROVADO' || stage === 'REJEITADO'
      }).length,
      blocked: products.filter(p => 
        String(p.status).toUpperCase() === 'BLOCKED'
      ).length,
    }

    logger.apiSuccess('GET', '/api/stats', {
      ...createRequestContext(startTime),
      ...stats
    })

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.apiError('GET', '/api/stats', error as Error, {
      ...createRequestContext(startTime),
      env: process.env.NODE_ENV,
      dbConfigured: !!ENV.databaseUrl
    })

    return NextResponse.json({
      success: false,
      error: 'Erro ao calcular estatísticas',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      hint: !ENV.databaseUrl ? 'DATABASE_URL não configurada' : undefined
    }, { status: 500 })
  }
}

export const GET = withMetrics('GET', '/api/stats', getHandler)
