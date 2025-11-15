import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API RESUME: Retomando produto ===')
    console.log('Produto ID:', id)

    // Buscar produto atual
    const selectStmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = selectStmt.get(id) as Product

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Atualizar status para ativo
    const updateStmt = db.prepare(`
      UPDATE products
      SET status = 'active', updatedAt = ?
      WHERE id = ?
    `)

    updateStmt.run(new Date().toISOString(), id)

    // Buscar produto atualizado
    const updatedProduct = selectStmt.get(id) as Product

    console.log('Produto retomado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API RESUME: ERRO ===')
    console.error('Erro ao retomar produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
