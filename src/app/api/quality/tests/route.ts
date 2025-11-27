/**
 * API Route: GET/POST /api/quality/tests
 * Listar e criar testes de qualidade
 */

import { NextRequest, NextResponse } from 'next/server'
import { qualityTestQueries } from '@/lib/db/queries/quality-tests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let tests

    if (productId) {
      tests = await qualityTestQueries.getByProduct(productId)
    } else if (startDate && endDate) {
      tests = await qualityTestQueries.getByDate(startDate, endDate)
    } else {
      tests = await qualityTestQueries.getAll()
    }

    return NextResponse.json({
      success: true,
      data: tests,
    })
  } catch (error) {
    console.error('Erro ao buscar testes de qualidade:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar testes de qualidade',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      productId,
      productName,
      batch,
      stage,
      parameter,
      targetValue,
      tolMin,
      tolMax,
      measuredValue,
      unit,
      operator,
      notes,
    } = body

    // Validar campos obrigatórios
    if (
      !productId ||
      !productName ||
      !batch ||
      !stage ||
      !parameter ||
      targetValue === undefined ||
      tolMin === undefined ||
      tolMax === undefined ||
      measuredValue === undefined ||
      !unit ||
      !operator
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios não preenchidos',
        },
        { status: 400 }
      )
    }

    const test = await qualityTestQueries.create({
      productId,
      productName,
      batch,
      stage,
      parameter,
      targetValue: Number(targetValue),
      tolMin: Number(tolMin),
      tolMax: Number(tolMax),
      measuredValue: Number(measuredValue),
      unit,
      operator,
      notes,
    })

    return NextResponse.json(
      {
        success: true,
        data: test,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar teste de qualidade:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar teste de qualidade',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
