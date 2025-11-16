import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'

const db = getDb()

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM semi_finished_families ORDER BY name ASC')
    const families = stmt.all()

    return NextResponse.json({ success: true, data: families })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const nameRaw = typeof body?.name === 'string' ? body.name : ''
    const name = nameRaw.trim()

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

    const insert = db.prepare(`
      INSERT INTO semi_finished_families (id, name, createdAt, updatedAt)
      VALUES (?, ?, ?, ?)
    `)

    try {
      insert.run(id, name, now, now)
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        return NextResponse.json(
          { success: false, error: 'Já existe uma categoria com este nome' },
          { status: 409 }
        )
      }
      throw error
    }

    const sel = db.prepare('SELECT * FROM semi_finished_families WHERE id = ?').get(id)
    return NextResponse.json({ success: true, data: sel }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 }
    )
  }
}
