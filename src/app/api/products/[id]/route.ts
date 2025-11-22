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
    const { name, op, batch, quantity, image, createdById } = body

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

    // Normalização dos dados
    const normalizedOp = op !== undefined ? String(op).trim() : undefined
    const normalizedBatch = batch !== undefined ? String(batch).trim() : undefined

    // Se está alterando OP ou Batch, verificar duplicidade
    if (normalizedOp || normalizedBatch) {
      console.log('=== API PUT: Verificando duplicidade OP+Lote ===')
      const [existingProduct, existingSemi] = await Promise.all([
        prisma.product.findFirst({
          where: {
            op: normalizedOp,
            batch: normalizedBatch,
            id: { not: id } // Ignorar o próprio produto
          }
        }),
        prisma.semiFinishedItem.findFirst({
          where: {
            op: normalizedOp,
            batch: normalizedBatch
          }
        })
      ])

      if (existingProduct) {
        console.log('=== API PUT: OP+Lote já existe em produção ===')
        return NextResponse.json({
          success: false,
          error: `OP "${normalizedOp}" com Lote "${normalizedBatch}" já existe em produção.`
        }, { status: 409 })
      }

      if (existingSemi) {
        console.log('=== API PUT: OP+Lote já existe em semi-acabados ===')
        return NextResponse.json({
          success: false,
          error: `OP "${normalizedOp}" com Lote "${normalizedBatch}" já existe em semi-acabados.`
        }, { status: 409 })
      }
    }

    // Atualizar produto com Prisma
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : product.name,
        op: normalizedOp !== undefined ? normalizedOp : product.op,
        batch: normalizedBatch !== undefined ? normalizedBatch : product.batch,
        quantity: quantity !== undefined ? Number(quantity) : product.quantity,
        image: image !== undefined ? (String(image).trim() || null) : product.image,
        createdById: createdById !== undefined ? String(createdById) : product.createdById,
        updatedAt: new Date()
      }
    })

    console.log('Produto atualizado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error: any) {
    console.error('=== API PUT: ERRO ===')
    console.error('Erro ao atualizar produto:', error)

    // Tratar violação de constraint única (race condition)
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[] || []
      if (target.includes('op') && target.includes('batch')) {
        return NextResponse.json({
          success: false,
          error: 'OP e Lote já estão em uso por outro produto.'
        }, { status: 409 })
      }
    }

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

// PATCH /api/products/[id] - Atualizar status do produto
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, currentStage } = body

    console.log('=== API PATCH: Atualizando status do produto ===')
    console.log('Dados recebidos:', { id, status, currentStage })

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

    // Atualizar status do produto com Prisma
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        status: status !== undefined ? String(status).toUpperCase() : product.status,
        currentStage: currentStage !== undefined ? String(currentStage).toUpperCase() : product.currentStage,
        updatedAt: new Date()
      }
    })

    console.log('Status do produto atualizado:', updatedProduct)

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('=== API PATCH: ERRO ===')
    console.error('Erro ao atualizar status do produto:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar status do produto',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
