import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/products/[id] - Buscar produto específico (Drizzle)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const product = await ProductService.getProductById(id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produto não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Atualizar produto (Drizzle)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, op, batch, quantity, image, createdById, manufacturingDate } = body || {}

    if (!name || !op || !batch || quantity == null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios não preenchidos',
          details: 'name, op, batch e quantity são obrigatórios',
        },
        { status: 400 }
      )
    }

    const qtyNumber = Number(quantity)
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quantidade inválida',
          details: 'quantity deve ser um número positivo',
        },
        { status: 400 }
      )
    }

    const updated = await ProductService.updateProduct(id, {
      name: String(name).trim(),
      op: String(op).trim(),
      batch: String(batch).trim(),
      quantity: qtyNumber,
      image: image !== undefined ? (String(image).trim() || null) : undefined,
      createdById: createdById ? String(createdById) : undefined,
      manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : undefined,
    })

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produto não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Erro ao atualizar produto (Drizzle):', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Deletar produto (Drizzle)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const product = await ProductService.getProductById(id)
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produto não encontrado',
        },
        { status: 404 }
      )
    }

    const success = await ProductService.deleteProduct(id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao deletar produto',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Atualizar status/estágio do produto (Drizzle)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, currentStage } = body || {}

    if (status == null && currentStage == null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum campo para atualizar',
          details: 'Informe status e/ou currentStage',
        },
        { status: 400 }
      )
    }

    const product = await ProductService.getProductById(id)
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produto não encontrado',
        },
        { status: 404 }
      )
    }

    const newStatus =
      status != null ? (String(status).toUpperCase() as any) : (product as any).status
    const newStage =
      currentStage != null
        ? (String(currentStage).toUpperCase() as any)
        : (product as any).currentStage

    const updated = await ProductService.updateProduct(id, {
      status: newStatus,
      currentStage: newStage,
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao atualizar status do produto',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
