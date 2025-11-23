/**
 * Componente para gerenciar campos customizados (ClickUp-style)
 */

import React, { useState } from 'react'
import { Settings, Plus, Edit2, Trash2, Type, Hash, Calendar, CheckSquare, Link, Mail } from 'lucide-react'
import { useCustomFields, useCreateCustomField } from '@/hooks/useClickup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { CreateCustomFieldForm, CustomFieldType, CustomField } from '@/types/clickup-types'

interface CustomFieldManagerProps {
  entityType: 'product' | 'semiFinished'
  entityId?: string
  values?: Record<string, any>
  onChange?: (fieldId: string, value: any) => void
  readOnly?: boolean
}

export const CustomFieldManager: React.FC<CustomFieldManagerProps> = ({
  entityType,
  entityId,
  values = {},
  onChange,
  readOnly = false
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [formData, setFormData] = useState<CreateCustomFieldForm>({
    name: '',
    type: CustomFieldType.TEXT,
    required: false,
    options: [],
    defaultValue: '',
    entityType
  })

  const { data: customFields, isLoading } = useCustomFields(entityType)
  const createFieldMutation = useCreateCustomField()

  const handleCreateField = async () => {
    if (!formData.name.trim()) return

    try {
      await createFieldMutation.mutateAsync(formData)
      setFormData({
        name: '',
        type: CustomFieldType.TEXT,
        required: false,
        options: [],
        defaultValue: '',
        entityType
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Erro ao criar campo:', error)
    }
  }

  const startEditField = (field: CustomField) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options || [],
      defaultValue: field.defaultValue || '',
      entityType
    })
  }

  const cancelEdit = () => {
    setEditingField(null)
    setFormData({
      name: '',
      type: CustomFieldType.TEXT,
      required: false,
      options: [],
      defaultValue: '',
      entityType
    })
  }

  const renderFieldValue = (field: CustomField) => {
    const value = values[field.id]
    
    if (readOnly) {
      return <div className="text-sm text-gray-700">{formatValue(value, field.type)}</div>
    }

    switch (field.type) {
      case CustomFieldType.TEXT:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange?.(field.id, e.target.value)}
            placeholder={field.name}
          />
        )
      
      case CustomFieldType.NUMBER:
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.name}
          />
        )
      
      case CustomFieldType.DROPDOWN:
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => onChange?.(field.id, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${field.name}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case CustomFieldType.DATE:
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange?.(field.id, e.target.value ? new Date(e.target.value) : null)}
          />
        )
      
      case CustomFieldType.CHECKBOX:
        return (
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => onChange?.(field.id, checked)}
          />
        )
      
      case CustomFieldType.URL:
        return (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange?.(field.id, e.target.value)}
            placeholder="https://..."
          />
        )
      
      case CustomFieldType.EMAIL:
        return (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => onChange?.(field.id, e.target.value)}
            placeholder="email@exemplo.com"
          />
        )
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange?.(field.id, e.target.value)}
            placeholder={field.name}
          />
        )
    }
  }

  const formatValue = (value: any, type: CustomFieldType) => {
    if (value === null || value === undefined) return '-'
    
    switch (type) {
      case CustomFieldType.DATE:
        return new Date(value).toLocaleDateString('pt-BR')
      case CustomFieldType.CHECKBOX:
        return value ? 'Sim' : 'Não'
      case CustomFieldType.DROPDOWN:
      case CustomFieldType.TEXT:
      case CustomFieldType.URL:
      case CustomFieldType.EMAIL:
        return String(value)
      case CustomFieldType.NUMBER:
        return typeof value === 'number' ? value.toFixed(2) : String(value)
      default:
        return String(value)
    }
  }

  const getFieldIcon = (type: CustomFieldType) => {
    switch (type) {
      case CustomFieldType.TEXT:
      case CustomFieldType.EMAIL:
        return <Type className="w-4 h-4" />
      case CustomFieldType.NUMBER:
        return <Hash className="w-4 h-4" />
      case CustomFieldType.DATE:
        return <Calendar className="w-4 h-4" />
      case CustomFieldType.CHECKBOX:
        return <CheckSquare className="w-4 h-4" />
      case CustomFieldType.URL:
        return <Link className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Carregando campos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Campos Customizados */}
      {customFields && customFields.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Campos Customizados</h3>
          <div className="space-y-3">
            {customFields
              .filter(field => field.isActive)
              .sort((a, b) => a.order - b.order)
              .map(field => (
                <div key={field.id} className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    {getFieldIcon(field.type)}
                    {field.name}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderFieldValue(field)}
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Ações de Gerenciamento */}
      {!readOnly && (
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Campo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Campo Customizado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="field-name">Nome</Label>
                  <Input
                    id="field-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do campo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="field-type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: CustomFieldType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CustomFieldType.TEXT}>Texto</SelectItem>
                      <SelectItem value={CustomFieldType.NUMBER}>Número</SelectItem>
                      <SelectItem value={CustomFieldType.DROPDOWN}>Lista Suspensa</SelectItem>
                      <SelectItem value={CustomFieldType.DATE}>Data</SelectItem>
                      <SelectItem value={CustomFieldType.CHECKBOX}>Caixa de Seleção</SelectItem>
                      <SelectItem value={CustomFieldType.URL}>URL</SelectItem>
                      <SelectItem value={CustomFieldType.EMAIL}>Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === CustomFieldType.DROPDOWN && (
                  <div>
                    <Label>Opções (uma por linha)</Label>
                    <Textarea
                      value={formData.options?.join('\n') || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      })}
                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                      rows={4}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="field-default">Valor Padrão</Label>
                  <Input
                    id="field-default"
                    value={formData.defaultValue || ''}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    placeholder="Valor padrão (opcional)"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="field-required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                  />
                  <Label htmlFor="field-required">Obrigatório</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateField} disabled={!formData.name.trim()}>
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {customFields && customFields.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Gerenciar
            </Button>
          )}
        </div>
      )}

      {/* Lista de Campos (para gerenciamento) */}
      {!readOnly && customFields && customFields.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Todos os Campos</h3>
          <div className="space-y-2">
            {customFields.map(field => (
              <div key={field.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  {getFieldIcon(field.type)}
                  <span className="text-sm font-medium">{field.name}</span>
                  <span className="text-xs text-gray-500">{field.type}</span>
                  {field.required && <span className="text-xs text-red-500">*</span>}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditField(field)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
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

export default CustomFieldManager
