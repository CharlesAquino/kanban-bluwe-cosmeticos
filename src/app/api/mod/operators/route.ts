import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'

const db = getDb()

interface ModOperatorRow {
  id: string
  name: string
  role: string | null
  isActive: number
  createdAt: string
  updatedAt: string
  photo: string | null
}

function mapRow(row: ModOperatorRow) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    isActive: !!row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    photo: row.photo,
  }
}

export async function GET() {
  try {
    const stmt = db.prepare<[], ModOperatorRow>(
      'SELECT * FROM mod_operators ORDER BY name ASC'
    )
    const rows = stmt.all()

    return NextResponse.json({ success: true, data: rows.map(mapRow) })
  } catch (error) {
    console.error('Erro ao listar MOD operators:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawName = typeof body?.name === 'string' ? body.name : ''
    const name = rawName.trim()
    const roleRaw = typeof body?.role === 'string' ? body.role : ''
    const role = roleRaw.trim() || null
    const isActive = body?.isActive === false ? 0 : 1
    const photoRaw = typeof body?.photo === 'string' ? body.photo : ''
    const photo = photoRaw.trim() || null
    const id: string | undefined = typeof body?.id === 'string' ? body.id.trim() : undefined

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome do operador é obrigatório' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    if (id) {
      const update = db.prepare(
        `UPDATE mod_operators SET name = ?, role = ?, isActive = ?, photo = ?, updatedAt = ? WHERE id = ?`
      )
      update.run(name, role, isActive, photo, now, id)

      const sel = db
        .prepare<string, ModOperatorRow>('SELECT * FROM mod_operators WHERE id = ?')
        .get(id)

      if (!sel) {
        return NextResponse.json(
          { success: false, error: 'Operador não encontrado após atualização' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: mapRow(sel) })
    }

    const newId =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const insert = db.prepare(
      `INSERT INTO mod_operators (id, name, role, isActive, createdAt, updatedAt, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    insert.run(newId, name, role, isActive, now, now, photo)

    const sel = db
      .prepare<string, ModOperatorRow>('SELECT * FROM mod_operators WHERE id = ?')
      .get(newId)

    return NextResponse.json(
      { success: true, data: sel ? mapRow(sel) : null },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar MOD operator:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
