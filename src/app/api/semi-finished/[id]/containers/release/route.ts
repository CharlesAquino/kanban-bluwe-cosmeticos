import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { containerIds } = await request.json().catch(() => ({ containerIds: [] })) as { containerIds: string[] }
    if (!Array.isArray(containerIds) || containerIds.length === 0) {
      return NextResponse.json({ success: false, error: 'containerIds é obrigatório' }, { status: 400 })
    }

    // Atualizar status dos recipientes para 'released'
    const result = await prisma.packagingContainer.updateMany({
      where: {
        id: { in: containerIds },
        semiFinishedId: params.id,
        status: 'quarantined' // Apenas recipientes em quarentena podem ser liberados
      },
      data: {
        status: 'released',
        updatedAt: new Date()
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum recipiente encontrado ou recipientes não estão em quarentena' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        updatedCount: result.count,
        containerIds 
      }
    })
  } catch (error) {
    console.error('Erro ao liberar recipientes da quarentena:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
