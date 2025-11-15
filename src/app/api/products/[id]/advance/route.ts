import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      'BACKLOG',
      'PRODUCAO_1KG',
      'AVALIACAO_COR',
      'PRODUCAO_5KG',
      'AVALIACAO_FINAL',
      'APROVADO',
      'REJEITADO',
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

    // Buscar produto atual com Prisma
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Atualizar produto com Prisma
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        currentStage: nextStage,
        updatedAt: new Date()
      }
    })

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
