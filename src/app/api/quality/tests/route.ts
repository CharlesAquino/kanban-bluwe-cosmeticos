import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
const db = getDb()

interface QualityTestRow {
  id: string
  productId: string
  productName: string
  batch: string
  stage: string
  parameter: string
  targetValue: number
  tolMin: number
  tolMax: number
  measuredValue: number
  unit: string
  operator: string
  timestamp: string
  approved: number
  notes?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    let rows: QualityTestRow[]
    if (productId) {
      const stmt = db.prepare(`SELECT * FROM quality_tests WHERE productId = ? ORDER BY datetime(timestamp) DESC`)
      rows = stmt.all(productId) as QualityTestRow[]
    } else {
      const stmt = db.prepare(`SELECT * FROM quality_tests ORDER BY datetime(timestamp) DESC`)
      rows = stmt.all() as QualityTestRow[]
    }

    // Converter approved de INTEGER para boolean
    const data = rows.map(r => ({ ...r, approved: !!r.approved }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API quality/tests GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      productName,
      batch,
      stage,
      parameter,
      targetValue,
      tolMin,
      tolMax,
      measuredValue,
      unit,
      operator,
      notes,
      timestamp
    } = body as {
      productId: string
      productName: string
      batch: string
      stage: string
      parameter: string
      targetValue: number
      tolMin: number
      tolMax: number
      measuredValue: number
      unit: string
      operator: string
      notes?: string
      timestamp?: string
    }

    if (!productId || !productName || !batch || !stage || !parameter || targetValue === undefined || tolMin === undefined || tolMax === undefined || measuredValue === undefined || !unit || !operator) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
    const approved = measuredValue >= tolMin && measuredValue <= tolMax ? 1 : 0
    const ts = timestamp || new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO quality_tests (id, productId, productName, batch, stage, parameter, targetValue, tolMin, tolMax, measuredValue, unit, operator, timestamp, approved, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, productId, productName, batch, stage, parameter, targetValue, tolMin, tolMax, measuredValue, unit, operator, ts, approved, notes ?? null)

    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    console.error('API quality/tests POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
