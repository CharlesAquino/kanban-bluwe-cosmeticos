import { NextRequest, NextResponse } from 'next/server'
import { semiFinishedQueries } from '@/lib/db/queries/semi-finished'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { bucketIds } = (await request.json().catch(() => ({
      bucketIds: [],
    }))) as { bucketIds: string[] }

    if (!Array.isArray(bucketIds) || bucketIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'bucketIds é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar status dos baldes para 'quarantine'
    let updatedCount = 0
    for (const bucketId of bucketIds) {
      const updated = await semiFinishedQueries.updateBucketStatus(
        bucketId,
        'quarantine'
      )
      if (updated) updatedCount++
    }

    if (updatedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Nenhum balde encontrado ou baldes não estão com status "packaged"',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount,
        bucketIds,
      },
    })
  } catch (error) {
    console.error('Erro ao enviar baldes para quarentena:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}
