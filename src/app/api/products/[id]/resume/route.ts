import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API RESUME: Retomando produto ===')
    console.log('Produto ID:', id)

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

    // Atualizar status para ativo com Prisma
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    })

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
