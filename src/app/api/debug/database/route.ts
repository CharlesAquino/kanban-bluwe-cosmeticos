import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== TESTE: Verificando conexão com banco ===')
    
    // Testar conexão básica
    const productCount = await prisma.product.count()
    const semiFinishedCount = await prisma.semiFinishedItem.count()
    
    console.log('📊 Estatísticas do banco:', {
      products: productCount,
      semiFinished: semiFinishedCount
    })
    
    // Buscar primeiro produto para teste
    const firstProduct = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        currentStage: true,
        status: true,
        op: true,
        batch: true
      }
    })
    
    if (firstProduct) {
      console.log('🔍 Primeiro produto encontrado:', firstProduct)
    } else {
      console.log('⚠️ Nenhum produto encontrado')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        database: 'connected',
        productCount,
        semiFinishedCount,
        firstProduct: firstProduct || null
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de banco:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error instanceof Error ? error.stack : 'Sem detalhes'
    }, { status: 500 })
  }
}
