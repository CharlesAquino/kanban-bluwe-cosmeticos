/**
 * Tipos modernos do sistema Kanban
 * Compatível com Prisma e Next.js 15
 */

import React from 'react'

// Tipos base do sistema (serão migrados do schema Prisma)
export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER'
export type ProductStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED'
export type ProductStage =
  | 'BACKLOG'
  | 'PRODUCAO_1KG'
  | 'AVALIACAO_COR'
  | 'PRODUCAO_5KG'
  | 'AVALIACAO_FINAL'
  | 'APROVADO'
  | 'REJEITADO'

// ========== TIPOS PRINCIPAIS ==========

export interface Product {
  id: string
  name: string
  op: string
  batch: string
  quantity: number
  currentStage: ProductStage
  status: ProductStatus
  priority: number
  dueDate?: string
  notes?: string
  image?: string
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string
  stageHistory: StageHistory[]
  hourlyControls: HourlyControl[]
}

export interface StageHistory {
  id: string
  productId: string
  stage: ProductStage
  startTime: string
  endTime?: string
  mod: number
  notes?: string
  operatorId: string
  duration?: number
  efficiency?: number
}

export interface HourlyControl {
  id: string
  date: string
  shift: string
  operatorId: string
  productId: string
  productName: string
  targetQuantity: number
  actualQuantity: number
  efficiency: number
  status: string
  notes?: string
  stage: ProductStage
  startTime: string
  endTime?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  image?: string
  emailVerified?: string
  createdAt: string
  updatedAt: string
}

// ========== FORMULÁRIOS ==========

export interface CreateProductData {
  name: string
  op: string
  batch: string
  quantity: number
  priority?: number
  dueDate?: string
  notes?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  currentStage?: ProductStage
  status?: ProductStatus
  updatedById?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserData {
  email: string
  name?: string
  password: string
  role?: UserRole
}

// ========== API RESPONSES ==========

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ========== DASHBOARD E ANALYTICS ==========

export interface DashboardStats {
  total: number
  inProgress: number
  paused: number
  completed: number
  blocked: number
  efficiency: number
  avgProcessingTime: number
  alerts: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface AnalyticsData {
  productionTrend: ChartDataPoint[]
  efficiencyByStage: Record<ProductStage, number>
  topOperators: Array<{
    id: string
    name: string
    efficiency: number
    productsCompleted: number
  }>
  bottlenecks: Array<{
    stage: ProductStage
    avgTime: number
    blockedProducts: number
  }>
}

// ========== FILTROS E PAGINAÇÃO ==========

export interface ProductFilters {
  status?: ProductStatus[]
  stage?: ProductStage[]
  operatorId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
  priority?: number[]
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ========== NOTIFICAÇÕES ==========

export interface NotificationData {
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  userId: string
  productId?: string
  data?: Record<string, unknown>
}

// ========== AUDITORIA ==========

export interface AuditLogData {
  userId: string
  action: string
  entity: string
  entityId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

// ========== WEBSOCKET ==========

export interface WebSocketEvent {
  type: 'product_update' | 'notification' | 'user_activity' | 'system_alert'
  data: Record<string, unknown>
  timestamp: Date
}

// ========== CONFIGURAÇÕES ==========

export interface SystemConfig {
  key: string
  value: unknown
  updatedBy: string
  updatedAt: Date
}

export interface ApiKeyData {
  name: string
  permissions: string[]
  expiresAt?: Date
}

// ========== ENUMS ==========

export const PRODUCT_STAGES = [
  'BACKLOG',
  'PRODUCAO_1KG',
  'AVALIACAO_COR',
  'PRODUCAO_5KG',
  'AVALIACAO_FINAL',
  'APROVADO',
  'REJEITADO'
] as const

export const PRODUCT_STATUSES = [
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'BLOCKED',
  'CANCELLED'
] as const

export const USER_ROLES = [
  'ADMIN',
  'MANAGER',
  'OPERATOR',
  'VIEWER'
] as const

export const NOTIFICATION_TYPES = [
  'info',
  'warning',
  'error',
  'success'
] as const

// ========== UTILITIES ==========

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// ========== FORM VALIDATION ==========

export interface FormValidationError {
  field: string
  message: string
}

export interface FormState<T> {
  data: T
  errors: FormValidationError[]
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

// ========== CONTEXTS ==========

export interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  resolvedTheme: 'light' | 'dark'
}

// ========== COMPONENT PROPS ==========

export interface ComponentProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  loading?: boolean
}

export interface ModalProps extends ComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

export interface TableProps<T> extends ComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationParams
  filters?: ProductFilters
  onRowClick?: (row: T) => void
}

export interface TableColumn<T> {
  key: keyof T
  title: string
  width?: string
  sortable?: boolean
  render?: (value: T[keyof T], record: T) => React.ReactNode
}

// ========== CONSTANTS ==========

export const SYSTEM_CONFIG = {
  MAX_PRODUCTS_PER_PAGE: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  REFRESH_INTERVAL: 30 * 1000, // 30 segundos
  MAX_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
} as const

// ========== ERROR HANDLING ==========

export interface AppError {
  code: string
  message: string
  statusCode: number
  details?: Record<string, unknown>
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

// ========== MIDDLEWARE ==========

export interface MiddlewareContext {
  params: Promise<{ [key: string]: string | string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}
