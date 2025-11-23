/**
 * Hooks React Query para funcionalidades ClickUp-style
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { 
  clickupKeys, 
  ApiResponse, 
  PaginatedResponse,
  Tag,
  Task,
  Workflow,
  CustomField,
  Notification,
  ActivityLog,
  TaskFilter,
  TaskCreateData,
  CreateTagForm,
  CreateCustomFieldForm,
  CreateTaskForm,
  TaskPriority,
  CustomFieldType
} from '@/types/clickup-types'

// Hooks para Tags
export function useTags() {
  return useQuery({
    queryKey: clickupKeys.tags,
    queryFn: async (): Promise<Tag[]> => {
      const response = await apiFetch<Tag[]>('/api/tags')
      return response
    }
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateTagForm): Promise<Tag> => {
      const response = await apiFetch<Tag>('/api/tags', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tags })
    }
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTagForm> }): Promise<Tag> => {
      const response = await apiFetch<Tag>(`/api/tags/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      return response
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tags })
      queryClient.invalidateQueries({ queryKey: clickupKeys.tag(id) })
    }
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiFetch(`/api/tags/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tags })
    }
  })
}

// Hooks para Workflows
export function useWorkflows() {
  return useQuery({
    queryKey: clickupKeys.workflows,
    queryFn: async (): Promise<Workflow[]> => {
      const response = await apiFetch<Workflow[]>('/api/workflows')
      return response
    }
  })
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: clickupKeys.workflow(id),
    queryFn: async (): Promise<Workflow> => {
      const response = await apiFetch<Workflow>(`/api/workflows/${id}`)
      return response
    },
    enabled: !!id
  })
}

// Hooks para Custom Fields
export function useCustomFields(entityType: 'product' | 'semiFinished') {
  return useQuery({
    queryKey: clickupKeys.customFields(entityType),
    queryFn: async (): Promise<CustomField[]> => {
      const response = await apiFetch<CustomField[]>(`/api/custom-fields?entityType=${entityType}`)
      return response
    }
  })
}

export function useCreateCustomField() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateCustomFieldForm): Promise<CustomField> => {
      const response = await apiFetch<CustomField>('/api/custom-fields', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response
    },
    onSuccess: (_, { entityType }) => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.customFields(entityType) })
    }
  })
}

// Hooks para Tasks
export function useTasks(filter?: TaskFilter) {
  return useQuery({
    queryKey: clickupKeys.tasks(filter),
    queryFn: async (): Promise<Task[]> => {
      const params = new URLSearchParams()
      if (filter?.status?.length) params.append('status', filter.status.join(','))
      if (filter?.priority?.length) params.append('priority', filter.priority.join(','))
      if (filter?.assigneeId?.length) params.append('assigneeId', filter.assigneeId.join(','))
      if (filter?.tagId?.length) params.append('tagId', filter.tagId.join(','))
      if (filter?.search) params.append('search', filter.search)
      if (filter?.dueDateRange) {
        params.append('dueDateStart', filter.dueDateRange.start.toISOString())
        params.append('dueDateEnd', filter.dueDateRange.end.toISOString())
      }
      
      const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ''}`
      const response = await apiFetch<Task[]>(url)
      return response
    }
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: clickupKeys.task(id),
    queryFn: async (): Promise<Task> => {
      const response = await apiFetch<Task>(`/api/tasks/${id}`)
      return response
    },
    enabled: !!id
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: TaskCreateData): Promise<Task> => {
      const response = await apiFetch<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tasks() })
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskCreateData> }): Promise<Task> => {
      const response = await apiFetch<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      return response
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tasks() })
      queryClient.invalidateQueries({ queryKey: clickupKeys.task(id) })
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tasks() })
    }
  })
}

export function useAssignTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, userId, role }: { taskId: string; userId: string; role?: string }): Promise<void> => {
      await apiFetch(`/api/tasks/${taskId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ userId, role: role || 'assignee' })
      })
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tasks() })
      queryClient.invalidateQueries({ queryKey: clickupKeys.task(taskId) })
    }
  })
}

export function useUnassignTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }): Promise<void> => {
      await apiFetch(`/api/tasks/${taskId}/unassign`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.tasks() })
      queryClient.invalidateQueries({ queryKey: clickupKeys.task(taskId) })
    }
  })
}

// Hooks para Notificações
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: clickupKeys.notifications(userId),
    queryFn: async (): Promise<Notification[]> => {
      const response = await apiFetch<Notification[]>(`/api/notifications?userId=${userId}`)
      return response
    },
    enabled: !!userId
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' })
    },
    onSuccess: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.notifications(userId) })
    }
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await apiFetch(`/api/notifications/read-all`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: clickupKeys.notifications(userId) })
    }
  })
}

// Hooks para Activity Logs
export function useActivityLogs(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: clickupKeys.activityLogs(entityType, entityId),
    queryFn: async (): Promise<ActivityLog[]> => {
      const params = new URLSearchParams()
      if (entityType) params.append('entityType', entityType)
      if (entityId) params.append('entityId', entityId)
      
      const url = `/api/activity-logs${params.toString() ? `?${params.toString()}` : ''}`
      const response = await apiFetch<ActivityLog[]>(url)
      return response
    }
  })
}

// Hooks para Analytics
export function useTaskAnalytics() {
  return useQuery({
    queryKey: clickupKeys.taskAnalytics(),
    queryFn: async () => {
      const response = await apiFetch('/api/analytics/tasks')
      return response
    }
  })
}

export function useTagAnalytics() {
  return useQuery({
    queryKey: clickupKeys.tagAnalytics(),
    queryFn: async () => {
      const response = await apiFetch('/api/analytics/tags')
      return response
    }
  })
}

export function useWorkflowAnalytics() {
  return useQuery({
    queryKey: clickupKeys.workflowAnalytics(),
    queryFn: async () => {
      const response = await apiFetch('/api/analytics/workflows')
      return response
    }
  })
}

// Hooks para Products com Tags
export function useProductTags(productId: string) {
  return useQuery({
    queryKey: ['productTags', productId],
    queryFn: async (): Promise<Tag[]> => {
      const response = await apiFetch<Tag[]>(`/api/products/${productId}/tags`)
      return response
    },
    enabled: !!productId
  })
}

export function useAddProductTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ productId, tagId }: { productId: string; tagId: string }): Promise<void> => {
      await apiFetch(`/api/products/${productId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagId })
      })
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productTags', productId] })
    }
  })
}

export function useRemoveProductTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ productId, tagId }: { productId: string; tagId: string }): Promise<void> => {
      await apiFetch(`/api/products/${productId}/tags/${tagId}`, { method: 'DELETE' })
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productTags', productId] })
    }
  })
}

// Hooks para Semi-Finished com Tags
export function useSemiFinishedTags(semiFinishedId: string) {
  return useQuery({
    queryKey: ['semiFinishedTags', semiFinishedId],
    queryFn: async (): Promise<Tag[]> => {
      const response = await apiFetch<Tag[]>(`/api/semi-finished/${semiFinishedId}/tags`)
      return response
    },
    enabled: !!semiFinishedId
  })
}

export function useAddSemiFinishedTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ semiFinishedId, tagId }: { semiFinishedId: string; tagId: string }): Promise<void> => {
      await apiFetch(`/api/semi-finished/${semiFinishedId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagId })
      })
    },
    onSuccess: (_, { semiFinishedId }) => {
      queryClient.invalidateQueries({ queryKey: ['semiFinishedTags', semiFinishedId] })
    }
  })
}

export function useRemoveSemiFinishedTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ semiFinishedId, tagId }: { semiFinishedId: string; tagId: string }): Promise<void> => {
      await apiFetch(`/api/semi-finished/${semiFinishedId}/tags/${tagId}`, { method: 'DELETE' })
    },
    onSuccess: (_, { semiFinishedId }) => {
      queryClient.invalidateQueries({ queryKey: ['semiFinishedTags', semiFinishedId] })
    }
  })
}

// Hook para Custom Fields de Products
export function useProductCustomFields(productId: string) {
  return useQuery({
    queryKey: ['productCustomFields', productId],
    queryFn: async (): Promise<Record<string, any>> => {
      const response = await apiFetch<Record<string, any>>(`/api/products/${productId}/custom-fields`)
      return response
    },
    enabled: !!productId
  })
}

export function useUpdateProductCustomField() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ productId, fieldId, value }: { productId: string; fieldId: string; value: any }): Promise<void> => {
      await apiFetch(`/api/products/${productId}/custom-fields/${fieldId}`, {
        method: 'PATCH',
        body: JSON.stringify({ value })
      })
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productCustomFields', productId] })
    }
  })
}

// Hook para Custom Fields de Semi-Finished
export function useSemiFinishedCustomFields(semiFinishedId: string) {
  return useQuery({
    queryKey: ['semiFinishedCustomFields', semiFinishedId],
    queryFn: async (): Promise<Record<string, any>> => {
      const response = await apiFetch<Record<string, any>>(`/api/semi-finished/${semiFinishedId}/custom-fields`)
      return response
    },
    enabled: !!semiFinishedId
  })
}

export function useUpdateSemiFinishedCustomField() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ semiFinishedId, fieldId, value }: { semiFinishedId: string; fieldId: string; value: any }): Promise<void> => {
      await apiFetch(`/api/semi-finished/${semiFinishedId}/custom-fields/${fieldId}`, {
        method: 'PATCH',
        body: JSON.stringify({ value })
      })
    },
    onSuccess: (_, { semiFinishedId }) => {
      queryClient.invalidateQueries({ queryKey: ['semiFinishedCustomFields', semiFinishedId] })
    }
  })
}
