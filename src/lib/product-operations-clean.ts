/**
 * Serviço centralizado para operações de produto
 * Aplicando princípios de clean code:
 * - Single Responsibility: Cada função faz uma coisa específica
 * - DRY: Eliminação de código duplicado
 * - Error Handling: Tratamento consistente de erros
 * - Type Safety: Tipagem adequada
 * - Monitoring: Integração automática com monitoramento de processos
 */

import type { Product, ProductStage } from './types'

export interface ProductOperationResult {
  success: boolean
  data?: Product
  error?: string
  details?: string
}

export interface AdvanceStageParams {
  productId: string
  nextStage: ProductStage
  mod: number
}

export interface BlockProductionParams {
  productId: string
  reason: string
}

// Callback para monitoramento de processos
type ProcessMonitorCallback = (event: {
  productId: string
  productName: string
  action: string
  fromStage?: ProductStage
  toStage?: ProductStage
  metadata?: Record<string, any>
}) => void

let processMonitorCallback: ProcessMonitorCallback | null = null

/**
 * Define callback para monitoramento de processos
 */
export function setProcessMonitorCallback(callback: ProcessMonitorCallback) {
  processMonitorCallback = callback
}

/**
 * Notifica o sistema de monitoramento sobre ações realizadas
 */
function notifyProcessMonitor(event: {
  productId: string
  productName: string
  action: string
  fromStage?: ProductStage
  toStage?: ProductStage
  metadata?: Record<string, any>
}) {
  if (processMonitorCallback) {
    processMonitorCallback(event)
  }
}

/**
 * Avança produto para próximo estágio
 */
export async function advanceProductStage(params: AdvanceStageParams): Promise<ProductOperationResult> {
  try {
    const response = await fetch(`/api/products/${params.productId}/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nextStage: params.nextStage,
        mod: params.mod
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    // Notificar monitoramento sobre avanço de estágio
    if (data.data) {
      notifyProcessMonitor({
        productId: params.productId,
        productName: data.data.name,
        action: 'stage_advance',
        fromStage: data.data.currentStage, // Estágio anterior
        toStage: params.nextStage,
        metadata: {
          mod: params.mod,
          timestamp: new Date().toISOString()
        }
      })
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao avançar estágio:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Pausa produção de produto
 */
export async function pauseProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const response = await fetch(`/api/products/${productId}/pause`, {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    // Notificar monitoramento sobre pausa
    if (data.data) {
      notifyProcessMonitor({
        productId,
        productName: data.data.name,
        action: 'stage_pause',
        metadata: {
          timestamp: new Date().toISOString()
        }
      })
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao pausar produção:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Retoma produção de produto
 */
export async function resumeProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const response = await fetch(`/api/products/${productId}/resume`, {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    // Notificar monitoramento sobre retomada
    if (data.data) {
      notifyProcessMonitor({
        productId,
        productName: data.data.name,
        action: 'stage_resume',
        metadata: {
          timestamp: new Date().toISOString()
        }
      })
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao retomar produção:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Bloqueia produção de produto
 */
export async function blockProduct(params: BlockProductionParams): Promise<ProductOperationResult> {
  try {
    const response = await fetch(`/api/products/${params.productId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: params.reason }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    // Notificar monitoramento sobre bloqueio
    if (data.data) {
      notifyProcessMonitor({
        productId: params.productId,
        productName: data.data.name,
        action: 'stage_block',
        metadata: {
          reason: params.reason,
          timestamp: new Date().toISOString()
        }
      })
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao bloquear produção:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Remove produto do sistema
 */
export async function deleteProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Carrega produtos e estatísticas do servidor
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
  try {
    const [productsResponse, statsResponse] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/stats')
    ])

    // Validação robusta das respostas
    if (!productsResponse.ok || !statsResponse.ok) {
      throw new Error(`Erro nas APIs: produtos=${productsResponse.status}, stats=${statsResponse.status}`)
    }

    const [productsData, statsData] = await Promise.all([
      productsResponse.json(),
      statsResponse.json()
    ])

    if (!productsData.success || !statsData.success) {
      throw new Error('Dados inválidos das APIs')
    }

    return {
      products: productsData.data || [],
      stats: statsData.data || {
        total: 0,
        inProgress: 0,
        paused: 0,
        completed: 0,
        blocked: 0
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    return {
      products: [],
      stats: {
        total: 0,
        inProgress: 0,
        paused: 0,
        completed: 0,
        blocked: 0
      }
    }
  }
}

/**
 * Cria novo produto no sistema
 */
export async function createProduct(productData: {
  name: string
  op: string
  batch: string
  quantity: number
}): Promise<ProductOperationResult> {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    // Notificar monitoramento sobre criação de produto
    if (data.data) {
      notifyProcessMonitor({
        productId: data.data.id,
        productName: data.data.name,
        action: 'product_create',
        metadata: {
          op: data.data.op,
          batch: data.data.batch,
          quantity: data.data.quantity,
          timestamp: new Date().toISOString()
        }
      })
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

export interface DetailedAdvanceStageParams extends AdvanceStageParams {
  operator?: string
  shift?: 'morning' | 'afternoon' | 'night'
  notes?: string
  targetDuration?: number // Duração esperada em minutos
}

export interface BottleneckReportData {
  productId: string
  stage: ProductStage
  waitingTime: number
  stageDuration: number
  bottleneckScore: number
  recommendations?: string
}

/**
 * Avança produto para próximo estágio com controle detalhado
 */
export async function advanceProductStageDetailed(params: DetailedAdvanceStageParams): Promise<ProductOperationResult> {
  try {
    const response = await fetch(`/api/products/${params.productId}/advance-detailed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nextStage: params.nextStage,
        mod: params.mod,
        operator: params.operator,
        shift: params.shift,
        notes: params.notes,
        targetDuration: params.targetDuration
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao avançar estágio detalhado:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Registra controle hora a hora para um produto
 */
export async function registerHourlyControl(params: {
  productId: string
  productName: string
  date: string
  shift: 'morning' | 'afternoon' | 'night'
  operator: string
  targetQuantity: number
  actualQuantity: number
  efficiency: number
  status: 'on_track' | 'behind' | 'ahead' | 'completed'
  notes?: string
  stage: ProductStage
}): Promise<ProductOperationResult> {
  try {
    const response = await fetch('/api/hourly-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao registrar controle hora a hora:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Gera relatório de gargalos baseado no histórico de estágios
 */
export async function generateBottleneckReport(productId: string): Promise<ProductOperationResult> {
  try {
    const response = await fetch(`/api/reports/bottlenecks/${productId}`, {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`,
        details: data.details
      }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao gerar relatório de gargalos:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}

/**
 * Obtém relatório geral de gargalos do sistema
 */
export async function getBottleneckReports(): Promise<{
  success: boolean
  data?: BottleneckReportData[]
  error?: string
}> {
  try {
    const response = await fetch('/api/reports/bottlenecks')

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Erro ${response.status}`
      }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao obter relatórios de gargalos:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}
