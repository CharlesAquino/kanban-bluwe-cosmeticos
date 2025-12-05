import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'
import { apiLog, apiError } from '@/lib/api-logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    apiLog('=== API PAUSE: Pausando produto ===', { productId: id })

    // Pausar produto
    const product = await ProductService.pauseProduction(id)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    apiLog('✅ Produto pausado', { productId: product.id, status: product.status })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    apiError('=== API PAUSE: ERRO ===', error)

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
