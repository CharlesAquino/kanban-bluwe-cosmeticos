/**
 * Serviço centralizado para operações de produto
 * Conectado às APIs reais do sistema Kanban
 */

import type { Product, ProductStage, ProductStatus, StageHistory } from './types'
import { apiFetch } from './api-fetch'

export interface FinalizeProductParams {
  productId: string
  mod?: string | number
}

export interface AdvanceStageParams {
  productId: string
  nextStage: ProductStage
  mod?: string | number
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
 * Carrega produtos e estatísticas com timeout e fallback
 */
export async function loadProducts(): Promise<{ products: Product[]; stats: any }> {
  try {
    // Timeout de 15 segundos para cold start do PostgreSQL
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao carregar dados (possível cold start do banco)')), 15000)
    )

    const dataPromise = Promise.all([
      apiFetch<{ success: boolean; data?: Product[]; error?: string }>('/api/products'),
      apiFetch<{ success: boolean; data?: any; error?: string }>('/api/stats')
    ])

    const [productsData, statsData] = await Promise.race([
      dataPromise,
      timeoutPromise
    ])

    if (!productsData.success || !productsData.data) {
      console.warn('⚠️ Produtos não carregados, usando array vazio')
      return { 
        products: [], 
        stats: statsData?.data || { total: 0, inProgress: 0, paused: 0, completed: 0, blocked: 0 } 
      }
    }

    if (!statsData.success || !statsData.data) {
      console.warn('⚠️ Stats não carregadas, usando valores padrão')
      return { 
        products: productsData.data, 
        stats: { total: 0, inProgress: 0, paused: 0, completed: 0, blocked: 0 } 
      }
    }

    return { products: productsData.data, stats: statsData.data }
  } catch (error) {
    console.error('❌ loadProducts error:', error)
    // Retornar dados vazios em vez de travar o sistema
    return { 
      products: [], 
      stats: { total: 0, inProgress: 0, paused: 0, completed: 0, blocked: 0 } 
    }
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
