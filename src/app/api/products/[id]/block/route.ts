import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

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

    // Buscar produto atual com better-sqlite3
    const db = getDb()
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Atualizar status para bloqueado com better-sqlite3
    const updatedAt = new Date().toISOString()
    const stmt = db.prepare(`
      UPDATE products 
      SET status = 'BLOCKED', updatedAt = ? 
      WHERE id = ?
    `)
    
    stmt.run(updatedAt, id)
    
    // Buscar produto atualizado
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any

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
