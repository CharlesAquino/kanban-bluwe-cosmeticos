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
    const { reason } = body

    console.log('=== API BLOCK: Bloqueando produto ===')
    console.log('Dados recebidos:', { id, reason })

    if (typeof reason !== 'string' || reason.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Parâmetro inválido: 'reason' deve ser uma string com pelo menos 3 caracteres",
        },
        { status: 400 }
      )
    }

    // Bloquear produto
    const product = await ProductService.blockProduction(id, reason)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Produto bloqueado:', product)

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('=== API BLOCK: ERRO ===')
    console.error('Erro ao bloquear produto:', error)

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
