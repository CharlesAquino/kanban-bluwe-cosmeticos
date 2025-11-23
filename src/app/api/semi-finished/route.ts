import { NextRequest, NextResponse } from 'next/server'

// Mock data para semi-finished items
const mockSemiFinished = [
  {
    id: 'mock-semi-1',
    name: 'Gel Construtor 500ml',
    family: 'Gel',
    op: 'OP001',
    batch: 'L001',
    quantity_total: 1000,
    quantity_envasado: 800,
    status: 'aguardando',
    manufacturingDate: new Date('2024-11-20'),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'mock-semi-2',
    name: 'Creme Hidratante 200ml',
    family: 'Creme',
    op: 'OP002',
    batch: 'L002',
    quantity_total: 500,
    quantity_envasado: 300,
    status: 'envasando',
    manufacturingDate: new Date('2024-11-21'),
    created_at: new Date(),
    updated_at: new Date(),
  }
]

// GET /api/semi-finished - Lista itens de semi-acabados
export async function GET() {
  try {
    console.log('=== API SEMI-FINISHED: Retornando itens mock ===')

    return NextResponse.json({ success: true, data: mockSemiFinished })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}
