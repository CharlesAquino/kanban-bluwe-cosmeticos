import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
const db = getDb()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { bucketIds } = await request.json().catch(() => ({ bucketIds: [] })) as { bucketIds: string[] }
    if (!Array.isArray(bucketIds) || bucketIds.length === 0) {
      return NextResponse.json({ success: false, error: 'bucketIds é obrigatório' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const upd = db.prepare(`UPDATE semi_finished_buckets SET status = 'in_packaging', updatedAt = ? WHERE id = ? AND semiFinishedId = ?`)
    const log = db.prepare(`INSERT INTO packaging_logs (id, semiFinishedId, semiFinishedBucketId, action, timestamp) VALUES (?, ?, ?, 'sent_to_packaging', ?)`)

    for (const bid of bucketIds) {
      upd.run(now, bid, params.id)
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
      log.run(id, params.id, bid, now)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
