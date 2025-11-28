/**
 * POST /api/products/:id/transition
 * 
 * Transicionar um produto para o próximo estágio
 * Valida a transição e registra o evento
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger, createRequestContext } from '@/lib/logger'
import { withMetrics } from '@/lib/api-metrics-wrapper'
import { 
  executeTransition,
  getNextStates 
} from '@/lib/product-state-machine'
import { logStageTransition, logStageRejected } from '@/lib/event-log'
import { ProductStage } from '@prisma/client'

const postHandler = async (request?: NextRequest) => {
  const startTime = Date.now()

  try {
    logger.apiRequest('POST', '/api/products/:id/transition')

    if (!request) {
      return NextResponse.json({
        success: false,
        error: 'Request inválido'
      }, { status: 400 })
    }

    // Extrair ID da URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const productId = pathParts[pathParts.length - 2]

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'productId é obrigatório'
      }, { status: 400 })
    }

    // Extrair body
    const body = await request.json()
    const { toStage, reason, userId } = body

    // Validações
    if (!toStage || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: toStage, userId'
      }, { status: 400 })
    }

    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Validar transição
    const validation = await executeTransition(
      {
        productId,
        currentStage: product.currentStage as ProductStage,
        userId,
        reason
      },
      toStage as ProductStage
    )

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Transição inválida'
      }, { status: 409 })
    }

    // Atualizar produto no banco
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        currentStage: toStage as ProductStage,
        updatedById: userId
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Registrar evento
    if (toStage === 'REJEITADO') {
      logStageRejected(
        productId,
        product.currentStage as ProductStage,
        userId,
        reason || 'Rejeitado'
      )
    } else {
      logStageTransition(
        productId,
        product.currentStage as ProductStage,
        toStage as ProductStage,
        userId,
        reason
      )
    }

    logger.apiSuccess('POST', '/api/products/:id/transition', {
      ...createRequestContext(startTime),
      productId,
      from: product.currentStage,
      to: toStage
    })

    return NextResponse.json({
      success: true,
      data: {
        product: updatedProduct,
        transition: {
          from: product.currentStage,
          to: toStage,
          reason,
          timestamp: new Date().toISOString()
        }
      }
    }, { status: 200 })

  } catch (error) {
    logger.apiError('POST', '/api/products/:id/transition', error as Error, {
      ...createRequestContext(startTime)
    })

    return NextResponse.json({
      success: false,
      error: 'Erro ao transicionar produto',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export const POST = withMetrics('POST', '/api/products/:id/transition', postHandler)

/**
 * GET /api/products/:id/transitions
 * 
 * Obter próximas transições possíveis para um produto
 */
const getHandler = async (request?: NextRequest) => {
  const startTime = Date.now()

  try {
    logger.apiRequest('GET', '/api/products/:id/transitions')

    if (!request) {
      return NextResponse.json({
        success: false,
        error: 'Request inválido'
      }, { status: 400 })
    }

    // Extrair ID da URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const productId = pathParts[pathParts.length - 2]

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'productId é obrigatório'
      }, { status: 400 })
    }

    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, currentStage: true }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    // Obter próximas transições
    const nextStates = getNextStates(product.currentStage as ProductStage)

    logger.apiSuccess('GET', '/api/products/:id/transitions', {
      ...createRequestContext(startTime),
      productId,
      currentStage: product.currentStage,
      nextStatesCount: nextStates.length
    })

    return NextResponse.json({
      success: true,
      data: {
        productId,
        currentStage: product.currentStage,
        nextStates,
        canTransition: nextStates.length > 0
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.apiError('GET', '/api/products/:id/transitions', error as Error, {
      ...createRequestContext(startTime)
    })

    return NextResponse.json({
      success: false,
      error: 'Erro ao obter transições',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export const GET = withMetrics('GET', '/api/products/:id/transitions', getHandler)
