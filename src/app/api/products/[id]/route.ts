import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/products/[id] - Buscar produto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('=== API GET: Buscando produto ===')
    console.log('Produto ID:', id)

    // Buscar produto com Prisma
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    console.log('Produto encontrado:', product)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('=== API GET: ERRO ===')
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

    console.log('=== API PUT: Atualizando produto ===')
    console.log('Dados recebidos:', { id, name, op, batch, quantity, image })

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
        name: name !== undefined ? String(name).trim() : product.name,
        op: op !== undefined ? String(op).trim() : product.op,
        batch: batch !== undefined ? String(batch).trim() : product.batch,
        quantity: quantity !== undefined ? Number(quantity) : product.quantity,
        image: image !== undefined ? (String(image).trim() || null) : product.image,
        updatedAt: new Date()
      }
    })

    console.log('Produto atualizado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API PUT: ERRO ===')
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

    // Verificar se produto existe com Prisma
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Deletar produto com Prisma
    await prisma.product.delete({
      where: { id }
    })

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
