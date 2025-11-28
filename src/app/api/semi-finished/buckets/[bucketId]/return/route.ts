import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function POST(_request: NextRequest, { params }: { params: { bucketId: string } }) {
  try {
    // Buscar o balde
    const bucket = await prisma.semiFinishedBucket.findUnique({
      where: { id: params.bucketId }
    })

    if (!bucket) {
      return NextResponse.json({ success: false, error: 'Balde não encontrado' }, { status: 404 })
    }

    // Atualizar status para 'returned'
    const updatedBucket = await prisma.semiFinishedBucket.update({
      where: { id: params.bucketId },
      data: {
        status: 'returned',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        bucketId: updatedBucket.id,
        status: updatedBucket.status
      }
    })
  } catch (error) {
    console.error('Erro ao devolver balde:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', details: message }, { status: 500 })
  }
}
