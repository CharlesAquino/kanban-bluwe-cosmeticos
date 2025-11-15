import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== API PRODUCTS: Buscando produtos com Prisma ===')

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

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
    console.log('=== API PRODUCTS: Criando produto com Prisma ===')

    const body = await request.json()
    const { name, op, batch, quantity, image } = body

    // Validação básica
    if (!name || !op || !batch || !quantity) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: name, op, batch, quantity'
      }, { status: 400 })
    }

    // Normalização de dados
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantidade deve ser um número positivo'
      }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        op: String(op).trim(),
        batch: String(batch).trim(),
        quantity: qty,
        currentStage: 'producao_1kg',
        status: 'active',
        image: image && String(image).trim() ? String(image).trim() : null,
        createdById: 'system' // TODO: Implementar autenticação
      }
    })

    console.log('=== API PRODUCTS: Produto criado ===', product.id)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('=== API PRODUCTS: Erro ao criar produto ===', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create product'
    }, { status: 500 })
  }
}