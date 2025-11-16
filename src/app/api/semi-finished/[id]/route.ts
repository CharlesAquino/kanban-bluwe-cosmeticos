import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
const db = getDb()

// DELETE /api/semi-finished/[id] - Excluir item de semi-acabados e seus vínculos
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const sel = db.prepare('SELECT * FROM semi_finished_items WHERE id = ?')
    const existing = sel.get(id) as any | undefined
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Item de Semi-Acabados não encontrado' },
        { status: 404 }
      )
    }

    const delBuckets = db.prepare('DELETE FROM semi_finished_buckets WHERE semiFinishedId = ?')
    delBuckets.run(id)

    const delLogs = db.prepare('DELETE FROM packaging_logs WHERE semiFinishedId = ?')
    delLogs.run(id)

    const delItem = db.prepare('DELETE FROM semi_finished_items WHERE id = ?')
    delItem.run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}
