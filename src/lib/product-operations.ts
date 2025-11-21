/**
 * Serviço centralizado para operações de produto
 * Conectado às APIs reais do sistema Kanban
 */

import type { Product, ProductStage, ProductStatus, StageHistory } from './types-modern'
import { apiFetch } from './api-fetch'

export interface FinalizeProductParams {
  productId: string
  mod?: string
}

export interface AdvanceStageParams {
  productId: string
  nextStage: ProductStage
  mod?: string
}

export interface ProductOperationResult {
  success: boolean
  data?: Product
  error?: string
  details?: string
}

/**
 * Finaliza produto (envia para Semi-Acabados)
 * Aceita tanto uma string (productId) quanto um objeto com parâmetros completos
 */
export async function finalizeProduct(
  paramsOrId: FinalizeProductParams | string
): Promise<ProductOperationResult> {
  try {
    const params: FinalizeProductParams =
      typeof paramsOrId === 'string'
        ? { productId: paramsOrId }
        : paramsOrId

    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${params.productId}/finalize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mod: params.mod })
      }
    )
    
    if (!data.success) {
      return { success: false, error: data.error || 'Erro ao finalizar produto', details: data.details }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('❌ finalizeProduct error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao finalizar produto' 
    }
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
    
    if (!data.success) {
      return { success: false, error: data.error || 'Erro ao avançar estágio', details: data.details }
    }

    // Notificar monitoramento sobre avanço de estágio
    if (data.data) {
      notifyProcessMonitor({
        productId: params.productId,
        productName: data.data.name,
        action: 'stage_advance',
        fromStage: data.data.currentStage,
        toStage: params.nextStage,
        timestamp: new Date().toISOString()
      })
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('❌ advanceProductStage error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao avançar estágio' 
    }
  }
}

/**
 * Pausa produto
 */
export async function pauseProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}/pause`,
      { method: 'POST' }
    )
    
    if (!data.success) {
      return { success: false, error: data.error || 'Erro ao pausar produto', details: data.details }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('❌ pauseProduct error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao pausar produto' 
    }
  }
}

/**
 * Retoma produto
 */
export async function resumeProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}/resume`,
      { method: 'POST' }
    )
    
    if (!data.success) {
      return { success: false, error: data.error || 'Erro ao retomar produto', details: data.details }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('❌ resumeProduct error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao retomar produto' 
    }
  }
}

/**
 * Bloqueia produto
 */
export async function blockProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}/block`,
      { method: 'POST' }
    )
    
    if (!data.success) {
      return { success: false, error: data.error || 'Erro ao bloquear produto', details: data.details }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('❌ blockProduct error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao bloquear produto' 
    }
  }
}

/**
 * Carrega produtos e estatísticas
 */
export async function loadProducts(): Promise<{ products: Product[]; stats: any }> {
  try {
    const [productsData, statsData] = await Promise.all([
      apiFetch<{ success: boolean; data?: Product[]; error?: string }>('/api/products'),
      apiFetch<{ success: boolean; data?: any; error?: string }>('/api/stats')
    ])

    if (!productsData.success || !productsData.data) {
      throw new Error(productsData.error || 'Erro ao carregar produtos')
    }

    if (!statsData.success || !statsData.data) {
      console.warn('⚠️ Could not load stats, using empty object')
      return { products: productsData.data, stats: {} }
    }

    return { products: productsData.data, stats: statsData.data }
  } catch (error) {
    console.error('❌ loadProducts error:', error)
    throw error
  }
}

/**
 * Avança estágio do produto (alias)
 */
export { advanceProductStage as advanceStage }

/**
 * Carrega produtos e estatísticas (alias para compatibilidade)
 */
export { loadProducts as loadProductsAndStats }

/**
 * Deleta produto
 */
export async function deleteProduct(productId: string): Promise<ProductOperationResult> {
  try {
    const data = await apiFetch<{ success: boolean; data?: Product; error?: string; details?: string }>(
      `/api/products/${productId}`,
      { method: 'DELETE' }
    )
    
    if (!data.success) {
      return { success: false, error: data.error || 'Erro ao deletar produto', details: data.details }
    }

    return { success: true, data: data.data }
  } catch (error) {
    console.error('❌ deleteProduct error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar produto' 
    }
  }
}

/**
 * Notifica o sistema de monitoramento de processos
 */
interface ProcessMonitorNotification {
  productId: string
  productName: string
  action: 'stage_advance' | 'finalize' | 'pause' | 'resume' | 'block'
  fromStage?: ProductStage
  toStage?: ProductStage
  timestamp: string
}

async function notifyProcessMonitor(notification: ProcessMonitorNotification): Promise<void> {
  try {
    await apiFetch('/api/process-monitor/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    })
  } catch (error) {
    // Não falhar a operação principal se o monitoramento falhar
    console.warn('⚠️ Could not notify process monitor:', error)
  }
}
