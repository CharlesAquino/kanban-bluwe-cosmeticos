import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENV } from '@/lib/environment'
import { logger, createRequestContext } from '@/lib/logger'
import { withMetrics } from '@/lib/api-metrics-wrapper'

const getHandler = async () => {
  const startTime = Date.now()
  
  try {
    logger.apiRequest('GET', '/api/products')

    // Buscar produtos reais do banco via Prisma
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Filtrar quaisquer registros legados de mocks que possam ter permanecido no banco
    // Critérios: ids começando com 'mock-prod-' ou nomes começando com 'Produto Mock'
    const filteredProducts = products.filter((product) => {
      const id = String(product.id)
      const name = String(product.name)
      const isMockId = id.startsWith('mock-prod-')
      const isMockName = name.toLowerCase().startsWith('produto mock')
      return !isMockId && !isMockName
    })

    logger.apiSuccess('GET', '/api/products', {
      ...createRequestContext(startTime),
      count: filteredProducts.length
    })

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      meta: {
        count: filteredProducts.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.apiError('GET', '/api/products', error as Error, {
      ...createRequestContext(startTime),
      env: process.env.NODE_ENV,
      dbConfigured: !!ENV.databaseUrl
    })

    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar produtos',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      hint: !ENV.databaseUrl ? 'DATABASE_URL não configurada' : undefined
    }, { status: 500 })
  }
}

export const GET = withMetrics('GET', '/api/products', getHandler)

const postHandler = async (request: NextRequest) => {
  const startTime = Date.now()
  
  try {
    logger.apiRequest('POST', '/api/products')

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

    // Verificar duplicidade OP+Lote (Product e SemiFinishedItem)
    const [existingProduct, existingSemi] = await Promise.all([
      prisma.product.findFirst({
        where: {
          op: normalizedOp,
          batch: normalizedBatch
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
      return NextResponse.json({
        success: false,
        error: `OP "${normalizedOp}" com Lote "${normalizedBatch}" já existe em produção`
      }, { status: 409 })
    }

    if (existingSemi) {
      return NextResponse.json({
        success: false,
        error: `OP "${normalizedOp}" com Lote "${normalizedBatch}" já existe em semi-acabados`
      }, { status: 409 })
    }

    // Criar produto via Prisma
    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        op: normalizedOp,
        batch: normalizedBatch,
        quantity: qty,
        currentStage: 'PRODUCAO_1KG',
        status: 'ACTIVE',
        createdById: modOperatorId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    logger.apiSuccess('POST', '/api/products', {
      ...createRequestContext(startTime),
      productId: product.id,
      op: product.op,
      batch: product.batch
    })

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 })
    
  } catch (error) {
    logger.apiError('POST', '/api/products', error as Error, {
      ...createRequestContext(startTime)
    })

    // Tratar violação de constraint única (Prisma)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'OP e Lote já estão em uso'
      }, { status: 409 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro ao criar produto',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export const POST = withMetrics('POST', '/api/products', postHandler)