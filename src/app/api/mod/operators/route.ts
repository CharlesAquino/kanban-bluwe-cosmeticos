import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENV } from '@/lib/environment'
import { logger, createRequestContext } from '@/lib/logger'
import { withMetrics } from '@/lib/api-metrics-wrapper'
import bcrypt from 'bcryptjs'

const getHandler = async () => {
  const startTime = Date.now()
  
  try {
    logger.apiRequest('GET', '/api/mod/operators')

    // Buscar usuários com role OPERATOR ou MANAGER
    const operators = await prisma.user.findMany({
      where: {
        role: {
          in: ['OPERATOR', 'MANAGER']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    logger.apiSuccess('GET', '/api/mod/operators', {
      ...createRequestContext(startTime),
      count: operators.length
    })

    return NextResponse.json({
      success: true,
      data: operators,
      meta: {
        count: operators.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.apiError('GET', '/api/mod/operators', error as Error, {
      ...createRequestContext(startTime),
      dbConfigured: !!ENV.databaseUrl
    })

    return NextResponse.json({
      success: false,
      error: 'Erro ao listar operadores',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export const GET = withMetrics('GET', '/api/mod/operators', getHandler)

const postHandler = async (request: NextRequest) => {
  const startTime = Date.now()
  
  try {
    logger.apiRequest('POST', '/api/mod/operators')

    const body = await request.json()
    const { name, email, password, role = 'OPERATOR' } = body

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: name, email, password'
      }, { status: 400 })
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email já cadastrado'
      }, { status: 409 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar operador
    const operator = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role as 'OPERATOR' | 'MANAGER' | 'ADMIN' | 'VIEWER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    logger.apiSuccess('POST', '/api/mod/operators', {
      ...createRequestContext(startTime),
      operatorId: operator.id,
      email: operator.email
    })

    return NextResponse.json({
      success: true,
      data: operator
    }, { status: 201 })
    
  } catch (error) {
    logger.apiError('POST', '/api/mod/operators', error as Error, {
      ...createRequestContext(startTime)
    })

    // Tratar violação de constraint única
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Email já cadastrado'
      }, { status: 409 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro ao criar operador',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export const POST = withMetrics('POST', '/api/mod/operators', postHandler)
