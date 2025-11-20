/**
 * Serviço centralizado para operações de produto - Versão Mock para GitHub Pages
 * Aplicando princípios de clean code:
 * - Single Responsibility: Cada função faz uma coisa específica
 * - Mock Data: Dados simulados para funcionamento sem APIs
 * - Type Safety: Tipagem adequada
 */

import type { Product, ProductStage, ProductStatus, StageHistory, BottleneckReport } from './types'
// Mock broadcast change para GitHub Pages
function broadcastChange(event: { type: string; action: string }) {
  console.log('📢 BroadcastChange (Mock):', event)
}
import { mutate } from 'swr'

// Mock helper para GitHub Pages (sem APIs)
function createMockResult<T>(data: T, success = true): { success: boolean; data?: T; error?: string } {
  return { success, data, error: success ? undefined : 'Erro simulado' }
}

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: Date.now().toString(),
    name: 'Produto Mock',
    op: 'OP001',
    batch: 'B001',
    quantity: 1000,
    currentStage: 'BACKLOG',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stageHistory: [],
    hourlyControls: [],
    bottleneckReports: [],
    ...overrides
  }
}

export interface ProductOperationResult {
  success: boolean
  data?: Product
  error?: string
  details?: string
}

/**
 * Finaliza produto (envia para Semi-Acabados) - Mock
 */
export async function finalizeProduct(productId: string): Promise<ProductOperationResult> {
  try {
    console.log('🔄 finalizeProduct: Mock operation para GitHub Pages')
    
    const mockProduct = createMockProduct({
      id: productId,
      currentStage: 'APROVADO',
      status: 'COMPLETED'
    })
    
    broadcastChange({ type: 'semi_finished', action: 'create' })
    mutate('/api/products')
    mutate('/api/semi-finished')

    return { success: true, data: mockProduct }
  } catch (error) {
    console.error('Erro ao finalizar produto:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Avança produto para próximo estágio - Mock
 */
export async function advanceStage(productId: string): Promise<ProductOperationResult> {
  try {
    console.log('🔄 advanceStage: Mock operation para GitHub Pages')
    
    const mockProduct = createMockProduct({
      id: productId,
      currentStage: 'PRODUCAO_1KG',
      status: 'ACTIVE'
    })
    
    broadcastChange({ type: 'product', action: 'update' })
    mutate('/api/products')

    return { success: true, data: mockProduct }
  } catch (error) {
    console.error('Erro ao avançar estágio:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Pausa produto - Mock
 */
export async function pauseProduct(productId: string, reason?: string): Promise<ProductOperationResult> {
  try {
    console.log('🔄 pauseProduct: Mock operation para GitHub Pages')
    
    const mockProduct = createMockProduct({
      id: productId,
      status: 'PAUSED'
    })
    
    broadcastChange({ type: 'product', action: 'pause' })
    mutate('/api/products')

    return { success: true, data: mockProduct }
  } catch (error) {
    console.error('Erro ao pausar produto:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Retoma produto - Mock
 */
export async function resumeProduct(productId: string): Promise<ProductOperationResult> {
  try {
    console.log('🔄 resumeProduct: Mock operation para GitHub Pages')
    
    const mockProduct = createMockProduct({
      id: productId,
      status: 'ACTIVE'
    })
    
    broadcastChange({ type: 'product', action: 'resume' })
    mutate('/api/products')

    return { success: true, data: mockProduct }
  } catch (error) {
    console.error('Erro ao retomar produto:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Bloqueia produto - Mock
 */
export async function blockProduct(productId: string, reason: string): Promise<ProductOperationResult> {
  try {
    console.log('🔄 blockProduct: Mock operation para GitHub Pages')
    
    const mockProduct = createMockProduct({
      id: productId,
      status: 'BLOCKED'
    })
    
    broadcastChange({ type: 'product', action: 'block' })
    mutate('/api/products')

    return { success: true, data: mockProduct }
  } catch (error) {
    console.error('Erro ao bloquear produto:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Carrega produtos e estatísticas - Mock
 */
export async function loadProductsAndStats(): Promise<{
  products: Product[]
  stats: {
    total: number
    inProgress: number
    paused: number
    completed: number
    blocked: number
  }
}> {
  console.log('🚀 LOADING DATA: Usando dados mock (GitHub Pages)')

  const products: Product[] = [
    createMockProduct({
      id: '1',
      name: 'Produto Mock 1',
      op: 'OP001',
      batch: 'B001',
      quantity: 1000,
      currentStage: 'BACKLOG',
      status: 'ACTIVE'
    }),
    createMockProduct({
      id: '2',
      name: 'Produto Mock 2',
      op: 'OP002',
      batch: 'B002',
      quantity: 1500,
      currentStage: 'PRODUCAO_1KG',
      status: 'PAUSED'
    }),
    createMockProduct({
      id: '3',
      name: 'Produto Mock 3',
      op: 'OP003',
      batch: 'B003',
      quantity: 2000,
      currentStage: 'APROVADO',
      status: 'COMPLETED'
    })
  ]

  const semiFinishedCount = 2

  const inProgress = products.filter((p) => String(p.status).toUpperCase() === 'ACTIVE').length
  const paused = products.filter((p) => String(p.status).toUpperCase() === 'PAUSED').length
  const blocked = products.filter((p) => String(p.status).toUpperCase() === 'BLOCKED').length
  const completedFromProducts = products.filter((p) => String(p.status).toUpperCase() === 'COMPLETED').length
  const completed = completedFromProducts + semiFinishedCount

  const stats = {
    total: products.length,
    inProgress,
    paused,
    completed,
    blocked
  }

  return { products, stats }
}

/**
 * Avança estágio do produto (alias) - Mock
 */
export async function advanceProductStage(productId: string): Promise<ProductOperationResult> {
  return advanceStage(productId)
}

/**
 * Deleta produto - Mock
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ deleteProduct: Mock operation para GitHub Pages')
    
    broadcastChange({ type: 'product', action: 'delete' })
    mutate('/api/products')

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
