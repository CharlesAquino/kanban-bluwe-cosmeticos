import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'

const db = getDb()

interface ModActivityRow {
  id: string
  operatorId: string
  type: string
  description: string
  productId: string | null
  startedAt: string
  endedAt: string | null
  createdAt: string
  operatorName?: string
}

function mapRow(row: ModActivityRow) {
  return {
    id: row.id,
    operatorId: row.operatorId,
    type: row.type,
    description: row.description,
    productId: row.productId,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    createdAt: row.createdAt,
    operatorName: row.operatorName ?? undefined,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operatorId = searchParams.get('operatorId')

    let rows: ModActivityRow[]
    if (operatorId) {
      const stmt = db.prepare<string, ModActivityRow>(
        `SELECT a.*, o.name as operatorName
         FROM mod_activities a
         JOIN mod_operators o ON o.id = a.operatorId
         WHERE a.operatorId = ?
         ORDER BY datetime(a.startedAt) DESC`
      )
      rows = stmt.all(operatorId)
    } else {
      const stmt = db.prepare<[], ModActivityRow>(
        `SELECT a.*, o.name as operatorName
         FROM mod_activities a
         JOIN mod_operators o ON o.id = a.operatorId
         ORDER BY datetime(a.startedAt) DESC
         LIMIT 100`
      )
      rows = stmt.all()
    }

    return NextResponse.json({ success: true, data: rows.map(mapRow) })
  } catch (error) {
    console.error('Erro ao listar atividades MOD:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const operatorId = typeof body?.operatorId === 'string' ? body.operatorId.trim() : ''
    const rawType = typeof body?.type === 'string' ? body.type : ''
    const type = rawType.trim()
    const rawDescription = typeof body?.description === 'string' ? body.description : ''
    const description = rawDescription.trim()
    const rawProductId = typeof body?.productId === 'string' ? body.productId : ''
    const productId = rawProductId.trim() || null
    const startedAtRaw = typeof body?.startedAt === 'string' ? body.startedAt : ''
    const startedAt = startedAtRaw || new Date().toISOString()

    if (!operatorId || !type || !description) {
      return NextResponse.json(
        { success: false, error: 'operatorId, type e description são obrigatórios' },
        { status: 400 }
      )
    }

    const id =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const createdAt = new Date().toISOString()

    const insert = db.prepare(
      `INSERT INTO mod_activities (id, operatorId, type, description, productId, startedAt, endedAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`
    )
    insert.run(id, operatorId, type, description, productId, startedAt, createdAt)

    const sel = db
      .prepare<string, ModActivityRow>('SELECT * FROM mod_activities WHERE id = ?')
      .get(id)

    return NextResponse.json(
      { success: true, data: sel ? mapRow(sel) : null },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar atividade MOD:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
