import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API PAUSE: Pausando produto ===')
    console.log('Produto ID:', id)

    // Buscar produto atual com better-sqlite3
    const db = getDb()
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Atualizar status para pausado com better-sqlite3
    const updatedAt = new Date().toISOString()
    const stmt = db.prepare(`
      UPDATE products 
      SET status = 'PAUSED', updatedAt = ? 
      WHERE id = ?
    `)
    
    stmt.run(updatedAt, id)
    
    // Buscar produto atualizado
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any

    console.log('Produto pausado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API PAUSE: ERRO ===')
    console.error('Erro ao pausar produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
