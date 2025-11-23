'use client'

import React, { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar, User, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  dueDate?: Date
  assignees?: Array<{
    id: string
    name: string
    avatar?: string
  }>
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

interface Column {
  id: string
  title: string
  status: Task['status']
  color: string
  icon: React.ReactNode
}

const columns: Column[] = [
  {
    id: 'TODO',
    title: 'A Fazer',
    status: 'TODO',
    color: 'bg-gray-100 border-gray-200',
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: 'IN_PROGRESS',
    title: 'Em Progresso',
    status: 'IN_PROGRESS',
    color: 'bg-blue-100 border-blue-200',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  {
    id: 'REVIEW',
    title: 'Revisão',
    status: 'REVIEW',
    color: 'bg-orange-100 border-orange-200',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  {
    id: 'DONE',
    title: 'Concluído',
    status: 'DONE',
    color: 'bg-green-100 border-green-200',
    icon: <CheckCircle className="w-4 h-4" />
  }
]

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

const priorityLabels = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente'
}

// Componente para Task Card com drag & drop
function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.dueDate && isBefore(task.dueDate, new Date())
  const isDueSoon = task.dueDate && isAfter(task.dueDate, new Date()) && isBefore(task.dueDate, addDays(new Date(), 3))

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <Badge className={priorityColors[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' :
              isDueSoon ? 'text-orange-600' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}
            </div>
          )}

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <Avatar key={assignee.id} className="w-5 h-5 border-2 border-white">
                    <AvatarFallback className="text-xs">
                      {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {task.assignees.length > 3 && (
                <span className="text-xs text-gray-500">+{task.assignees.length - 3}</span>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tagId) => (
                <Badge key={tagId} variant="outline" className="text-xs px-1 py-0">
                  Tag {tagId}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para Column
function TaskColumn({
  column,
  tasks,
  onCreateTask
}: {
  column: Column
  tasks: Task[]
  onCreateTask: () => void
}) {
  const columnTasks = tasks.filter(task => task.status === column.status)

  return (
    <Card className={`min-h-[600px] ${column.color}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {column.icon}
            {column.title}
            <Badge variant="secondary" className="text-xs">
              {columnTasks.length}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCreateTask}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  )
}

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Analisar requisitos do cliente',
      description: 'Revisar documentação e especificações técnicas',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: addDays(new Date(), 2),
      assignees: [{ id: '1', name: 'João Silva' }],
      tags: ['urgent', 'client'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Implementar autenticação',
      description: 'Configurar NextAuth com Google e GitHub',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      dueDate: addDays(new Date(), 1),
      assignees: [{ id: '2', name: 'Maria Santos' }, { id: '3', name: 'Pedro Costa' }],
      tags: ['auth', 'security'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Criar testes automatizados',
      description: 'Configurar Jest e criar testes unitários',
      priority: 'NORMAL',
      status: 'REVIEW',
      dueDate: addDays(new Date(), 5),
      assignees: [{ id: '4', name: 'Ana Oliveira' }],
      tags: ['testing', 'quality'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ])

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the containers
    const activeTask = tasks.find(task => task.id === activeId)
    const overTask = tasks.find(task => task.id === overId)

    if (!activeTask) return

    // If dropping on another task
    if (overTask) {
      // If they're in different columns
      if (activeTask.status !== overTask.status) {
        setTasks(tasks => {
          const oldIndex = tasks.findIndex(task => task.id === activeId)
          const newIndex = tasks.findIndex(task => task.id === overId)

          const newTasks = [...tasks]
          newTasks[oldIndex] = { ...activeTask, status: overTask.status }
          return arrayMove(newTasks, oldIndex, newIndex)
        })
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Find tasks
    const activeTask = tasks.find(task => task.id === activeId)
    const overTask = tasks.find(task => task.id === overId)

    if (!activeTask) {
      setActiveId(null)
      return
    }

    // If dropping on another task in the same column, reorder
    if (overTask && activeTask.status === overTask.status) {
      setTasks(tasks => {
        const oldIndex = tasks.findIndex(task => task.id === activeId)
        const newIndex = tasks.findIndex(task => task.id === overId)
        return arrayMove(tasks, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null

  const handleCreateTask = (columnStatus: Task['status']) => {
    // TODO: Implement create task modal
    console.log('Create task for column:', columnStatus)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Board de Tarefas</h3>
          <p className="text-sm text-gray-600">
            Arraste as tarefas entre as colunas para atualizar o status
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Digite o título da tarefa" />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Descrição da tarefa" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">A Fazer</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="REVIEW">Revisão</SelectItem>
                      <SelectItem value="DONE">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">Criar Tarefa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasks}
              onCreateTask={() => handleCreateTask(column.status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {columns.map(column => {
          const count = tasks.filter(task => task.status === column.status).length
          return (
            <Card key={column.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {column.icon}
                    <span className="text-sm font-medium">{column.title}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default TaskBoard
