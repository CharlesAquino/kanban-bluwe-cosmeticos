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

// ========== CONTROLE ESTATÍSTICO DE PROCESSOS (CEP) ==========

/**
 * Tipos para CEP aplicando clean code:
 * - Specific Types: Tipos específicos para cada caso
 * - Union Types: Combinações possíveis
 */
export type ControlChartType = 'x_bar_r' | 'x_bar_s' | 'i_mr' | 'p' | 'np' | 'c' | 'u'
export type AnalysisType = 'basic_stats' | 'trend_analysis' | 'capability' | 'stability' | 'comparison'
export type TrendType = 'increasing' | 'decreasing' | 'stable' | 'cyclic' | 'erratic'

/**
 * Interfaces para métricas estatísticas aplicando clean code:
 * - Comprehensive: Todas as métricas necessárias
 * - Optional Fields: Campos calculados marcados como opcionais
 */
export interface StatisticalMetrics {
  mean: number
  median: number
  mode?: number
  stdDev: number
  variance: number
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
}

export interface CapabilityIndices {
  cp?: number
  cpu?: number
  cpl?: number
  cpk?: number
  pp?: number
  ppu?: number
  ppl?: number
  ppk?: number
  sigmaLevel?: number
  dpmo?: number
  isCapable: boolean
  interpretation?: string
}

export interface ControlLimits {
  xBarBar?: number  // Média das médias
  rBar?: number      // Média das amplitudes
  sBar?: number      // Média dos desvios padrão
  uclX?: number      // LCL X
  lclX?: number      // UCL X
  uclR?: number      // LCL R
  lclR?: number      // UCL R
  uclS?: number      // LCL S
  lclS?: number      // UCL S
}

// ========== INPUT INTERFACES ==========

/**
 * Interface para entrada de dados de processo aplicando clean code:
 * - Input Validation: Campos necessários para processamento
 * - Optional Fields: Campos opcionais bem definidos
 */
export interface ProcessDataInput {
  controlChartId: string
  measurements: number[]
  subgroup?: number
  operator?: string
  notes?: string
  productId?: string
  productName?: string
  stage?: ProductStage
}

/**
 * Interface para criação de carta de controle aplicando clean code:
 * - Required Fields: Campos obrigatórios bem definidos
 * - Validation Ready: Estrutura preparada para validação
 */
export interface ControlChartInput {
  name: string
  productId?: string
  stage?: ProductStage
  chartType: ControlChartType
  characteristic: string
  sampleSize?: number
  frequency?: number
}

// ========== BUSINESS PROCESS MANAGEMENT (BPM) ==========

/**
 * Tipos para BPM aplicando clean code:
 * - Status Types: Estados possíveis do processo
 * - Activity Types: Tipos de atividades possíveis
 */
export type ProcessStatus = 'draft' | 'active' | 'inactive' | 'deprecated'
export type ActivityType = 'user_task' | 'service_task' | 'script_task' | 'manual_task' | 'decision_task' | 'parallel_gateway' | 'exclusive_gateway' | 'inclusive_gateway'
export type InstanceStatus = 'ready' | 'running' | 'completed' | 'failed' | 'cancelled' | 'suspended' | 'waiting'

/**
 * Interfaces para BPM aplicando clean code:
 * - Complete Information: Todos os dados necessários
 * - Relationships: Relacionamentos bem definidos
 */
export interface ProcessDefinition {
  id: string
  name: string
  description?: string
  version: string
  status: ProcessStatus
  productId?: string
  stage?: ProductStage
  isActive: boolean
  priority: number
  slaHours?: number
  totalInstances: number
  completedInstances: number
  avgExecutionTime?: number
  createdAt: string
  updatedAt: string
}

export interface ActivityDefinition {
  id: string
  name: string
  description?: string
  type: ActivityType
  order: number
  requiredSkills: string[]
  estimatedDuration: number
  requiredEquipment: string[]
  qualityGates?: Record<string, unknown>
  inspectionPoints?: Record<string, unknown>
  processId: string
}

export interface ProcessInstance {
  id: string
  processId: string
  status: InstanceStatus
  startedAt: string
  completedAt?: string
  dueDate?: string
}

export interface ActivityInstance {
  id: string
  activityId: string
  instanceId: string
  status: InstanceStatus
  startedAt?: string
  completedAt?: string
  assignedTo?: string
  priority: number
  actualDuration?: number
  notes?: string
}

export interface WorkflowTransition {
  id: string
  name: string
  condition?: string
  fromActivityId: string
  toActivityId: string
  processId: string
}

export interface ProcessMetrics {
  id: string
  processId?: string
  instanceId?: string
  cycleTime?: number
  leadTime?: number
  waitingTime?: number
  processingTime?: number
  defectRate?: number
  reworkRate?: number
  firstPassYield?: number
  resourceUtilization?: number
  costPerUnit?: number
  throughput?: number
  bottleneckIndex?: number
  measuredAt: string
}

// ========== INPUT INTERFACES FOR BPM ==========

export interface ProcessDefinitionInput {
  name: string
  description?: string
  productId?: string
  stage?: ProductStage
  priority?: number
  slaHours?: number
}

export interface ActivityDefinitionInput {
  name: string
  description?: string
  type: ActivityType
  order: number
  requiredSkills?: string[]
  estimatedDuration: number
  requiredEquipment?: string[]
  qualityGates?: Record<string, unknown>
  inspectionPoints?: Record<string, unknown>
  processId: string
}

export interface ProcessInstanceInput {
  processId: string
  dueDate?: string
}

export interface ActivityInstanceInput {
  activityId: string
  instanceId: string
  assignedTo?: string
  priority?: number
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
  CONTROL_CHART_TYPE_LABELS,
  ANALYSIS_TYPE_LABELS,
  TREND_TYPE_LABELS,
  PROCESS_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  INSTANCE_STATUS_LABELS,
  PROCESS_STATUS_COLORS,
  INSTANCE_STATUS_COLORS,
  VALIDATION_LIMITS,
  APP_CONFIG,
  STATUS_ICONS,
  GRADIENTS
} from './constants'
