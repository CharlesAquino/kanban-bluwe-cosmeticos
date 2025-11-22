import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { bucketId: string } }) {
  try {
    const body = await request.json().catch(() => ({})) as { deltaKg?: number; notes?: string }
    const delta = Number(body.deltaKg)
    if (!Number.isFinite(delta) || delta <= 0) {
      return NextResponse.json({ success: false, error: 'deltaKg inválido' }, { status: 400 })
    }

    // Buscar o balde com Prisma
    const bucket = await prisma.semiFinishedBucket.findUnique({
      where: { id: params.bucketId },
      include: { semiFinished: true }
    })

    if (!bucket) {
      return NextResponse.json({ success: false, error: 'Balde não encontrado' }, { status: 404 })
    }

    if (delta > bucket.currentQuantityKg) {
      return NextResponse.json({ success: false, error: 'Quantidade excede o saldo do balde' }, { status: 400 })
    }

    const newQty = Number((bucket.currentQuantityKg - delta).toFixed(3))
    const status = newQty === 0 ? 'packaged' : 'partial'

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atualizar o balde
      const updatedBucket = await tx.semiFinishedBucket.update({
        where: { id: params.bucketId },
        data: {
          currentQuantityKg: newQty,
          status,
          updatedAt: new Date()
        }
      })

      // 2. Atualizar o quantityEnvasado do semi-acabado (regra de contabilização)
      const updatedItem = await tx.semiFinishedItem.update({
        where: { id: bucket.semiFinishedId },
        data: {
          quantityEnvasado: {
            increment: delta
          },
          updatedAt: new Date()
        }
      })

      // 3. Calcular novo saldo
      const newSaldo = updatedItem.quantityTotal - updatedItem.quantityEnvasado

      return {
        bucket: updatedBucket,
        item: updatedItem,
        newSaldo,
        deltaKg: delta
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        newQty: result.bucket.currentQuantityKg, 
        status: result.bucket.status,
        newEnvasado: result.item.quantityEnvasado,
        newSaldo: result.newSaldo,
        deltaKg: result.deltaKg
      }
    })
  } catch (error) {
    console.error('Erro ao envasar balde:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}
