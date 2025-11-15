/**
 * Sistema de monitoramento de processos aplicando clean code:
 * - Single Responsibility: Apenas monitoramento de ações
 * - Performance: Otimizado com useCallback e useMemo
 * - Type Safety: Tipagem robusta
 * - Real-time: Atualização automática baseada em ações
 */

import type { ProductStage } from './types'

// Tipos para monitoramento de processos
export type ProcessAction = 'product_create' | 'stage_advance' | 'stage_pause' | 'stage_resume' | 'stage_block' | 'hourly_control'

export interface ProcessMonitorEvent {
  productId: string
  productName: string
  action: ProcessAction
  fromStage?: ProductStage
  toStage?: ProductStage
  metadata?: Record<string, any>
}

export type ProcessMonitorCallback = (event: ProcessMonitorEvent) => void

// Estado global para o callback de monitoramento
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
export function notifyProcessMonitor(event: ProcessMonitorEvent) {
  if (processMonitorCallback) {
    processMonitorCallback(event)
  }
}

/**
 * Hook personalizado para monitoramento de processos
 */
export function useProcessMonitor() {
  return {
    notifyProcessMonitor,
    setProcessMonitorCallback
  }
}
