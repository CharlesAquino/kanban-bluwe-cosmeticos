import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { containerIds, filledQuantity } = await request.json() as { 
      containerIds: string[]; 
      filledQuantity: number 
    }

    if (!Array.isArray(containerIds) || containerIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'containerIds é obrigatório' 
      }, { status: 400 })
    }

    if (!filledQuantity || filledQuantity <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'filledQuantity é obrigatório e deve ser maior que 0' 
      }, { status: 400 })
    }

    // Buscar o semi-acabado para atualizar quantityEnvasado
    const semiFinished = await prisma.semiFinishedItem.findUnique({
      where: { id: params.id },
    })

    if (!semiFinished) {
      return NextResponse.json({ 
        success: false, 
        error: 'Semi-acabado não encontrado' 
      }, { status: 404 })
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atualizar os recipientes para status 'quarantined' (envase direto para quarentena)
      const updatedContainers = await tx.packagingContainer.updateMany({
        where: {
          id: { in: containerIds },
          semiFinishedId: params.id,
          status: 'available' // Apenas recipientes disponíveis podem ser preenchidos
        },
        data: {
          currentQuantity: filledQuantity,
          status: 'quarantined', // Vai direto para quarentena após envase
          updatedAt: new Date()
        }
      })

      // 2. Atualizar o quantityEnvasado do semi-acabado
      const totalFilled = filledQuantity * containerIds.length
      const updatedItem = await tx.semiFinishedItem.update({
        where: { id: params.id },
        data: {
          quantityEnvasado: {
            increment: totalFilled / 1000 // Converter para kg
          },
          // Se não há mais saldo, mover para quarentena
          status: {
            set: 'QUARENTENA' // Muda status para não aparecer mais em semi-acabados
          },
          updatedAt: new Date()
        }
      })

      // 3. Calcular novo saldo
      const newSaldo = updatedItem.quantityTotal - updatedItem.quantityEnvasado

      return {
        containers: updatedContainers,
        item: updatedItem,
        newSaldo,
        totalFilled,
        filledQuantity,
        containerIds,
        autoQuarantined: true // Indica que foi para quarentena automaticamente
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        updatedCount: result.containers.count,
        newEnvasado: result.item.quantityEnvasado,
        newSaldo: result.newSaldo,
        totalFilled: result.totalFilled,
        filledQuantity: result.filledQuantity,
        containerIds,
        autoQuarantined: result.autoQuarantined
      }
    })
  } catch (error) {
    console.error('Erro ao preencher recipientes:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
