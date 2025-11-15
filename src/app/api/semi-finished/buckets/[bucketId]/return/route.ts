import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
import { enqueue } from '@/agents/dispatcher'
const db = getDb()

export async function POST(_request: NextRequest, { params }: { params: { bucketId: string } }) {
  try {
    const bucketStmt = db.prepare('SELECT * FROM semi_finished_buckets WHERE id = ?')
    const bucket = bucketStmt.get(params.bucketId) as any
    if (!bucket) return NextResponse.json({ success: false, error: 'Balde não encontrado' }, { status: 404 })

    const now = new Date().toISOString()
    const upd = db.prepare(`UPDATE semi_finished_buckets SET status = 'returned', updatedAt = ? WHERE id = ?`)
    upd.run(now, params.bucketId)

    const log = db.prepare(`INSERT INTO packaging_logs (id, semiFinishedId, semiFinishedBucketId, action, timestamp) VALUES (?, ?, ?, 'returned', ?)`)
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    log.run(id, bucket.semiFinishedId, params.bucketId, now)

    // Disparar evento para o agente (não bloqueante)
    try { enqueue({ type: 'return', payload: { bucketId: params.bucketId, semiFinishedId: bucket.semiFinishedId } }) } catch {}

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
