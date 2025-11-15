import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
const db = getDb()

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stmt = db.prepare('SELECT * FROM semi_finished_buckets WHERE semiFinishedId = ? ORDER BY bucketIndex ASC')
    let buckets = stmt.all(params.id) as any[]

    // Fallback: se não houver baldes, gerar a partir do item
    if (!buckets || buckets.length === 0) {
      const item = db.prepare('SELECT * FROM semi_finished_items WHERE id = ?').get(params.id) as any
      if (item) {
        const capacity = 18
        const remaining = Number(item.quantity_total) - Number(item.quantity_envasado || 0)
        if (remaining > 0) {
          const full = Math.floor(remaining / capacity)
          const rest = remaining % capacity
          const total = full + (rest > 0 ? 1 : 0)
          const insert = db.prepare(`
            INSERT INTO semi_finished_buckets (id, semiFinishedId, sourceBucketId, bucketIndex, originalQuantityKg, currentQuantityKg, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 'moved_to_semi', ?, ?)
          `)
          const now = new Date().toISOString()
          for (let i = 0; i < total; i++) {
            const qty = i === total - 1 && rest > 0 ? rest : capacity
            const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
            insert.run(id, params.id, `legacy-${id}`, i + 1, qty, qty, now, now)
          }
          buckets = stmt.all(params.id) as any[]
        }
      }
    }
    return NextResponse.json({ success: true, data: buckets })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
