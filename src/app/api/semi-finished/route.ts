import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
const db = getDb()

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM semi_finished_items ORDER BY updatedAt DESC')
    const items = stmt.all()
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, name, family, op, batch, quantity_total } = body || {}
    if (!productId || !name || !family || !op || !batch || !quantity_total) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    const insert = db.prepare(`
      INSERT INTO semi_finished_items (id, productId, name, family, op, batch, quantity_total, quantity_envasado, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'aguardando', ?, ?)
    `)
    insert.run(id, productId, name, family, op, batch, Number(quantity_total), now, now)

    const sel = db.prepare('SELECT * FROM semi_finished_items WHERE id = ?')
    const created = sel.get(id)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
