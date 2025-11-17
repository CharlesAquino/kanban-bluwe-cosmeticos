/**
 * Arquivo de constantes aplicando clean code:
 * - Single Responsibility: Apenas constantes
 * - Constants: Valores imutáveis
 * - Named Exports: Melhor organização
 * - Type Safety: Tipagem adequada
 */

import type { ProductStage, ProductStatus, Shift, EfficiencyStatus } from './types'

// ========== TURNOS ==========
export const SHIFTS = [
  {
    id: 'morning' as Shift,
    name: 'Manhã',
    startTime: '06:00',
    endTime: '14:00',
    breakTime: '10:00-10:15'
  },
  {
    id: 'afternoon' as Shift,
    name: 'Tarde',
    startTime: '14:00',
    endTime: '22:00',
    breakTime: '18:00-18:15'
  },
  {
    id: 'night' as Shift,
    name: 'Noite',
    startTime: '22:00',
    endTime: '06:00',
    breakTime: '02:00-02:15'
  }
] as const

export const SHIFT_LABELS: Record<Shift, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite'
} as const

// ========== ESTÁGIOS DE PRODUÇÃO ==========
export const STAGE_LABELS: Record<ProductStage, string> = {
  BACKLOG: 'Backlog',
  PRODUCAO_1KG: 'Produção 1kg',
  AVALIACAO_COR: 'Análise C.Q.',
  PRODUCAO_5KG: 'Produção Reator',
  AVALIACAO_FINAL: 'Análise Reator',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
} as const

export const STAGE_ORDER: readonly ProductStage[] = [
  'BACKLOG',
  'PRODUCAO_1KG',
  'AVALIACAO_COR',
  'PRODUCAO_5KG',
  'AVALIACAO_FINAL',
  'APROVADO',
  'REJEITADO',
] as const

export const STAGE_COLORS: Record<ProductStage, string> = {
  BACKLOG: 'bg-gray-600',
  PRODUCAO_1KG: 'bg-blue-700',
  AVALIACAO_COR: 'bg-slate-600',
  PRODUCAO_5KG: 'bg-blue-800',
  AVALIACAO_FINAL: 'bg-indigo-600',
  APROVADO: 'bg-green-700',
  REJEITADO: 'bg-red-700',
} as const

export const STAGE_BACKGROUND_COLORS: Record<ProductStage, string> = {
  BACKLOG: 'bg-gray-50 border-gray-200',
  PRODUCAO_1KG: 'bg-blue-50 border-blue-200',
  AVALIACAO_COR: 'bg-slate-50 border-slate-200',
  PRODUCAO_5KG: 'bg-blue-50 border-blue-200',
  AVALIACAO_FINAL: 'bg-indigo-50 border-indigo-200',
  APROVADO: 'bg-green-50 border-green-200',
  REJEITADO: 'bg-red-50 border-red-200',
} as const

// ========== STATUS DE PRODUTO ==========
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: 'Em Andamento',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
  BLOCKED: 'Bloqueado',
  CANCELLED: 'Cancelado',
} as const

// ========== STATUS DE EFICIÊNCIA ==========
export const EFFICIENCY_STATUS_LABELS: Record<EfficiencyStatus, string> = {
  on_track: 'No Prazo',
  behind: 'Atrasado',
  ahead: 'Adiantado',
  completed: 'Concluído'
} as const

export const EFFICIENCY_STATUS_COLORS: Record<EfficiencyStatus, string> = {
  on_track: 'bg-blue-100 text-blue-800',
  behind: 'bg-red-100 text-red-800',
  ahead: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800'
} as const

// ========== VALIDAÇÕES ==========
export const VALIDATION_LIMITS = {
  PRODUCT_NAME_MIN_LENGTH: 2,
  PRODUCT_NAME_MAX_LENGTH: 100,
  OP_MIN_LENGTH: 2,
  OP_MAX_LENGTH: 20,
  BATCH_MIN_LENGTH: 2,
  BATCH_MAX_LENGTH: 20,
  QUANTITY_MIN: 0.01,
  QUANTITY_MAX: 10000,
  NOTES_MAX_LENGTH: 1000,
} as const

// ========== CONFIGURAÇÕES ==========
export const APP_CONFIG = {
  PAGINATION_DEFAULT_PAGE_SIZE: 20,
  PAGINATION_MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  REFRESH_INTERVAL: 30000, // 30 segundos
} as const

// ========== STATUS ICONS ==========
export const STATUS_ICONS = {
  in_progress: '🔄',
  paused: '⏸️',
  completed: '✅',
  blocked: '🚫',
} as const

// ========== GRADIENTES ==========
export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600',
  success: 'bg-gradient-to-r from-green-600 to-emerald-600',
  warning: 'bg-gradient-to-r from-yellow-600 to-orange-600',
  danger: 'bg-gradient-to-r from-red-600 to-pink-600',
} as const
