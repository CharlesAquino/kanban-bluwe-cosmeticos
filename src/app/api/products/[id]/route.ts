import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
const db = getDb()

interface Product {
  id: string
  name: string
  op: string
  batch: string
  quantity: number
  currentStage: string
  status: string
  image?: string
  createdAt: string
  updatedAt: string
}

// GET /api/products/[id] - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const selectStmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = selectStmt.get(id) as Product

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
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

    // Buscar produto atual
    const selectStmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = selectStmt.get(id) as Product

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Atualizar produto
    const updateStmt = db.prepare(`
      UPDATE products
      SET name = ?, op = ?, batch = ?, quantity = ?, image = ?, updatedAt = ?
      WHERE id = ?
    `)

    updateStmt.run(name || product.name, op || product.op, batch || product.batch, quantity || product.quantity, image || product.image, new Date().toISOString(), id)

    // Buscar produto atualizado
    const updatedProduct = selectStmt.get(id) as Product

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
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

    // Verificar se produto existe
    const selectStmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = selectStmt.get(id) as Product

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Deletar produto
    const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?')
    deleteStmt.run(id)

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
