import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct } from '@/lib/api-fallback'

export async function GET() {
  try {
    console.log('=== API PRODUCTS: Buscando produtos ===')

    const products = await getProducts()

    console.log('=== API PRODUCTS: Produtos encontrados:', products.length)

    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('=== API PRODUCTS: Erro ao buscar produtos ===', error)
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