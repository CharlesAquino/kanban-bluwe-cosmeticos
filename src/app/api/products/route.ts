import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    console.log('=== API PRODUCTS (dev.db): Buscando produtos ===')

    const db = getDb()
    const rows = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products
         ORDER BY datetime(createdAt) DESC`
      )
      .all() as Array<{
        id: string
        name: string
        family?: string | null
        op: string
        batch: string
        quantity: number
        currentStage: string
        status: string
        image?: string | null
        createdAt: string
        updatedAt: string
      }>

    console.log('=== API PRODUCTS (dev.db): Produtos encontrados:', rows.length)

    return NextResponse.json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('=== API PRODUCTS (dev.db): Erro ao buscar produtos ===', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API PRODUCTS (dev.db): Criando produto ===')

    const body = await request.json()
    const { name, op, batch, quantity, modOperatorId } = body as {
      name?: string
      op?: string
      batch?: string
      quantity?: number | string
      modOperatorId?: string
    }

    if (!name || !op || !batch || quantity == null || !modOperatorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios: name, op, batch, quantity, modOperatorId'
        },
        { status: 400 }
      )
    }

    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quantidade deve ser um número positivo'
        },
        { status: 400 }
      )
    }

    const db = getDb()
    const id =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const now = new Date().toISOString()

    const insert = db.prepare(
      `INSERT INTO products (
        id, name, family, op, batch, quantity, currentStage, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )

    insert.run(
      id,
      String(name).trim(),
      null,
      String(op).trim(),
      String(batch).trim(),
      qty,
      'PRODUCAO_1KG',
      'ACTIVE',
      now,
      now
    )

    const select = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    console.log('=== API PRODUCTS (dev.db): Produto criado ===', id)

    return NextResponse.json({
      success: true,
      data: select
    })
  } catch (error) {
    console.error('=== API PRODUCTS (dev.db): Erro ao criar produto ===', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, op, batch, quantity, currentStage, status } = body as {
      name?: string
      op?: string
      batch?: string
      quantity?: number
      currentStage?: string
      status?: string
    }

    const db = getDb()
    const existing = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id) as
      | {
          id: string
          name: string
          op: string
          batch: string
          quantity: number
          currentStage: string
          status: string
          image?: string | null
        }
      | undefined

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    const update = db.prepare(
      `UPDATE products
       SET name = ?, op = ?, batch = ?, quantity = ?, currentStage = ?, status = ?, updatedAt = ?
       WHERE id = ?`
    )

    update.run(
      name !== undefined ? String(name).trim() : existing.name,
      op !== undefined ? String(op).trim() : existing.op,
      batch !== undefined ? String(batch).trim() : existing.batch,
      quantity !== undefined ? Number(quantity) : existing.quantity,
      currentStage !== undefined ? String(currentStage) : existing.currentStage,
      status !== undefined ? String(status) : existing.status,
      now,
      id
    )

    const updated = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('=== API PRODUCTS (dev.db): Erro ao atualizar produto ===', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const db = getDb()
    const existing = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id)

    return NextResponse.json({
      success: true,
      data: existing
    })
  } catch (error) {
    console.error('=== API PRODUCTS (dev.db): Erro ao deletar produto ===', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product'
      },
      { status: 500 }
    )
  }
}