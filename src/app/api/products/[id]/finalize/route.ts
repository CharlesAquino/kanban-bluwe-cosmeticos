import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
import { enqueue } from '@/agents/dispatcher'
const db = getDb()

interface Product {
  id: string
  name: string
  op: string
  batch: string
  quantity: number
  currentStage: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    // Família passa a vir do produto

    // Buscar produto
    const selectStmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = selectStmt.get(id) as Product | undefined

    if (!product) {
      return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 })
    }

    if (product.currentStage !== 'finalizado') {
      return NextResponse.json({ success: false, error: 'Produto ainda não está no estágio Finalizado' }, { status: 400 })
    }

    // Criar item de semi-acabado
    const now = new Date().toISOString()
    const sfi = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      productId: product.id,
      name: product.name,
      family: (product as any).family || 'Sem Família',
      op: product.op,
      batch: product.batch,
      quantity_total: product.quantity,
      quantity_envasado: 0,
      status: 'aguardando',
      createdAt: now,
      updatedAt: now,
    }

    const insertSfi = db.prepare(`
      INSERT INTO semi_finished_items (id, productId, name, family, op, batch, quantity_total, quantity_envasado, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertSfi.run(
      sfi.id,
      sfi.productId,
      sfi.name,
      sfi.family,
      sfi.op,
      sfi.batch,
      sfi.quantity_total,
      sfi.quantity_envasado,
      sfi.status,
      sfi.createdAt,
      sfi.updatedAt,
    )

    // Copiar baldes do produto para semi_finished_buckets
    try {
      const selectBuckets = db.prepare('SELECT * FROM product_buckets WHERE productId = ? ORDER BY bucketIndex ASC')
      const buckets = selectBuckets.all(product.id) as Array<{
        id: string; bucketIndex: number; originalQuantityKg: number; currentQuantityKg: number
      }>
      if (buckets && buckets.length) {
        const insertSfb = db.prepare(`
          INSERT INTO semi_finished_buckets (id, semiFinishedId, sourceBucketId, bucketIndex, originalQuantityKg, currentQuantityKg, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, 'moved_to_semi', ?, ?)
        `)
        for (const b of buckets) {
          const sid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
          insertSfb.run(sid, sfi.id, b.id, b.bucketIndex, b.originalQuantityKg, b.currentQuantityKg, now, now)
        }
      }
    } catch (e) {
      // log suave, não falha a operação
      console.warn('Falha ao copiar baldes para semi_finished_buckets', e)
    }

    // Remover produto do kanban de produção
    const del = db.prepare('DELETE FROM products WHERE id = ?')
    del.run(product.id)

    // Disparar evento para o agente (não bloqueante)
    try { enqueue({ type: 'finalize', payload: { semiFinishedId: sfi.id, productId: product.id } }) } catch {}

    return NextResponse.json({ success: true, data: sfi }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
