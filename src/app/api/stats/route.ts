import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== API STATS: Calculando estatísticas com Prisma ===')

    // Buscar produtos do banco com Prisma
    const products = await prisma.product.findMany()

    // Calcular estatísticas
    const stats = {
      total: products.length,
      inProgress: products.filter((p) => p.status === 'ACTIVE' && p.currentStage !== 'BACKLOG' && p.currentStage !== 'APROVADO').length,
      paused: products.filter((p) => p.status === 'PAUSED').length,
      completed: products.filter((p) => p.currentStage === 'APROVADO' || p.currentStage === 'REJEITADO').length,
      blocked: products.filter((p) => p.status === 'BLOCKED').length,
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
