import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// DELETE /api/semi-finished/[id] - Excluir item de semi-acabados e seus vínculos
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.semiFinishedItem.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Item de Semi-Acabados não encontrado' },
        { status: 404 },
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.semiFinishedBucket.deleteMany({
        where: { semiFinishedId: id },
      })

      // packaging_logs era usado no SQLite; se existir em Postgres, migramos depois.
      // Aqui focamos em remover buckets e o item principal.

      await tx.semiFinishedItem.delete({
        where: { id },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}
