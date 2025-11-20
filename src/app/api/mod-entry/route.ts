import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('=== API PRODUÇÃO MANUAL: Recebendo dados ===', body)

    const {
      operadorId,
      produtoCategoria,
      loteOP,
      quantidadeKg,
      etapaAtual,
      tempoInicio,
      status,
      observacoes
    } = body

    // Validar campos obrigatórios
    if (!operadorId || !loteOP || !quantidadeKg || !etapaAtual) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios não preenchidos'
      }, { status: 400 })
    }

    // Criar registro de produção
    const producao = await prisma.product.create({
      data: {
        name: `${produtoCategoria} - ${loteOP}`,
        op: loteOP,
        batch: `${produtoCategoria}-${new Date().toISOString().slice(0, 10)}`,
        quantity: quantidadeKg,
        currentStage: etapaAtual,
        status: status === 'EM_ANDAMENTO' ? 'active' : status === 'CONCLUIDO' ? 'completed' : 'paused',
        notes: observacoes || `Operador: ${operadorId} | Categoria: ${produtoCategoria}`,
        createdAt: tempoInicio ? new Date(tempoInicio) : new Date(),
        updatedAt: new Date(),
        createdById: operadorId,
        updatedById: operadorId
      }
    })

    console.log('=== API PRODUÇÃO MANUAL: Produção criada ===', producao.id)

    return NextResponse.json({
      success: true,
      data: producao
    })

  } catch (error) {
    console.error('=== API PRODUÇÃO MANUAL: Erro ao salvar ===', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save production data'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    console.log('=== API PRODUÇÃO MANUAL: Buscando produções ===')

    const producoes = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar para performance
    })

    console.log('=== API PRODUÇÃO MANUAL: Produções encontradas ===', producoes.length)

    return NextResponse.json({
      success: true,
      data: producoes
    })

  } catch (error) {
    console.error('=== API PRODUÇÃO MANUAL: Erro ao buscar ===', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch production data'
    }, { status: 500 })
  }
}
