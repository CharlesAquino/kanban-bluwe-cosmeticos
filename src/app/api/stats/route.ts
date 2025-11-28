import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/stats
// Retorna estatísticas agregadas usadas no dashboard (produtos em produção, finalizados, etc.)
export async function GET(_request: NextRequest) {
  try {
    const stats = await ProductService.getStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
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

// Demais métodos ainda não estão implementados com Drizzle
export async function POST() {
  return NextResponse.json(
    { error: 'Rota POST /api/stats ainda não implementada com Drizzle' },
    { status: 503 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Rota PATCH /api/stats ainda não implementada com Drizzle' },
    { status: 503 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Rota DELETE /api/stats ainda não implementada com Drizzle' },
    { status: 503 }
  )
}
