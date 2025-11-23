/**
 * Tipos TypeScript para funcionalidades inspiradas no ClickUp
 */

// Enums
export enum TaskPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN',
  DATE = 'DATE',
  STATUS = 'STATUS',
  CHECKBOX = 'CHECKBOX',
  URL = 'URL',
  EMAIL = 'EMAIL'
}

// Interfaces principais
export interface Tag {
  id: string
  name: string
  color: string
  description?: string
  usageCount: number
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface Workflow {
  id: string
  name: string
  description?: string
  entityType: 'product' | 'semiFinished' | 'task'
  isActive: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
  statuses: WorkflowStatus[]
  transitions: WorkflowTransition[]
}

export interface WorkflowStatus {
  id: string
  workflowId: string
  name: string
  color: string
  type: 'open' | 'closed' | 'progress'
  order: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowTransition {
  id: string
  workflowId: string
  fromStatusId: string
  toStatusId: string
  conditions?: any
  actions?: any
  createdAt: Date
  updatedAt: Date
}

export interface CustomField {
  id: string
  name: string
  type: CustomFieldType
  required: boolean
  options?: any
  defaultValue?: any
  entityType: 'product' | 'semiFinished'
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  values?: CustomFieldValue[]
}

export interface CustomFieldValue {
  id: string
  customFieldId: string
  entityId: string
  value: any
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: string
  dueDate?: Date
  completedAt?: Date
  createdById: string
  createdAt: Date
  updatedAt: Date
  creator: User
  assignees: TaskAssignment[]
  tags: TaskTag[]
  dependencies: TaskDependency[]
  dependents: TaskDependency[]
  subtasks: Task[]
  parentTaskId?: string
  parentTask?: Task
  activityLogs: ActivityLog[]
}

export interface TaskAssignment {
  id: string
  taskId: string
  userId: string
  role: 'assignee' | 'reviewer' | 'follower'
  createdAt: Date
  task: Task
  user: User
}

export interface TaskTag {
  taskId: string
  tagId: string
  createdAt: Date
  task: Task
  tag: Tag
}

export interface TaskDependency {
  id: string
  dependentId: string
  dependsOnId: string
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
  createdAt: Date
  dependent: Task
  dependsOn: Task
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  userId: string
  isRead: boolean
  metadata?: any
  createdAt: Date
  user: User
}

export interface ActivityLog {
  id: string
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  entityType: 'product' | 'semiFinished' | 'task' | 'tag'
  entityId: string
  userId: string
  metadata?: any
  createdAt: Date
  user: User
}

// Types para UI
export interface TagOption {
  id: string
  name: string
  color: string
  selected?: boolean
}

export interface CustomFieldOption {
  id: string
  name: string
  value: any
  type: CustomFieldType
  required: boolean
  options?: string[]
}

export interface TaskCreateData {
  title: string
  description?: string
  priority: TaskPriority
  status: string
  dueDate?: Date
  assigneeIds: string[]
  tagIds: string[]
  parentTaskId?: string
}

export interface WorkflowCreateData {
  name: string
  description?: string
  entityType: 'product' | 'semiFinished' | 'task'
  statuses: Omit<WorkflowStatus, 'id' | 'workflowId' | 'createdAt' | 'updatedAt'>[]
  transitions: Omit<WorkflowTransition, 'id' | 'workflowId' | 'createdAt' | 'updatedAt'>[]
}

// Tipos para filtros e buscas
export interface TaskFilter {
  status?: string[]
  priority?: TaskPriority[]
  assigneeId?: string[]
  tagId?: string[]
  dueDateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface ProductFilter {
  status?: string[]
  stage?: string[]
  priority?: number[]
  tagId?: string[]
  createdById?: string[]
  search?: string
}

// Tipos para dashboard e analytics
export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  tasksByStatus: Record<string, number>
  tasksByPriority: Record<string, number>
  tasksByAssignee: Record<string, number>
  completionRate: number
  averageCompletionTime: number
}

export interface TagAnalytics {
  totalTags: number
  mostUsedTags: Array<{
    tag: Tag
    usageCount: number
  }>
  tagsByEntityType: Record<string, number>
}

export interface WorkflowAnalytics {
  totalWorkflows: number
  workflowsByEntityType: Record<string, number>
  mostActiveWorkflows: Array<{
    workflow: Workflow
    usageCount: number
  }>
}

// React Query Keys
export const clickupKeys = {
  // Tags
  tags: ['tags'] as const,
  tag: (id: string) => ['tags', id] as const,
  
  // Workflows
  workflows: ['workflows'] as const,
  workflow: (id: string) => ['workflows', id] as const,
  
  // Custom Fields
  customFields: (entityType: string) => ['customFields', entityType] as const,
  
  // Tasks
  tasks: (filter?: TaskFilter) => ['tasks', filter] as const,
  task: (id: string) => ['tasks', id] as const,
  
  // Notifications
  notifications: (userId: string) => ['notifications', userId] as const,
  
  // Activity Logs
  activityLogs: (entityType?: string, entityId?: string) => ['activityLogs', entityType, entityId] as const,
  
  // Analytics
  taskAnalytics: () => ['analytics', 'tasks'] as const,
  tagAnalytics: () => ['analytics', 'tags'] as const,
  workflowAnalytics: () => ['analytics', 'workflows'] as const,
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface CreateTagForm {
  name: string
  color: string
  description?: string
}

export interface CreateCustomFieldForm {
  name: string
  type: CustomFieldType
  required: boolean
  options?: string[]
  defaultValue?: any
  entityType: 'product' | 'semiFinished'
}

export interface CreateTaskForm {
  title: string
  description?: string
  priority: TaskPriority
  status: string
  dueDate?: Date
  assigneeIds: string[]
  tagIds: string[]
  parentTaskId?: string
}

export interface CreateWorkflowForm {
  name: string
  description?: string
  entityType: 'product' | 'semiFinished' | 'task'
}

export interface CreateWorkflowStatusForm {
  name: string
  color: string
  type: 'open' | 'closed' | 'progress'
  order: number
  isDefault?: boolean
}
