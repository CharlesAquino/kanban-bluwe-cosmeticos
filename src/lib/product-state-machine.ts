/**
 * Product State Machine
 * 
 * Modelagem de máquina de estados para ProductStage
 * Define transições válidas e regras de negócio
 * 
 * Estágios:
 * 1. BACKLOG - Inicial
 * 2. PRODUCAO_1KG - Produção do 1kg (piloto)
 * 3. AVALIACAO_COR - Análise C.Q. (controle de qualidade do piloto)
 * 4. PRODUCAO_5KG - Produção Reator (lote em reator)
 * 5. AVALIACAO_FINAL - Análise Reator (controle de qualidade do lote final)
 * 6. APROVADO - Card de aprovação em produção
 * 7. REJEITADO - Rejeitado (terminal)
 */

import { ProductStage } from '@prisma/client'

export type StateTransition = {
  from: ProductStage
  to: ProductStage
  condition?: (context: TransitionContext) => boolean
  action?: (context: TransitionContext) => Promise<void>
}

export interface TransitionContext {
  productId: string
  currentStage: ProductStage
  userId: string
  reason?: string
  metadata?: Record<string, unknown>
}

export interface StateConfig {
  stage: ProductStage
  label: string
  description: string
  isTerminal: boolean
  allowedTransitions: ProductStage[]
}

/**
 * Configuração de estados
 */
const stateConfigs: Record<ProductStage, StateConfig> = {
  BACKLOG: {
    stage: 'BACKLOG',
    label: 'Backlog',
    description: 'Produto em backlog, aguardando produção',
    isTerminal: false,
    allowedTransitions: ['PRODUCAO_1KG']
  },
  PRODUCAO_1KG: {
    stage: 'PRODUCAO_1KG',
    label: 'Produção 1kg',
    description: 'Produção do 1kg (piloto)',
    isTerminal: false,
    allowedTransitions: ['AVALIACAO_COR', 'REJEITADO']
  },
  AVALIACAO_COR: {
    stage: 'AVALIACAO_COR',
    label: 'Análise C.Q.',
    description: 'Análise de cor e qualidade do piloto',
    isTerminal: false,
    allowedTransitions: ['PRODUCAO_5KG', 'REJEITADO']
  },
  PRODUCAO_5KG: {
    stage: 'PRODUCAO_5KG',
    label: 'Produção Reator',
    description: 'Produção do lote em reator',
    isTerminal: false,
    allowedTransitions: ['AVALIACAO_FINAL', 'REJEITADO']
  },
  AVALIACAO_FINAL: {
    stage: 'AVALIACAO_FINAL',
    label: 'Análise Reator',
    description: 'Análise final de qualidade do lote',
    isTerminal: false,
    allowedTransitions: ['APROVADO', 'REJEITADO']
  },
  APROVADO: {
    stage: 'APROVADO',
    label: 'Aprovado',
    description: 'Produto aprovado em produção',
    isTerminal: false,
    allowedTransitions: [] // Será finalizado para semi-acabados
  },
  REJEITADO: {
    stage: 'REJEITADO',
    label: 'Rejeitado',
    description: 'Produto rejeitado',
    isTerminal: true,
    allowedTransitions: []
  }
}

/**
 * Verificar se transição é válida
 */
export function isValidTransition(
  from: ProductStage,
  to: ProductStage
): boolean {
  const config = stateConfigs[from]
  if (!config) return false
  return config.allowedTransitions.includes(to)
}

/**
 * Obter configuração de estado
 */
export function getStateConfig(stage: ProductStage): StateConfig | null {
  return stateConfigs[stage] || null
}

/**
 * Obter próximas transições possíveis
 */
export function getNextStates(stage: ProductStage): ProductStage[] {
  const config = stateConfigs[stage]
  return config ? config.allowedTransitions : []
}

/**
 * Verificar se estado é terminal
 */
export function isTerminalState(stage: ProductStage): boolean {
  const config = stateConfigs[stage]
  return config ? config.isTerminal : false
}

/**
 * Obter todos os estados
 */
export function getAllStates(): StateConfig[] {
  return Object.values(stateConfigs)
}

/**
 * Validar transição com contexto
 */
export async function validateTransition(
  context: TransitionContext,
  toStage: ProductStage
): Promise<{
  valid: boolean
  error?: string
}> {
  const { currentStage } = context

  // Verificar se transição é válida
  if (!isValidTransition(currentStage, toStage)) {
    return {
      valid: false,
      error: `Transição inválida de ${currentStage} para ${toStage}`
    }
  }

  // Verificar se estado atual é terminal
  if (isTerminalState(currentStage)) {
    return {
      valid: false,
      error: `Não é possível transicionar de um estado terminal (${currentStage})`
    }
  }

  return { valid: true }
}

/**
 * Executar transição
 */
export async function executeTransition(
  context: TransitionContext,
  toStage: ProductStage
): Promise<{
  success: boolean
  error?: string
  previousStage: ProductStage
  newStage: ProductStage
}> {
  const { currentStage } = context

  // Validar transição
  const validation = await validateTransition(context, toStage)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      previousStage: currentStage,
      newStage: currentStage
    }
  }

  // Executar transição
  return {
    success: true,
    previousStage: currentStage,
    newStage: toStage
  }
}

/**
 * Obter caminho de produção (fluxo esperado)
 */
export function getProductionPath(): ProductStage[] {
  return [
    'BACKLOG',
    'PRODUCAO_1KG',
    'AVALIACAO_COR',
    'PRODUCAO_5KG',
    'AVALIACAO_FINAL',
    'APROVADO'
  ]
}

/**
 * Calcular progresso no fluxo
 */
export function calculateProgress(currentStage: ProductStage): {
  current: number
  total: number
  percentage: number
  stage: string
} {
  const path = getProductionPath()
  const index = path.indexOf(currentStage)

  return {
    current: index >= 0 ? index + 1 : 0,
    total: path.length,
    percentage: index >= 0 ? ((index + 1) / path.length) * 100 : 0,
    stage: currentStage
  }
}
