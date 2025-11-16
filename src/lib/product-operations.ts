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
import { broadcastChange } from './bus'
import { apiFetch } from './api-fetch'
import { mutate } from 'swr'

export interface ProductOperationResult {
  success: boolean
  data?: Product
  error?: string
  details?: string
}

/**
 * Finaliza produto (envia para Semi-Acabados)
 */
export async function finalizeProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}/finalize`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

    broadcastChange({ type: 'semi_finished', action: 'create' })
    // Revalidação imediata nas listas
    try {
      mutate('/api/products')
      mutate('/api/semi-finished')
    } catch {}
    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao finalizar produto:', error)
    return {
      success: false,
      error: 'Erro interno do servidor',
    }
  }
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
  metadata?: Record<string, unknown>
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
  metadata?: Record<string, unknown>
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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${params.productId}/advance`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStage: params.nextStage, mod: params.mod })
      }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
      broadcastChange({ type: 'products', action: 'advance' })
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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}/pause`,
      { method: 'POST' }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
      broadcastChange({ type: 'products', action: 'pause' })
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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}/resume`,
      { method: 'POST' }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
      broadcastChange({ type: 'products', action: 'resume' })
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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${params.productId}/block`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: params.reason }) }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
      broadcastChange({ type: 'products', action: 'block' })
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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}`,
      { method: 'DELETE' }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
 * Versão ultra-simplificada para garantir funcionamento
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
  console.log('🚀 LOADING DATA: Carregando produtos da API')

  const json = await apiFetch<{ success: boolean; data: Product[]; error?: string }>('/api/products', { cache: 'no-store' })
  if (!json.success) throw new Error(json.error || 'Falha ao carregar produtos')
  const products = json.data || []

  // Buscar também itens de Semi-Acabados para compor o total de concluídos
  let semiFinishedCount = 0
  try {
    const semiJson = await apiFetch<{ success: boolean; data: unknown[]; error?: string }>('/api/semi-finished', {
      cache: 'no-store',
    })
    if (semiJson.success && Array.isArray(semiJson.data)) {
      semiFinishedCount = semiJson.data.length
    }
  } catch (e) {
    console.warn('Falha ao carregar semi-acabados para stats, usando 0:', e)
  }

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
    blocked,
  }

  return { products, stats }
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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      '/api/products',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
      broadcastChange({ type: 'products', action: 'create' })
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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${params.productId}/advance-detailed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextStage: params.nextStage,
          mod: params.mod,
          operator: params.operator,
          shift: params.shift,
          notes: params.notes,
          targetDuration: params.targetDuration
        })
      }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      '/api/hourly-control',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/reports/bottlenecks/${productId}`,
      { method: 'POST' }
    )
    if (!data.success) return { success: false, error: data.error || 'Erro', details: data.details }

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
    const data = await apiFetch<{ success: boolean; data?: BottleneckReportData[]; error?: string }>(
      '/api/reports/bottlenecks'
    )
    if (!data.success) return { success: false, error: data.error || 'Erro' }
    return { success: true, data: data.data }
  } catch (error) {
    console.error('Erro ao obter relatórios de gargalos:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}
