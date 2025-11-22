import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

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
      return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 })
    }

    const stage = String(product.currentStage).toUpperCase()
    if (stage !== 'APROVADO' && stage !== 'FINALIZADO') {
      return NextResponse.json(
        { success: false, error: 'Produto ainda não está no estágio Aprovado' },
        { status: 400 },
      )
    }

    // Verificar se já existe Semi-Acabado com mesma OP + Lote
    const existingSfi = await prisma.semiFinishedItems.findFirst({
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
      const created = await tx.semiFinishedItems.create({
        data: {
          productId: product.id,
          name: product.name,
          family: 'Sem Família',
          op: product.op,
          batch: product.batch,
          quantityTotal: product.quantity,
          // quantityEnvasado permanece 0 por padrão
          status: 'aguardando',
        },
      })

      // Remover produto da tabela de produção (equivalente ao DELETE no SQLite)
      await tx.product.delete({
        where: { id: product.id },
      })

      return created
    })

    console.log('Semi-acabado criado:', semiFinished)

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
