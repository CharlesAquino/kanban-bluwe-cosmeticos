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
    const body = await request.json()
    const { reason } = body

    console.log('=== API BLOCK: Bloqueando produto ===')
    console.log('Dados recebidos:', { id, reason })

    if (typeof reason !== 'string' || reason.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: "Parâmetro inválido: 'reason' deve ser uma string com pelo menos 3 caracteres"
      }, { status: 400 })
    }

    // Buscar produto atual
    const selectStmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = selectStmt.get(id) as Product

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Atualizar status para bloqueado
    const updateStmt = db.prepare(`
      UPDATE products
      SET status = 'blocked', updatedAt = ?
      WHERE id = ?
    `)

    updateStmt.run(new Date().toISOString(), id)

    // Buscar produto atualizado
    const updatedProduct = selectStmt.get(id) as Product

    console.log('Produto bloqueado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API BLOCK: ERRO ===')
    console.error('Erro ao bloquear produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
