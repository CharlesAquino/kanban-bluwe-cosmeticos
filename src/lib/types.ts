/**
 * Arquivo de tipos aplicando clean code:
 * - Single Responsibility: Apenas tipos e interfaces
 * - Type Safety: Tipagem robusta
 * - Consistency: Nomenclatura consistente
 * - Documentation: Comentários explicativos
 */

// ========== ENUMS ==========

/**
 * Estágios de produção aplicando clean code:
 * - Specific Values: Valores específicos e descritivos
 * - Ordered: Ordem lógica de produção
 */
export type ProductStage =
  | 'BACKLOG'
  | 'PRODUCAO_1KG'
  | 'AVALIACAO_COR'
  | 'PRODUCAO_5KG'
  | 'AVALIACAO_FINAL'
  | 'APROVADO'
  | 'REJEITADO'

/**
 * Status do produto aplicando clean code:
 * - Clear States: Estados claros e mutuamente exclusivos
 * - Lifecycle: Ciclo de vida completo do produto
 */
export type ProductStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED'

// ========== TIPOS PRINCIPAIS ==========

// ========== INTERFACES PRINCIPAIS ==========

/**
 * Interface para histórico de estágios aplicando clean code:
 * - Clear Naming: Nomes descritivos
 * - Required Fields: Campos obrigatórios bem definidos
 * - Optional Fields: Campos opcionais marcados
 * - Comprehensive: Controle detalhado de cada estágio
 */
export interface StageHistory {
  id: string
  stage: ProductStage
  startTime: string
  endTime: string | null
  mod: number // Mão de obra disponibilizada
  notes?: string | null // Observações do operador
  reason?: string | null // Motivo de pausa/bloqueio
  operator?: string | null // Operador responsável
  shift?: Shift | null // Turno em que ocorreu
  productId: string

  // Controle de qualidade e eficiência
  targetDuration?: number | null // Duração esperada em minutos
  actualDuration?: number | null // Duração real em minutos
  efficiency?: number | null // Eficiência do estágio (%)
}

/**
 * Interface para produto aplicando clean code:
 * - Complete Interface: Todos os campos necessários
 * - Relationships: Relacionamentos tipados
 * - Timestamps: Controle de criação e atualização
 */
export interface Product {
  id: string
  name: string
  op: string // Ordem de produção
  batch: string // Lote
  quantity: number // Quantidade em kg
  currentStage: ProductStage
  status: ProductStatus
  manufacturingDate?: string // Data de fabricação (ISO string)
  createdAt: string
  updatedAt: string
  createdById?: string
  stageHistory: StageHistory[]
  // Novo campo para integração com controle hora a hora
  hourlyControls?: HourlyControl[]
  // Relatório de gargalos
  bottleneckReports?: BottleneckReport[]
}

export interface BottleneckReport {
  id: string
  productId: string
  stage: ProductStage
  waitingTime: number // Tempo de espera em minutos
  stageDuration: number // Duração total do estágio em minutos
  bottleneckScore: number // Score de gargalo (0-100)
  analysisDate: string
  recommendations?: string | null // Recomendações para melhoria
}

/**
 * Tipos para controle hora a hora aplicando clean code:
 * - Union Types: Tipos específicos para cada caso
 * - Consistency: Nomenclatura consistente
 */
export type Shift = 'morning' | 'afternoon' | 'night'
export type EfficiencyStatus = 'on_track' | 'behind' | 'ahead' | 'completed'

/**
 * Interface para controle hora a hora aplicando clean code:
 * - Comprehensive: Todos os campos necessários
 * - Type Safety: Tipagem adequada
 * - Optional Fields: Campos opcionais bem definidos
 */
export interface HourlyControl {
  id: string
  date: string
  shift: Shift
  operator: string
  productId: string
  productName: string
  targetQuantity: number // Meta de produção por hora para este estágio
  actualQuantity: number // Produzido realmente neste estágio
  efficiency: number // Eficiência (%) neste estágio
  status: EfficiencyStatus
  notes?: string
  stage: ProductStage // Estágio atual sendo monitorado
  createdAt: string
  updatedAt: string
}

/**
 * Interface para turno aplicando clean code:
 * - Complete Information: Todos os dados necessários
 * - Optional Fields: Campos opcionais bem definidos
 */
export interface ShiftInfo {
  id: string
  name: string
  startTime: string
  endTime: string
  breakTime?: string
}

// ========== IMPORTAÇÕES DE CONSTANTES ==========

// Importa constantes do arquivo separado aplicando clean code
export {
  SHIFTS,
  SHIFT_LABELS,
  STAGE_LABELS,
  STAGE_ORDER,
  STAGE_COLORS,
  STAGE_BACKGROUND_COLORS,
  PRODUCT_STATUS_LABELS,
  EFFICIENCY_STATUS_LABELS,
  EFFICIENCY_STATUS_COLORS,
  VALIDATION_LIMITS,
  APP_CONFIG,
  STATUS_ICONS,
  GRADIENTS
} from './constants'
