/**
 * API Route: PATCH /api/tags/[id] - Atualizar tag
 * API Route: DELETE /api/tags/[id] - Excluir tag
 */

import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/mock-prisma' // Temporário - usar real quando Prisma gerar

interface RouteParams {
  params: { id: string }
}

// PATCH /api/tags/[id] - Atualizar tag
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    return NextResponse.json(
      { error: 'Atualização de tags está temporariamente desativada neste ambiente.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Erro ao atualizar tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/tags/[id] - Excluir tag
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    return NextResponse.json(
      { error: 'Exclusão de tags está temporariamente desativada neste ambiente.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Erro ao excluir tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
