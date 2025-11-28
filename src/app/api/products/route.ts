import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/products
// Retorna a lista de produtos reais (sem mocks), usada pelo contexto global (loadProducts)
export async function GET(_request: NextRequest) {
  try {
    const products = await ProductService.getAllProductsWithoutMocks()

    return NextResponse.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar produtos',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// POST /api/products
// Cria um novo produto a partir do formulário (ProductForm)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      family, // ainda não usado no ProductService, mas mantido para futura extensão
      op,
      batch,
      quantity,
      modOperatorId,
    } = body || {}

    if (!name || !op || !batch || quantity == null || !modOperatorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios não preenchidos',
          details: 'name, op, batch, quantity e modOperatorId são obrigatórios',
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

    const product = await ProductService.createProduct({
      name: String(name).trim(),
      op: String(op).trim(),
      batch: String(batch).trim(),
      quantity: qtyNumber,
      createdById: String(modOperatorId).trim(),
    })

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar produto',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// Mantemos PATCH e DELETE neutros por enquanto, até a nova API estar definida
export async function PATCH() {
  return NextResponse.json(
    { error: 'Rota PATCH /api/products ainda não implementada com Drizzle' },
    { status: 503 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Rota DELETE /api/products ainda não implementada com Drizzle' },
    { status: 503 }
  )
}
