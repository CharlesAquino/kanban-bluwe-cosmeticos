import { NextRequest, NextResponse } from 'next/server'
import { semiFinishedQueries } from '@/lib/db/queries/semi-finished'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const semiFinishedId = params.id

    // Busca baldes existentes
    let buckets = await semiFinishedQueries.getBuckets(semiFinishedId)

    // Fallback: se não houver baldes, gerar a partir do item
    if (!buckets || buckets.length === 0) {
      const item = await semiFinishedQueries.getById(semiFinishedId)

      if (item) {
        const capacity = 18
        const remaining = Number(item.quantityTotal) - Number(item.quantityEnvasado ?? 0)

        if (remaining > 0) {
          const full = Math.floor(remaining / capacity)
          const rest = remaining % capacity
          const total = full + (rest > 0 ? 1 : 0)

          for (let i = 0; i < total; i++) {
            const qty = i === total - 1 && rest > 0 ? rest : capacity
            await semiFinishedQueries.createBucket({
              semiFinishedId,
              sourceBucketId: `legacy-${semiFinishedId}-${i + 1}`,
              bucketIndex: i + 1,
              originalQuantityKg: qty,
              currentQuantityKg: qty,
            })
          }

          buckets = await semiFinishedQueries.getBuckets(semiFinishedId)
        }
      }
    }

    return NextResponse.json({ success: true, data: buckets })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}
