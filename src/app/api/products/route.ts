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

    // Validação cruzada de OP+Lote em Product e SemiFinishedItem
    console.log('=== API PRODUCTS: Verificando duplicidade OP+Lote ===')
    const [existingProduct, existingSemi] = await Promise.all([
      prisma.product.findFirst({
        where: {
          op: normalizedOp,
          batch: normalizedBatch,
        },
      }),
      prisma.semiFinishedItem.findFirst({
        where: {
          op: normalizedOp,
          batch: normalizedBatch,
        },
      }),
    ])

    if (existingProduct) {
      console.log('=== API PRODUCTS: OP+Lote já existe em produção ===')
      return NextResponse.json({
        success: false,
        error: `OP "${normalizedOp}" com Lote "${normalizedBatch}" já existe em produção.`
      }, { status: 409 })
    }

    if (existingSemi) {
      console.log('=== API PRODUCTS: OP+Lote já existe em semi-acabados ===')
      return NextResponse.json({
        success: false,
        error: `OP "${normalizedOp}" com Lote "${normalizedBatch}" já existe em semi-acabados.`
      }, { status: 409 })
    }

    // Criar produto
    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        op: normalizedOp,
        batch: normalizedBatch,
        quantity: qty,
        // Estágio inicial padronizado com o enum ProductStage
        currentStage: 'PRODUCAO_1KG',
        // Status padronizado com ProductStatus
        status: 'ACTIVE',
        // MOD responsável
        createdById: modOperatorId
      }
    })

    console.log('=== API PRODUCTS: Produto criado ===', product.id)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error: any) {
    console.error('=== API PRODUCTS: Erro ao criar produto ===', error)
    
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
      error: 'Erro ao criar produto'
    }, { status: 500 })
  }
}