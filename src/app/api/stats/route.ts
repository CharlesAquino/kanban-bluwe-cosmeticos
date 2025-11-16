import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== API STATS: Calculando estatísticas com Prisma ===')

    // Buscar produtos do banco com Prisma
    const products = await prisma.product.findMany()

    // Calcular estatísticas com normalização de tipos
    const stats = {
      total: products.length,
      inProgress: products.filter((p) => {
        const status = String(p.status).toUpperCase()
        const stage = String(p.currentStage).toUpperCase()
        return status === 'ACTIVE' && stage !== 'BACKLOG' && stage !== 'APROVADO'
      }).length,
      paused: products.filter((p) => String(p.status).toUpperCase() === 'PAUSED').length,
      completed: products.filter((p) => {
        const stage = String(p.currentStage).toUpperCase()
        return stage === 'APROVADO' || stage === 'REJEITADO'
      }).length,
      blocked: products.filter((p) => String(p.status).toUpperCase() === 'BLOCKED').length,
    }

    console.log('=== API STATS: Estatísticas calculadas:', stats)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('=== API STATS: ERRO ===')
    console.error('Erro ao calcular estatísticas:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
