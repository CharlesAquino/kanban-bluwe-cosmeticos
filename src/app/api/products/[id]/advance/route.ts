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
    const { nextStage, mod } = body

    console.log('=== API ADVANCE: Avançando produto ===')
    console.log('Dados recebidos:', { id, nextStage, mod })

    const ALLOWED_STAGES = new Set([
      'producao_1kg',
      'avaliacao_cor',
      'performance',
      'reator',
      'avaliacao_cor_reator',
      'performance_reator',
      'finalizado',
    ])

    if (
      typeof nextStage !== 'string' ||
      !ALLOWED_STAGES.has(nextStage) ||
      (mod !== 1 && mod !== -1)
    ) {
      return NextResponse.json({
        success: false,
        error:
          "Parâmetros inválidos: 'nextStage' deve ser um estágio válido e 'mod' deve ser 1 ou -1"
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

    // Atualizar produto
    const updateStmt = db.prepare(`
      UPDATE products
      SET currentStage = ?, updatedAt = ?
      WHERE id = ?
    `)

    updateStmt.run(nextStage, new Date().toISOString(), id)

    // Buscar produto atualizado
    const updatedProduct = selectStmt.get(id) as Product

    console.log('Produto avançado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API ADVANCE: ERRO ===')
    console.error('Erro ao avançar produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
