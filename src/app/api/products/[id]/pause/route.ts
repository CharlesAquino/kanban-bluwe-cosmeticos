import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API PAUSE: Pausando produto ===')
    console.log('Produto ID:', id)

    // Pausar produto
    const product = await ProductService.pauseProduction(id)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Produto pausado:', product)

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('=== API PAUSE: ERRO ===')
    console.error('Erro ao pausar produto:', error)

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
