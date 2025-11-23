import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Buscar produto no PostgreSQL via Prisma
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      console.error('❌ Produto não encontrado:', id)
      return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 })
    }

    console.log('📋 Produto encontrado:', { 
      id: product.id, 
      name: product.name, 
      currentStage: product.currentStage,
      status: product.status 
    })

    const stage = String(product.currentStage).toUpperCase()
    if (stage !== 'APROVADO' && stage !== 'FINALIZADO') {
      console.error('❌ Produto não está em estágio aprovado:', stage)
      return NextResponse.json(
        { success: false, error: `Produto ainda não está no estágio Aprovado. Estágio atual: ${stage}` },
        { status: 400 },
      )
    }

    // Verificar se já existe Semi-Acabado com mesma OP + Lote
    const existingSfi = await prisma.semiFinishedItem.findFirst({
      where: {
        op: product.op,
        batch: product.batch,
      },
    })

    if (existingSfi) {
      return NextResponse.json(
        { success: false, error: 'Já existe um produto de Semi-Acabados com esta OP e lote.' },
        { status: 400 },
      )
    }

    // Criar item de semi-acabado e remover produto do kanban de produção
    const semiFinished = await prisma.$transaction(async (tx) => {
      const created = await tx.semiFinishedItem.create({
        data: {
          productId: product.id,
          name: product.name,
          family: 'Sem Família',
          op: product.op,
          batch: product.batch,
          quantityTotal: product.quantity,
          // quantityEnvasado permanece 0 por padrão
          status: 'AGUARDANDO',
          manufacturingDate: product.manufacturingDate || new Date(),
        },
      })

      // Remover produto da tabela de produção (equivalente ao DELETE no SQLite)
      await tx.product.delete({
        where: { id: product.id },
      })

      return created
    })

    console.log('Semi-acabado criado:', semiFinished)

    // TODO: Reintegrar evento neural após resolver erro 500
    // await dispatchProductFinalized({...})

    return NextResponse.json({ success: true, data: semiFinished }, { status: 201 })
  } catch (error) {
    console.error('=== API FINALIZE: ERRO ===')
    console.error('Erro ao finalizar produto:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}
