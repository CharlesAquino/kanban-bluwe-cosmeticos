import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/semi-finished/[id]/buckets - Lista ou gera baldes de um semi-acabado
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const semiFinishedId = params.id

    // Busca baldes existentes
    let buckets = await prisma.semiFinishedBucket.findMany({
      where: { semiFinishedId },
      orderBy: { bucketIndex: 'asc' },
    })

    // Fallback: se não houver baldes, gerar a partir do item
    if (!buckets || buckets.length === 0) {
      const item = await prisma.semiFinishedItem.findUnique({
        where: { id: semiFinishedId },
      })

      if (item) {
        const capacity = 18
        const remaining = Number(item.quantityTotal) - Number(item.quantityEnvasado ?? 0)

        if (remaining > 0) {
          const full = Math.floor(remaining / capacity)
          const rest = remaining % capacity
          const total = full + (rest > 0 ? 1 : 0)

          await prisma.$transaction(async (tx) => {
            for (let i = 0; i < total; i++) {
              const qty = i === total - 1 && rest > 0 ? rest : capacity
              await tx.semiFinishedBucket.create({
                data: {
                  semiFinishedId,
                  sourceBucketId: `legacy-${semiFinishedId}-${i + 1}`,
                  bucketIndex: i + 1,
                  originalQuantityKg: qty,
                  currentQuantityKg: qty,
                  status: 'available',
                },
              })
            }
          })

          buckets = await prisma.semiFinishedBucket.findMany({
            where: { semiFinishedId },
            orderBy: { bucketIndex: 'asc' },
          })
        }
      }
    }

    return NextResponse.json({ success: true, data: buckets })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}
