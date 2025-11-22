import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { bucketIds } = await request.json().catch(() => ({ bucketIds: [] })) as { bucketIds: string[] }
    if (!Array.isArray(bucketIds) || bucketIds.length === 0) {
      return NextResponse.json({ success: false, error: 'bucketIds é obrigatório' }, { status: 400 })
    }

    // Atualizar status dos baldes para 'quarantine'
    const result = await prisma.semiFinishedBucket.updateMany({
      where: {
        id: { in: bucketIds },
        semiFinishedId: params.id,
        status: 'packaged' // Apenas baldes já envasados podem ir para quarentena
      },
      data: {
        status: 'quarantine',
        updatedAt: new Date()
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum balde encontrado ou baldes não estão com status "packaged"' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        updatedCount: result.count,
        bucketIds 
      }
    })
  } catch (error) {
    console.error('Erro ao enviar baldes para quarentena:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
