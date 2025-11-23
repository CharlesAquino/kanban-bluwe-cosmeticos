/**
 * Mock Prisma Client - Workaround temporário para permissão Windows
 * Simula as operações do Prisma enquanto o problema não é resolvido
 */

// Mock Prisma Client - Workaround temporário para permissão Windows
// Simula as operações do Prisma enquanto o problema não é resolvido

// Mock data temporário
const mockTags = [
  {
    id: '1',
    name: 'Urgente',
    color: '#EF4444',
    description: 'Tarefas urgentes',
    usageCount: 5,
    createdById: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: 'user1', name: 'Admin', email: 'admin@bluwe.com' },
    _count: {
      products: 2,
      semiItems: 1,
      tasks: 2
    }
  },
  {
    id: '2', 
    name: 'Qualidade',
    color: '#3B82F6',
    description: 'Controle de qualidade',
    usageCount: 3,
    createdById: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: 'user1', name: 'Admin', email: 'admin@bluwe.com' },
    _count: {
      products: 1,
      semiItems: 1,
      tasks: 1
    }
  }
]

const mockTasks = [
  {
    id: '1',
    title: 'Analisar lote #123',
    description: 'Verificar qualidade do lote de produção',
    priority: 'HIGH',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 86400000),
    completedAt: null,
    createdById: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignees: [
      {
        id: '1',
        taskId: '1',
        userId: 'user1',
        role: 'assignee',
        createdAt: new Date(),
        user: { id: 'user1', name: 'Admin', email: 'admin@bluwe.com' }
      }
    ],
    tags: [
      {
        taskId: '1',
        tagId: '1',
        createdAt: new Date(),
        tag: mockTags[0]
      }
    ],
    dependencies: [],
    dependents: [],
    parentTaskId: null,
    parentTask: null,
    subtasks: []
  }
]

// Mock Prisma Client
export const prisma = {
  tag: {
    findMany: async () => mockTags,
    findUnique: async ({ where }: { where: { id: string } }) => 
      mockTags.find(tag => tag.id === where.id),
    findFirst: async ({ where }: { where: { name: string } }) => 
      mockTags.find(tag => tag.name === where.name),
    create: async ({ data }: any) => {
      const newTag = {
        ...data,
        id: Date.now().toString(),
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockTags.push(newTag)
      return newTag
    },
    update: async ({ where, data }: any) => {
      const index = mockTags.findIndex(tag => tag.id === where.id)
      if (index !== -1) {
        mockTags[index] = { ...mockTags[index], ...data, updatedAt: new Date() }
        return mockTags[index]
      }
      throw new Error('Tag not found')
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = mockTags.findIndex(tag => tag.id === where.id)
      if (index !== -1) {
        mockTags.splice(index, 1)
        return
      }
      throw new Error('Tag not found')
    }
  },
  
  task: {
    findMany: async ({ where }: any = {}) => {
      let filtered = [...mockTasks]
      
      if (where?.status) {
        filtered = filtered.filter(task => 
          Array.isArray(where.status) ? where.status.includes(task.status) : task.status === where.status
        )
      }
      
      if (where?.priority) {
        filtered = filtered.filter(task => 
          Array.isArray(where.priority) ? where.priority.includes(task.priority) : task.priority === where.priority
        )
      }
      
      return filtered
    },
    findUnique: async ({ where }: { where: { id: string } }) => 
      mockTasks.find(task => task.id === where.id),
    create: async ({ data, include }: any) => {
      const newTask = {
        ...data,
        id: Date.now().toString(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignees: data.assignees?.create || [],
        tags: data.tags?.create || [],
        dependencies: [],
        dependents: [],
        parentTask: null,
        subtasks: []
      }
      mockTasks.push(newTask)
      return newTask
    },
    update: async ({ where, data }: any) => {
      const index = mockTasks.findIndex(task => task.id === where.id)
      if (index !== -1) {
        mockTasks[index] = { ...mockTasks[index], ...data, updatedAt: new Date() }
        return mockTasks[index]
      }
      throw new Error('Task not found')
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = mockTasks.findIndex(task => task.id === where.id)
      if (index !== -1) {
        mockTasks.splice(index, 1)
        return
      }
      throw new Error('Task not found')
    }
  },

  activityLog: {
    create: async ({ data }: any) => {
      console.log('Activity Log:', data)
      return { ...data, id: Date.now().toString(), createdAt: new Date() }
    }
  },

  $transaction: async (callback: any) => {
    return await callback(prisma)
  }
}

export default prisma
