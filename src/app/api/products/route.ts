import { NextRequest, NextResponse } from 'next/server'

// Mock data temporário para funcionar imediatamente
const mockProducts = [
  {
    id: 'mock-prod-1',
    name: 'Produto Mock 1',
    op: 'OP001',
    batch: 'L001',
    quantity: 100,
    currentStage: 'PRODUCAO_1KG',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'mock-user'
  },
  {
    id: 'mock-prod-2',
    name: 'Produto Mock 2',
    op: 'OP002',
    batch: 'L002',
    quantity: 200,
    currentStage: 'PRODUCAO_5KG',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'mock-user'
  }
]

export async function GET() {
  try {
    console.log('=== API PRODUCTS: Retornando dados mock ===')

    return NextResponse.json({
      success: true,
      data: mockProducts
    })
  } catch (error) {
    console.error('=== API PRODUCTS: Erro ===', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API PRODUCTS: Criando produto ===')

    const body = await request.json()
    const { name, op, batch, quantity, modOperatorId } = body

    // Validação básica
    if (!name || !op || !batch || !quantity || !modOperatorId) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: name, op, batch, quantity, modOperatorId'
      }, { status: 400 })
    }

    // Normalização de dados
    const normalizedOp = String(op).trim()
    const normalizedBatch = String(batch).trim()
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantidade deve ser um número positivo'
      }, { status: 400 })
    }

    // Criar produto usando fallback
    const product = await createProduct({
      name: String(name).trim(),
      op: normalizedOp,
      batch: normalizedBatch,
      quantity: qty,
      currentStage: 'PRODUCAO_1KG',
      status: 'ACTIVE',
      createdById: modOperatorId
    })

    console.log('=== API PRODUCTS: Produto criado ===', product.id)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error: any) {
    console.error('=== API PRODUCTS: Erro ao criar produto ===', error)

    return NextResponse.json({
      success: false,
      error: 'Erro ao criar produto'
    }, { status: 500 })
  }
}