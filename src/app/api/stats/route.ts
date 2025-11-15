import Database from 'better-sqlite3'
import { NextResponse } from 'next/server'

// Conectar ao banco SQLite
const db = new Database('./dev.db')

interface Product {
  id: string
  name: string
  op: string
  batch: string
  quantity: number
  currentStage: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function GET() {
  try {
    console.log('=== API STATS: Calculando estatísticas do SQLite ===')

    // Buscar produtos do banco
    const stmt = db.prepare('SELECT * FROM products')
    const products: Product[] = stmt.all() as Product[]

    // Calcular estatísticas
    const stats = {
      total: products.length,
      inProgress: products.filter((p: Product) => p.status === 'active' && p.currentStage !== 'backlog' && p.currentStage !== 'completed').length,
      paused: products.filter((p: Product) => p.status === 'paused').length,
      completed: products.filter((p: Product) => p.currentStage === 'completed' || p.currentStage === 'aprovado').length,
      blocked: products.filter((p: Product) => p.status === 'blocked').length,
    }

    console.log('=== API STATS: Estatísticas calculadas:', stats)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('=== API STATS: ERRO ===')
    console.error('Erro ao calcular estatísticas:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
