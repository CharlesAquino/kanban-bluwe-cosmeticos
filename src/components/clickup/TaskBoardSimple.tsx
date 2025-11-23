/**
 * TaskBoard Simplificado - Sem dependências externas
 * Versão temporária para Docker build
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, User, AlertCircle } from 'lucide-react'

interface SimpleTask {
  id: string
  title: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: string
  dueDate?: string
  assignees?: string[]
}

const mockTasks: SimpleTask[] = [
  {
    id: '1',
    title: 'Analisar lote #123',
    priority: 'HIGH',
    status: 'in_progress',
    dueDate: '2024-12-25',
    assignees: ['João Silva']
  },
  {
    id: '2',
    title: 'Verificar qualidade',
    priority: 'NORMAL',
    status: 'todo',
    dueDate: '2024-12-26',
    assignees: ['Maria Santos']
  }
]

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

export const TaskBoardSimple: React.FC = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>(mockTasks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const columns = [
    { id: 'todo', title: 'A Fazer', status: 'todo' },
    { id: 'in_progress', title: 'Em Progresso', status: 'in_progress' },
    { id: 'review', title: 'Revisão', status: 'review' },
    { id: 'done', title: 'Concluído', status: 'done' }
  ]

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Board de Tarefas</h3>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => (
          <Card key={column.id} className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {getTasksByStatus(column.status).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getTasksByStatus(column.status).map(task => (
                <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </div>
                    )}
                    
                    {task.assignees && task.assignees.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        {task.assignees.join(', ')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog Placeholder */}
      {isCreateDialogOpen && (
        <Card className="p-4">
          <h4 className="font-medium mb-2">Nova Tarefa (Mock)</h4>
          <p className="text-sm text-gray-600">
            Funcionalidade de criação disponível na versão completa com TaskBoard.tsx
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(false)}
            variant="outline"
            className="mt-2"
          >
            Fechar
          </Button>
        </Card>
      )}
    </div>
  )
}
