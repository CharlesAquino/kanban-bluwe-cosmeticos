/**
 * API Route: GET/POST /api/monitoring/stats
 * Monitoramento de métricas do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { monitoringStatsQueries } from '@/lib/db/queries/monitoring-stats'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricName = searchParams.get('metricName')
    const category = searchParams.get('category')
    const aggregated = searchParams.get('aggregated') === 'true'

    let stats

    if (metricName && aggregated) {
      stats = await monitoringStatsQueries.getAggregatedStats(metricName)
    } else if (metricName) {
      stats = await monitoringStatsQueries.getByMetricName(metricName)
    } else if (category) {
      stats = await monitoringStatsQueries.getByCategory(category)
    } else {
      stats = []
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas de monitoramento:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar estatísticas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { metricName, metricValue, unit, category, tags } = body

    if (!metricName || metricValue === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'metricName e metricValue são obrigatórios',
        },
        { status: 400 }
      )
    }

    const success = await monitoringStatsQueries.recordMetric({
      metricName,
      metricValue: Number(metricValue),
      unit,
      category,
      tags,
    })

    if (!success) {
      throw new Error('Falha ao registrar métrica')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Métrica registrada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao registrar métrica:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao registrar métrica',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
