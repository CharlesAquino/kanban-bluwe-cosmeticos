import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'
import { semiFinishedQueries } from '@/lib/db/queries/semi-finished'
import { apiLog, apiError } from '@/lib/api-logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    apiLog('=== API FINALIZE: Finalizando produto ===', { productId: id })

    // Buscar produto
    const product = await ProductService.getProductById(id)

    if (!product) {
      apiError('❌ Produto não encontrado', undefined, { productId: id })
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    apiLog('📋 Produto encontrado', {
      id: product.id,
      name: product.name,
      currentStage: product.currentStage,
      status: product.status,
    })

    const stage = String(product.currentStage).toUpperCase()
    if (stage !== 'APROVADO' && stage !== 'FINALIZADO') {
      apiError('❌ Produto não está em estágio aprovado', undefined, { stage, productId: id })
      return NextResponse.json(
        {
          success: false,
          error: `Produto ainda não está no estágio Aprovado. Estágio atual: ${stage}`,
        },
        { status: 400 }
      )
    }

    // Verificar se já existe Semi-Acabado com mesma OP + Lote
    const existingSfi = await semiFinishedQueries.getAll()
    const duplicate = existingSfi.find(
      (item) => item.op === product.op && item.batch === product.batch
    )

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Já existe um produto de Semi-Acabados com esta OP e lote.',
        },
        { status: 400 }
      )
    }

    // Criar item de semi-acabado
    const semiFinished = await semiFinishedQueries.create({
      productId: product.id,
      name: product.name,
      family: 'Sem Família',
      op: product.op,
      batch: product.batch,
      quantityTotal: product.quantity,
      createdById: product.createdById,
    })

    apiLog('✅ Semi-acabado criado', { semiFinishedId: semiFinished.id, op: semiFinished.op, batch: semiFinished.batch })

    // Atualizar produto para status COMPLETED e estágio FINALIZADO
    await ProductService.updateProduct(id, {
      status: 'COMPLETED' as any,
      currentStage: 'FINALIZADO' as any,
    })

    return NextResponse.json(
      { success: true, data: semiFinished },
      { status: 201 }
    )
  } catch (error) {
    apiError('=== API FINALIZE: ERRO ===', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}
