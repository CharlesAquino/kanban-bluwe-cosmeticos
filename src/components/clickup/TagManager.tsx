/**
 * Componente para gerenciar tags (ClickUp-style)
 */

import React, { useState } from 'react'
import { Tag, Plus, X, Edit2, Trash2, Hash } from 'lucide-react'
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useClickup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CreateTagForm } from '@/types/clickup-types'

interface TagManagerProps {
  entityType?: 'product' | 'semiFinished' | 'task'
  entityId?: string
  selectedTags?: string[]
  onTagSelect?: (tagId: string) => void
  onTagUnselect?: (tagId: string) => void
  readOnly?: boolean
}

export const TagManager: React.FC<TagManagerProps> = ({
  entityType,
  entityId,
  selectedTags = [],
  onTagSelect,
  onTagUnselect,
  readOnly = false
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState<CreateTagForm>({
    name: '',
    color: '#3B82F6',
    description: ''
  })

  const { data: tags, isLoading } = useTags()
  const createTagMutation = useCreateTag()
  const updateTagMutation = useUpdateTag()
  const deleteTagMutation = useDeleteTag()

  const handleCreateTag = async () => {
    if (!formData.name.trim()) return

    try {
      await createTagMutation.mutateAsync(formData)
      setFormData({ name: '', color: '#3B82F6', description: '' })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Erro ao criar tag:', error)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !formData.name.trim()) return

    try {
      await updateTagMutation.mutateAsync({ 
        id: editingTag.id, 
        data: formData 
      })
      setEditingTag(null)
      setFormData({ name: '', color: '#3B82F6', description: '' })
    } catch (error) {
      console.error('Erro ao atualizar tag:', error)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return

    try {
      await deleteTagMutation.mutateAsync(tagId)
    } catch (error) {
      console.error('Erro ao excluir tag:', error)
    }
  }

  const startEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || ''
    })
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setFormData({ name: '', color: '#3B82F6', description: '' })
  }

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ]

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Carregando tags...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tags Selecionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tagId => {
            const tag = tags?.find(t => t.id === tagId)
            if (!tag) return null
            
            return (
              <Badge
                key={tag.id}
                variant="secondary"
                className="px-2 py-1 text-xs font-medium cursor-pointer hover:bg-gray-200"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                onClick={() => onTagUnselect?.(tag.id)}
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag.name}
                {!readOnly && <X className="w-3 h-3 ml-1" />}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Tags Disponíveis */}
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          {tags?.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
            <Badge
              key={tag.id}
              variant="outline"
              className="px-2 py-1 text-xs font-medium cursor-pointer hover:bg-gray-100"
              style={{ borderColor: tag.color, color: tag.color }}
              onClick={() => onTagSelect?.(tag.id)}
            >
              <Hash className="w-3 h-3 mr-1" />
              {tag.name}
              <span className="ml-1 text-xs opacity-60">({tag.usageCount})</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Ações */}
      {!readOnly && (
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da tag"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição opcional"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTag} disabled={!formData.name.trim()}>
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {tags && tags.length > 0 && (
            <Dialog open={!!editingTag} onOpenChange={(open) => !open && cancelEdit()}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Tag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome da tag"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição opcional"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Cor</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateTag} disabled={!formData.name.trim()}>
                      Atualizar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* Lista de Tags (para gerenciamento) */}
      {!readOnly && tags && tags.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Todas as Tags</h3>
          <div className="space-y-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm font-medium">{tag.name}</span>
                  <span className="text-xs text-gray-500">({tag.usageCount} usos)</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditTag(tag)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default TagManager
