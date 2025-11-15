import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
const db = getDb()

export interface NonConformity {
  id: string
  productId: string
  productName: string
  batch: string
  stage: string
  type: 'qualidade' | 'processo' | 'material' | 'equipamento'
  severity: 'critical' | 'major' | 'minor'
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  createdAt: string
  responsible?: string
  deadline?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let rows: NonConformity[]
    if (status) {
      const stmt = db.prepare(`SELECT * FROM non_conformities WHERE status = ? ORDER BY datetime(createdAt) DESC`)
      rows = stmt.all(status) as NonConformity[]
    } else {
      const stmt = db.prepare(`SELECT * FROM non_conformities ORDER BY datetime(createdAt) DESC`)
      rows = stmt.all() as NonConformity[]
    }

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('API quality/nc GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { productId, productName, batch, stage, type, severity, description, status, createdAt, responsible, deadline } = body as NonConformity

    if (!productId || !productName || !batch || !stage || !type || !severity || !description) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
    const created = createdAt || new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO non_conformities (id, productId, productName, batch, stage, type, severity, description, status, createdAt, responsible, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      productId,
      productName,
      batch,
      stage,
      type,
      severity,
      description,
      status || 'open',
      created,
      responsible ?? null,
      deadline ?? null
    )

    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    console.error('API quality/nc POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
