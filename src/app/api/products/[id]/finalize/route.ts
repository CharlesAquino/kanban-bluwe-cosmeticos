import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'
import { semiFinishedQueries } from '@/lib/db/queries/semi-finished'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API FINALIZE: Finalizando produto ===')
    console.log('Produto ID:', id)

    // Buscar produto
    const product = await ProductService.getProductById(id)

    if (!product) {
      console.error('❌ Produto não encontrado:', id)
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    console.log('📋 Produto encontrado:', {
      id: product.id,
      name: product.name,
      currentStage: product.currentStage,
      status: product.status,
    })

    const stage = String(product.currentStage).toUpperCase()
    if (stage !== 'APROVADO' && stage !== 'FINALIZADO') {
      console.error('❌ Produto não está em estágio aprovado:', stage)
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

    console.log('✅ Semi-acabado criado:', semiFinished)

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
    console.error('=== API FINALIZE: ERRO ===')
    console.error('Erro ao finalizar produto:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}
