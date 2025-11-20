import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/products/[id] - Buscar produto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API GET: Buscando produto ===')
    console.log('Produto ID:', id)

    const db = getDb()
    const product = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    console.log('Produto encontrado:', product)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('=== API GET: ERRO ===')
    console.error('Erro ao buscar produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// PUT /api/products/[id] - Atualizar produto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, op, batch, quantity, image } = body

    console.log('=== API PUT: Atualizando produto ===')
    console.log('Dados recebidos:', { id, name, op, batch, quantity, image })

    const db = getDb()
    const product = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }
    const now = new Date().toISOString()
    const update = db.prepare(
      `UPDATE products
       SET name = ?, op = ?, batch = ?, quantity = ?, image = ?, updatedAt = ?
       WHERE id = ?`
    )

    const newName = name !== undefined ? String(name).trim() : product.name
    const newOp = op !== undefined ? String(op).trim() : product.op
    const newBatch = batch !== undefined ? String(batch).trim() : product.batch
    const newQty = quantity !== undefined ? Number(quantity) : product.quantity
    const newImage = image !== undefined ? (String(image).trim() || null) : product.image

    update.run(newName, newOp, newBatch, newQty, newImage, now, id)

    const updatedProduct = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    console.log('Produto atualizado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API PUT: ERRO ===')
    console.error('Erro ao atualizar produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Deletar produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API DELETE: Deletando produto ===')
    console.log('Produto ID:', id)

    const db = getDb()
    const product = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id)

    console.log('Produto deletado:', product)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('=== API DELETE: ERRO ===')
    console.error('Erro ao deletar produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// PATCH /api/products/[id] - Atualizar status do produto
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, currentStage } = body

    console.log('=== API PATCH: Atualizando status do produto ===')
    console.log('Dados recebidos:', { id, status, currentStage })

    const db = getDb()
    const existing = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id) as
      | {
          id: string
          currentStage: string
          status: string
        }
      | undefined

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    const newStatus = status !== undefined ? String(status).toUpperCase() : existing.status
    const newStage =
      currentStage !== undefined ? String(currentStage).toUpperCase() : existing.currentStage

    db.prepare(
      `UPDATE products
       SET status = ?, currentStage = ?, updatedAt = ?
       WHERE id = ?`
    ).run(newStatus, newStage, now, id)

    const updatedProduct = db
      .prepare(
        `SELECT id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt
         FROM products WHERE id = ?`
      )
      .get(id)

    console.log('Status do produto atualizado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API PATCH: ERRO ===')
    console.error('Erro ao atualizar status do produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar status do produto',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
