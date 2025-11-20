import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('=== API PRODUÇÃO MANUAL: Recebendo dados ===', body)

    const {
      operadorId,
      produtoCategoria,
      loteOP,
      quantidadeKg,
      etapaAtual,
      tempoInicio,
      status,
      observacoes
    } = body

    // Validar campos obrigatórios
    if (!operadorId || !loteOP || !quantidadeKg || !etapaAtual) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios não preenchidos'
      }, { status: 400 })
    }

    const db = getDb()

    const id =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const now = new Date().toISOString()
    const createdAtIso = tempoInicio ? new Date(tempoInicio).toISOString() : now

    const statusMapped =
      status === 'EM_ANDAMENTO'
        ? 'ACTIVE'
        : status === 'CONCLUIDO'
        ? 'COMPLETED'
        : 'PAUSED'

    const insert = db.prepare(
      `INSERT INTO products (
        id, name, family, op, batch, quantity, currentStage, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )

    insert.run(
      id,
      `${produtoCategoria} - ${loteOP}`,
      produtoCategoria ?? null,
      loteOP,
      `${produtoCategoria}-${new Date().toISOString().slice(0, 10)}`,
      quantidadeKg,
      etapaAtual,
      statusMapped,
      createdAtIso,
      now
    )

    const producao = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    console.log('=== API PRODUÇÃO MANUAL (dev.db): Produção criada ===', id)

    return NextResponse.json({
      success: true,
      data: producao
    })

  } catch (error) {
    console.error('=== API PRODUÇÃO MANUAL: Erro ao salvar ===', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save production data'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    console.log('=== API PRODUÇÃO MANUAL (dev.db): Buscando produções ===')

    const db = getDb()
    const producoes = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products
         ORDER BY datetime(createdAt) DESC
         LIMIT 50`
      )
      .all()

    console.log('=== API PRODUÇÃO MANUAL (dev.db): Produções encontradas ===', producoes.length)

    return NextResponse.json({
      success: true,
      data: producoes
    })

  } catch (error) {
    console.error('=== API PRODUÇÃO MANUAL: Erro ao buscar ===', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch production data'
    }, { status: 500 })
  }
}
