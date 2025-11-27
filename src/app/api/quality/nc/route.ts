/**
 * API Route: GET/POST /api/quality/nc
 * Listar e criar não-conformidades
 */

import { NextRequest, NextResponse } from 'next/server'
import { nonConformityQueries } from '@/lib/db/queries/non-conformities'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const status = searchParams.get('status')

    let ncs

    if (productId) {
      ncs = await nonConformityQueries.getByProduct(productId)
    } else if (status === 'open') {
      ncs = await nonConformityQueries.getOpen()
    } else {
      ncs = await nonConformityQueries.getAll()
    }

    return NextResponse.json({
      success: true,
      data: ncs,
    })
  } catch (error) {
    console.error('Erro ao buscar não-conformidades:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar não-conformidades',
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
      type,
      severity,
      description,
      responsible,
      deadline,
    } = body

    // Validar campos obrigatórios
    if (
      !productId ||
      !productName ||
      !batch ||
      !stage ||
      !type ||
      !severity ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios não preenchidos',
        },
        { status: 400 }
      )
    }

    const nc = await nonConformityQueries.create({
      productId,
      productName,
      batch,
      stage,
      type,
      severity,
      description,
      responsible,
      deadline,
    })

    return NextResponse.json(
      {
        success: true,
        data: nc,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar não-conformidade:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar não-conformidade',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
