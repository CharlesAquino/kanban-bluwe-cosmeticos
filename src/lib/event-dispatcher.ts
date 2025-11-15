/**
 * EVENT DISPATCHER - Conecta Sistema com Neural Orchestrator
 * 
 * Intercepta eventos do sistema e dispara análises neurais automaticamente
 */

import { neural, type EventType, type NeuralEvent } from './neural-orchestrator'

class EventDispatcher {
  private enabled = process.env.NEURAL_ENABLED !== 'false' // Habilitado por padrão

  /**
   * Dispara evento neural automaticamente
   */
  async dispatch(type: EventType, payload: Record<string, unknown>, source: string) {
    if (!this.enabled) {
      console.log(`[Dispatcher] Neural desabilitado, evento ignorado: ${type}`)
      return
    }

    const event: NeuralEvent = {
      type,
      timestamp: new Date().toISOString(),
      payload,
      source
    }

    try {
      // Processamento assíncrono não-bloqueante
      neural.processEvent(event).catch(error => {
        console.error(`[Dispatcher] Erro processando evento ${type}:`, error)
      })
    } catch (error) {
      // Nunca deixa eventos quebrarem o sistema principal
      console.error(`[Dispatcher] Erro fatal no dispatcher:`, error)
    }
  }

  enable() {
    this.enabled = true
    console.log('[Dispatcher] Sistema neural HABILITADO')
  }

  disable() {
    this.enabled = false
    console.log('[Dispatcher] Sistema neural DESABILITADO')
  }
}

export const dispatcher = new EventDispatcher()

// ========================================
// HELPERS CONVENIENTES POR CONTEXTO
// ========================================

export const events = {
  // PRODUTOS
  productCreated: (productId: string, productName: string, family: string) =>
    dispatcher.dispatch('product_created', { productId, productName, family }, 'products-api'),

  productAdvanced: (productId: string, productName: string, fromStage: string, toStage: string) =>
    dispatcher.dispatch('product_advanced', { productId, productName, fromStage, toStage }, 'products-api'),

  productFinalized: (productId: string, productName: string, batch: string, quantity: number) =>
    dispatcher.dispatch('product_finalized', { productId, productName, batch, quantity }, 'products-api'),

  // BALDES
  bucketCreated: (bucketId: string, productId: string, productName: string, quantityKg: number) =>
    dispatcher.dispatch('bucket_created', { bucketId, productId, productName, quantityKg }, 'buckets-api'),

  bucketPackaged: (bucketId: string, productName: string, quantityKg: number, bucketIndex: number) =>
    dispatcher.dispatch('bucket_packaged', { bucketId, productName, quantityKg, bucketIndex }, 'packaging-api'),

  bucketReturned: (bucketId: string, productName: string, quantityKg: number, bucketIndex: number, reason?: string) =>
    dispatcher.dispatch('bucket_returned', { bucketId, productName, quantityKg, bucketIndex, reason }, 'packaging-api'),

  // QUALIDADE
  qualityTestFailed: (
    productId: string,
    productName: string,
    parameter: string,
    measuredValue: number,
    tolerance: { min: number; max: number },
    operator: string
  ) =>
    dispatcher.dispatch(
      'quality_test_failed',
      { productId, productName, parameter, measuredValue, tolerance, operator },
      'quality-api'
    ),

  nonConformityCreated: (
    productId: string,
    productName: string,
    type: string,
    severity: string,
    description: string
  ) =>
    dispatcher.dispatch(
      'non_conformity_created',
      { productId, productName, type, severity, description },
      'quality-api'
    ),

  // SISTEMA
  systemError: (source: string, error: string, stack?: string) =>
    dispatcher.dispatch('system_error', { source, error, stack }, 'system'),
}
