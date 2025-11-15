import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
import { enqueue } from '@/agents/dispatcher'
const db = getDb()

export async function POST(request: NextRequest, { params }: { params: { bucketId: string } }) {
  try {
    const body = await request.json().catch(() => ({})) as { deltaKg?: number; notes?: string }
    const delta = Number(body.deltaKg)
    if (!Number.isFinite(delta) || delta <= 0) {
      return NextResponse.json({ success: false, error: 'deltaKg inválido' }, { status: 400 })
    }

    const bucketStmt = db.prepare('SELECT * FROM semi_finished_buckets WHERE id = ?')
    const bucket = bucketStmt.get(params.bucketId) as any
    if (!bucket) return NextResponse.json({ success: false, error: 'Balde não encontrado' }, { status: 404 })

    if (delta > bucket.currentQuantityKg) {
      return NextResponse.json({ success: false, error: 'Quantidade excede o saldo do balde' }, { status: 400 })
    }

    const newQty = Number((bucket.currentQuantityKg - delta).toFixed(3))
    const now = new Date().toISOString()

    const updBucket = db.prepare(`UPDATE semi_finished_buckets SET currentQuantityKg = ?, status = ?, updatedAt = ? WHERE id = ?`)
    const status = newQty === 0 ? 'packaged' : 'partial'
    updBucket.run(newQty, status, now, params.bucketId)

    // Somar no item
    const updItem = db.prepare(`UPDATE semi_finished_items SET quantity_envasado = quantity_envasado + ? , updatedAt = ? WHERE id = ?`)
    updItem.run(delta, now, bucket.semiFinishedId)

    // Log
    const log = db.prepare(`INSERT INTO packaging_logs (id, semiFinishedId, semiFinishedBucketId, action, deltaKg, previousQty, newQty, notes, timestamp) VALUES (?, ?, ?, 'packaged', ?, ?, ?, ?, ?)`)
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    log.run(id, bucket.semiFinishedId, params.bucketId, delta, bucket.currentQuantityKg, newQty, body.notes || null, now)

    // Disparar evento para o agente (não bloqueante)
    try { enqueue({ type: 'package', payload: { bucketId: params.bucketId, semiFinishedId: bucket.semiFinishedId, deltaKg: delta, newQty, status } }) } catch {}

    return NextResponse.json({ success: true, data: { newQty, status } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
