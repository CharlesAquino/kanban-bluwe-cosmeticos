/**
 * Componente de Board de Tarefas (ClickUp-style)
 */

import React, { useState } from 'react'
import { Plus, Calendar, User, Hash, MoreHorizontal, Clock, CheckCircle } from 'lucide-react'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useClickup'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Task, TaskPriority, TaskCreateData } from '@/types/clickup-types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskBoardProps {
  entityType?: 'product' | 'semiFinished'
  entityId?: string
  status?: string[]
  assigneeId?: string[]
}

const priorityColors = {
  URGENT: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  NORMAL: 'bg-blue-500 text-white',
  LOW: 'bg-gray-500 text-white'
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800'
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  entityType,
  entityId,
  status,
  assigneeId
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<TaskCreateData>({
    title: '',
    description: '',
    priority: TaskPriority.NORMAL,
    status: 'todo',
    assigneeIds: [],
    tagIds: []
  })

  const { data: tasks, isLoading } = useTasks({
    status,
    assigneeId
  })

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const handleCreateTask = async () => {
    if (!formData.title.trim()) return

    try {
      await createTaskMutation.mutateAsync(formData)
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.NORMAL,
        status: 'todo',
        assigneeIds: [],
        tagIds: []
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<TaskCreateData>) => {
    try {
      await updateTaskMutation.mutateAsync({ id: taskId, data: updates })
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      await deleteTaskMutation.mutateAsync(taskId)
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
    }
  }

  const groupTasksByStatus = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: []
    }

    tasks.forEach(task => {
      if (!groups[task.status]) {
        groups[task.status] = []
      }
      groups[task.status].push(task)
    })

    return groups
  }

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

    return (
      <Card className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
        isOverdue ? 'border-red-200 bg-red-50' : ''
      }`}>
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
              {task.title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setSelectedTask(task)}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Priority Badge */}
          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(task.dueDate), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          )}

          {/* Assignees */}
          {task.assignees.length > 0 && (
            <div className="flex items-center gap-1">
              {task.assignees.slice(0, 3).map(assignment => (
                <div
                  key={assignment.userId}
                  className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center"
                  title={assignment.user.name || assignment.user.email}
                >
                  {(assignment.user.name || assignment.user.email).charAt(0).toUpperCase()}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{task.assignees.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map(taskTag => (
                <Badge
                  key={taskTag.tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{ 
                    borderColor: taskTag.tag.color,
                    color: taskTag.tag.color 
                  }}
                >
                  <Hash className="w-2 h-2 mr-1" />
                  {taskTag.tag.name}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Status Change */}
          <Select
            value={task.status}
            onValueChange={(newStatus) => handleUpdateTask(task.id, { status: newStatus })}
          >
            <SelectTrigger className="text-xs h-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">A Fazer</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="review">Em Revisão</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const taskGroups = groupTasksByStatus(tasks || [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tarefas</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title">Título</Label>
                <Input
                  id="task-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da tarefa"
                />
              </div>
              
              <div>
                <Label htmlFor="task-description">Descrição</Label>
                <Textarea
                  id="task-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskPriority.URGENT}>Urgente</SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>Alta</SelectItem>
                      <SelectItem value={TaskPriority.NORMAL}>Normal</SelectItem>
                      <SelectItem value={TaskPriority.LOW}>Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="task-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">A Fazer</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="review">Em Revisão</SelectItem>
                      <SelectItem value="done">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="task-due">Data de Vencimento</Label>
                <Input
                  id="task-due"
                  type="date"
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dueDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTask} disabled={!formData.title.trim()}>
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(taskGroups).map(([status, statusTasks]) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                {status === 'todo' && 'A Fazer'}
                {status === 'in_progress' && 'Em Progresso'}
                {status === 'review' && 'Em Revisão'}
                {status === 'done' && 'Concluído'}
              </h4>
              <Badge variant="outline" className="text-xs">
                {statusTasks.length}
              </Badge>
            </div>
            
            <div className={`min-h-[200px] p-2 rounded-lg border-2 border-dashed ${
              statusColors[status as keyof typeof statusColors]
            }`}>
              <div className="space-y-2">
                {statusTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Tarefa</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <p className="text-sm font-medium">{selectedTask.title}</p>
              </div>
              
              {selectedTask.description && (
                <div>
                  <Label>Descrição</Label>
                  <p className="text-sm text-gray-600">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Badge className={priorityColors[selectedTask.priority]}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Badge className={statusColors[selectedTask.status as keyof typeof statusColors]}>
                    {selectedTask.status}
                  </Badge>
                </div>
              </div>

              {selectedTask.dueDate && (
                <div>
                  <Label>Data de Vencimento</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedTask.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteTask(selectedTask.id)
                    setSelectedTask(null)
                  }}
                >
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TaskBoard
