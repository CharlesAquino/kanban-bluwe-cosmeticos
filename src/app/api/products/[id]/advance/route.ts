import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { nextStage, mod } = body

    const ALLOWED_STAGES = new Set([
      'BACKLOG',
      'PRODUCAO_1KG',
      'AVALIACAO_COR',
      'PRODUCAO_5KG',
      'AVALIACAO_FINAL',
      'APROVADO',
      'REJEITADO',
    ])

    if (
      typeof nextStage !== 'string' ||
      !ALLOWED_STAGES.has(String(nextStage).toUpperCase()) ||
      (mod !== 1 && mod !== -1)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Parâmetros inválidos: 'nextStage' deve ser um estágio válido e 'mod' deve ser 1 ou -1",
        },
        { status: 400 }
      )
    }

    const normalizedStage = String(nextStage).toUpperCase() as any

    const product = await ProductService.advanceStage(id, normalizedStage, mod)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produto não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
